"""
Groq LLM Provider implementation targeting https://api.groq.com/openai/v1/chat/completions
"""

import json
import logging
import os
from typing import Dict, Generator, List, Union

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

GROQ_DEFAULT_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_TIMEOUT = 12.0


class GroqProvider(BaseLLMProvider):
    """
    Groq OpenAI-compatible chat completion provider with streaming SSE and non-streaming support.
    """

    def __init__(self, api_key: str = None, model: str = None, endpoint: str = None, timeout: float = None):
        self.api_key = api_key if api_key is not None else os.getenv("GROQ_API_KEY", "")
        self.model = model if model is not None else os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        self.endpoint = endpoint or os.getenv("GROQ_ENDPOINT", GROQ_DEFAULT_ENDPOINT)
        self.timeout = timeout or float(os.getenv("GROQ_TIMEOUT_SECONDS", str(DEFAULT_GROQ_TIMEOUT)))

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def get_model_name(self) -> str:
        return self.model

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        max_tokens: int = 600,
        temperature: float = 0.2,
    ) -> Union[str, Generator[str, None, None]]:
        if not self.is_configured():
            raise ProviderAPIError("GROQ_API_KEY is not configured.", provider_name="groq")

        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Content-Type": "application/json",
            "User-Agent": "MrittikaAI/2.0 (Agricultural Assistant)",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": stream,
        }

        try:
            response = requests.post(
                self.endpoint,
                headers=headers,
                json=payload,
                timeout=self.timeout,
                stream=stream,
            )
        except requests.exceptions.Timeout as e:
            raise ProviderTimeoutError(f"Groq request timed out after {self.timeout}s: {e}", provider_name="groq") from e
        except requests.exceptions.RequestException as e:
            raise ProviderAPIError(f"Groq network error: {e}", provider_name="groq") from e

        # Handle rate limits
        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After")
            retry_seconds = None
            if retry_after:
                try:
                    retry_seconds = int(retry_after)
                except ValueError:
                    pass
            raise RateLimitError(
                f"Groq rate limit (429) hit. Response: {redact_secrets(response.text[:200])}",
                retry_after=retry_seconds,
                provider_name="groq",
            )

        # Handle 5xx or bad responses
        if response.status_code >= 400:
            raise ProviderAPIError(
                f"Groq API returned HTTP {response.status_code}: {redact_secrets(response.text[:300])}",
                status_code=response.status_code,
                provider_name="groq",
            )

        if not stream:
            try:
                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise MalformedOutputError("Groq response contains no choices.", provider_name="groq")
                content = choices[0].get("message", {}).get("content", "")
                if not content:
                    raise MalformedOutputError("Groq response message content is empty.", provider_name="groq")
                return content.strip()
            except (json.JSONDecodeError, KeyError, IndexError) as e:
                raise MalformedOutputError(f"Failed to parse Groq response JSON: {e}", provider_name="groq") from e
        else:
            return self._stream_generator(response)

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
                if data_part == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_part)
                    choices = chunk.get("choices", [])
                    if choices:
                        delta = choices[0].get("delta", {})
                        token = delta.get("content")
                        if token:
                            yield token
                except json.JSONDecodeError:
                    continue
        except Exception as e:
            logger.warning("Error during Groq SSE stream consumption: %s", redact_secrets(str(e)))
            raise ProviderAPIError(f"Stream interrupted: {e}", provider_name="groq") from e
        finally:
            response.close()
