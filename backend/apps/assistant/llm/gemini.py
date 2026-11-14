"""
Google Gemini LLM Provider implementation using the Google Generative Language REST API.
"""

import json
import logging
import os
from typing import Any, Dict, Generator, List, Tuple, Union

import requests

from .base import (
    BaseLLMProvider,
    MalformedOutputError,
    ProviderAPIError,
    ProviderTimeoutError,
    RateLimitError,
    redact_secrets,
)

logger = logging.getLogger(__name__)

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_GEMINI_TIMEOUT = 15.0


class GeminiProvider(BaseLLMProvider):
    """
    Google Gemini REST API provider supporting standard generation and SSE streaming.
    """

    def __init__(self, api_key: str = None, model: str = None, timeout: float = None):
        self.api_key = api_key if api_key is not None else os.getenv("GEMINI_API_KEY", "")
        self.model = model if model is not None else os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
        self.timeout = timeout or float(os.getenv("GEMINI_TIMEOUT_SECONDS", str(DEFAULT_GEMINI_TIMEOUT)))

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def get_model_name(self) -> str:
        return self.model

    def _convert_messages_to_gemini(
        self, messages: List[Dict[str, str]]
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        system_instruction = None
        contents = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                # Combine system messages if multiple
                if system_instruction is None:
                    system_instruction = {"parts": [{"text": content}]}
                else:
                    system_instruction["parts"].append({"text": content})
            elif role == "assistant":
                contents.append({"role": "model", "parts": [{"text": content}]})
            else:
                contents.append({"role": "user", "parts": [{"text": content}]})

        if not contents:
            contents.append({"role": "user", "parts": [{"text": ""}]})

        return system_instruction, contents

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        max_tokens: int = 600,
        temperature: float = 0.2,
    ) -> Union[str, Generator[str, None, None]]:
        if not self.is_configured():
            raise ProviderAPIError("GEMINI_API_KEY is not configured.", provider_name="gemini")

        system_instruction, contents = self._convert_messages_to_gemini(messages)

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }
        if system_instruction:
            payload["systemInstruction"] = system_instruction

        headers = {
            "x-goog-api-key": self.api_key.strip(),
            "Content-Type": "application/json",
            "User-Agent": "MrittikaAI/2.0 (Agricultural Assistant)",
        }

        if not stream:
            url = f"{GEMINI_BASE_URL}/{self.model}:generateContent"
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=self.timeout,
                )
            except requests.exceptions.Timeout as e:
                raise ProviderTimeoutError(f"Gemini request timed out after {self.timeout}s: {e}", provider_name="gemini") from e
            except requests.exceptions.RequestException as e:
                raise ProviderAPIError(f"Gemini network error: {e}", provider_name="gemini") from e

            self._check_status_code(response)

            try:
                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise MalformedOutputError("Gemini response contains no candidates.", provider_name="gemini")
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts:
                    raise MalformedOutputError("Gemini candidate has no parts.", provider_name="gemini")
                text = "".join(p.get("text", "") for p in parts)
                if not text:
                    raise MalformedOutputError("Gemini output text is empty.", provider_name="gemini")
                return text.strip()
            except (json.JSONDecodeError, KeyError, IndexError) as e:
                raise MalformedOutputError(f"Failed to parse Gemini response JSON: {e}", provider_name="gemini") from e
        else:
            url = f"{GEMINI_BASE_URL}/{self.model}:streamGenerateContent?alt=sse"
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=self.timeout,
                    stream=True,
                )
            except requests.exceptions.Timeout as e:
                raise ProviderTimeoutError(f"Gemini request timed out after {self.timeout}s: {e}", provider_name="gemini") from e
            except requests.exceptions.RequestException as e:
                raise ProviderAPIError(f"Gemini network error: {e}", provider_name="gemini") from e

            self._check_status_code(response)
            return self._stream_generator(response)

    def _check_status_code(self, response: requests.Response) -> None:
        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")
            retry_seconds = None
            if retry_after:
                try:
                    retry_seconds = int(retry_after)
                except ValueError:
                    pass
            raise RateLimitError(
                f"Gemini rate limit (429) hit. Response: {redact_secrets(response.text[:200])}",
                retry_after=retry_seconds,
                provider_name="gemini",
            )

        if response.status_code >= 400:
            raise ProviderAPIError(
                f"Gemini API returned HTTP {response.status_code}: {redact_secrets(response.text[:300])}",
                status_code=response.status_code,
                provider_name="gemini",
            )

    def _stream_generator(self, response: requests.Response) -> Generator[str, None, None]:
        try:
            for line in response.iter_lines():
                if not line:
                    continue
                line_str = line.decode("utf-8") if isinstance(line, bytes) else str(line)
                line_str = line_str.strip()
                if not line_str.startswith("data:"):
                    continue
                data_part = line_str[5:].strip()
                if not data_part:
                    continue
                try:
                    chunk = json.loads(data_part)
                    candidates = chunk.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        for part in parts:
                            t = part.get("text")
                            if t:
                                yield t
                except json.JSONDecodeError:
                    continue
        except Exception as e:
            logger.warning("Error during Gemini SSE stream consumption: %s", redact_secrets(str(e)))
            raise ProviderAPIError(f"Gemini stream interrupted: {e}", provider_name="gemini") from e
        finally:
            response.close()
