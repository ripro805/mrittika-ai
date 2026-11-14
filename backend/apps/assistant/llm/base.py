"""
Base interface and common exceptions for LLM providers in Mrittika AI.
"""

import os
import re
from abc import ABC, abstractmethod
from typing import Dict, Generator, List, Optional, Union


def redact_secrets(text: str) -> str:
    """
    Redacts API keys and sensitive tokens from error messages, stack traces, and logs.
    """
    if not text:
        return ""
    s = str(text)

    # Redact known environment keys if present
    for key_env in ("GROQ_API_KEY", "GEMINI_API_KEY", "HF_TOKEN", "SECRET_KEY"):
        val = os.getenv(key_env)
        if val and len(val) >= 4:
            s = s.replace(val, f"[REDACTED_{key_env}]")

    # Generic pattern matching
    s = re.sub(r"gsk_[a-zA-Z0-9]{20,}", "[REDACTED_GROQ_KEY]", s)
    s = re.sub(r"AIza[0-9A-Za-z\-_]{35}", "[REDACTED_GEMINI_KEY]", s)
    s = re.sub(r"Bearer\s+[a-zA-Z0-9_\-\.]{15,}", "Bearer [REDACTED_TOKEN]", s)
    s = re.sub(r"(?i)key=([a-zA-Z0-9_\-]{15,})", "key=[REDACTED_KEY]", s)
    return s


class ProviderError(Exception):
    """Base exception for all LLM provider failures."""
    def __init__(self, message: str, provider_name: str = "unknown"):
        super().__init__(redact_secrets(message))
        self.provider_name = provider_name


class RateLimitError(ProviderError):
    """Raised when 429 Too Many Requests or rate limits are reached."""
    def __init__(self, message: str, retry_after: Optional[int] = None, provider_name: str = "unknown"):
        super().__init__(message, provider_name)
        self.retry_after = retry_after


class QuotaExceededError(ProviderError):
    """Raised when soft or hard daily/monthly quotas are exhausted."""
    pass


class ProviderTimeoutError(ProviderError):
    """Raised when request times out."""
    pass


class MalformedOutputError(ProviderError):
    """Raised when provider returns invalid or empty JSON/content."""
    pass


class ProviderAPIError(ProviderError):
    """Raised on 5xx or unhandled API responses."""
    def __init__(self, message: str, status_code: Optional[int] = None, provider_name: str = "unknown"):
        super().__init__(message, provider_name)
        self.status_code = status_code


class BaseLLMProvider(ABC):
    """
    Abstract interface for LLM provider backends.
    """

    @abstractmethod
    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        max_tokens: int = 600,
        temperature: float = 0.2,
    ) -> Union[str, Generator[str, None, None]]:
        """
        Generates text or yields token stream from chat messages.
        messages format: [{"role": "system"|"user"|"assistant", "content": "..."}]
        """
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Returns the configured model identifier."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the required credentials/environment are present."""
        pass
