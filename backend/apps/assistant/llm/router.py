"""
LLM Router with priority failover, circuit breaker, soft quotas, jittered retry, and caching.
"""

import hashlib
import logging
import os
import random
import threading
import time
from collections import deque
from typing import Any, Dict, List, Optional, Tuple

from django.core.cache import cache

from .base import (
    BaseLLMProvider,
    MalformedOutputError,
    ProviderAPIError,
    ProviderTimeoutError,
    RateLimitError,
    redact_secrets,
)
from .gemini import GeminiProvider
from .groq import GroqProvider
from .mock import MockProvider

logger = logging.getLogger(__name__)

OFFICER_FALLBACK_BN = (
    "আমি এই বিষয়ে পুরোপুরি নিশ্চিত নই। বিস্তারিত ও সঠিক পরামর্শের জন্য অনুগ্রহ করে আপনার "
    "স্থানীয় উপজেলা কৃষি কর্মকর্তা বা উপসহকারী কৃষি কর্মকর্তার (SAAO) সাথে যোগাযোগ করুন।"
)


def estimate_tokens(text: str) -> int:
    """Approximate token estimation for mixed Bangla, English, and punctuation."""
    if not text:
        return 0
    # On average, Bengali words are 5-8 chars, ~1.5 - 2 tokens per word in subword BPE
    words = text.split()
    return int(len(words) * 1.5) + len(text) // 10


def redact_pii(text: str) -> str:
    """
    Strips phone numbers, emails, and Bangladeshi National ID (NID) patterns from text.
    """
    if not text:
        return ""
    # Bangladesh phone numbers (e.g. 017xxxxxxxx, +88017xxxxxxxx, 018-xxxxxxxx)
    s = re_phone.sub("[REDACTED_PHONE]", text)
    # Emails
    s = re_email.sub("[REDACTED_EMAIL]", s)
    # NID (10, 13, or 17 digit numbers)
    s = re_nid.sub("[REDACTED_NID]", s)
    return s


import re

re_phone = re.compile(r"(?:\+?880\s?|0)1[3-9]\d{2}[-\s]?\d{6}\b")
re_email = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
re_nid = re.compile(r"\b(?:\d{10}|\d{13}|\d{17})\b")


class CircuitBreaker:
    """
    Per-provider circuit breaker tracking consecutive failures.
    Opens for cooldown_seconds after max_failures consecutive failures.
    """

    def __init__(self, max_failures: int = 5, cooldown_seconds: float = 60.0):
        self.max_failures = max_failures
        self.cooldown_seconds = cooldown_seconds
        self.failure_count = 0
        self.state = "CLOSED"  # "CLOSED" or "OPEN"
        self.opened_at: Optional[float] = None
        self._lock = threading.Lock()

    def record_success(self) -> None:
        with self._lock:
            self.failure_count = 0
            self.state = "CLOSED"
            self.opened_at = None

    def record_failure(self) -> None:
        with self._lock:
            self.failure_count += 1
            if self.failure_count >= self.max_failures:
                self.state = "OPEN"
                self.opened_at = time.time()
                logger.warning("Circuit breaker opened for provider (failures=%d)", self.failure_count)

    def is_available(self) -> bool:
        with self._lock:
            if self.state == "CLOSED":
                return True
            # In OPEN state, check if cooldown has elapsed
            if self.opened_at and (time.time() - self.opened_at >= self.cooldown_seconds):
                # Transition to HALF-OPEN: allow trial request
                logger.info("Circuit breaker cooldown elapsed; transitioning to trial call")
                return True
            return False


class SoftQuotaTracker:
    """
    In-process sliding window counter for Requests Per Minute (RPM) and Requests Per Day (RPD).
    """

    def __init__(self, rpm_soft: int, rpd_soft: int):
        self.rpm_soft = rpm_soft
        self.rpd_soft = rpd_soft
        self.minute_timestamps: deque = deque()
        self.day_timestamps: deque = deque()
        self._lock = threading.Lock()

    def can_request(self) -> bool:
        now = time.time()
        with self._lock:
            # Clean minute window
            while self.minute_timestamps and now - self.minute_timestamps[0] > 60:
                self.minute_timestamps.popleft()
            # Clean day window
            while self.day_timestamps and now - self.day_timestamps[0] > 86400:
                self.day_timestamps.popleft()

            if len(self.minute_timestamps) >= self.rpm_soft:
                return False
            if len(self.day_timestamps) >= self.rpd_soft:
                return False
            return True

    def record_request(self) -> None:
        now = time.time()
        with self._lock:
            self.minute_timestamps.append(now)
            self.day_timestamps.append(now)


class LLMRouter:
    """
    Central router that manages provider instances, retry with jitter, circuit breakers,
    soft quotas, response caching, and graceful retrieval-only fallback.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self.circuit_breakers: Dict[str, CircuitBreaker] = {
            "groq": CircuitBreaker(max_failures=5, cooldown_seconds=60.0),
            "gemini": CircuitBreaker(max_failures=5, cooldown_seconds=60.0),
            "mock": CircuitBreaker(max_failures=10, cooldown_seconds=5.0),
        }
        self.cooldown_until: Dict[str, float] = {}

        # Default soft limits for free tiers
        groq_rpm = int(os.getenv("GROQ_RPM_SOFT", "25"))
        groq_rpd = int(os.getenv("GROQ_RPD_SOFT", "12000"))
        gemini_rpm = int(os.getenv("GEMINI_RPM_SOFT", "12"))
        gemini_rpd = int(os.getenv("GEMINI_RPD_SOFT", "1200"))

        self.quota_trackers: Dict[str, SoftQuotaTracker] = {
            "groq": SoftQuotaTracker(groq_rpm, groq_rpd),
            "gemini": SoftQuotaTracker(gemini_rpm, gemini_rpd),
            "mock": SoftQuotaTracker(100000, 1000000),
        }

    def get_provider_instances(self) -> Dict[str, BaseLLMProvider]:
        return {
            "groq": GroqProvider(),
            "gemini": GeminiProvider(),
            "mock": MockProvider(),
        }

    def get_configured_order(self) -> List[str]:
        raw = os.getenv("LLM_PROVIDER_ORDER", "groq,gemini")
        order = [p.strip().lower() for p in raw.split(",") if p.strip()]
        # If order is empty or does not contain mock, keep mock as ultimate candidate
        if "mock" not in order:
            order.append("mock")
        return order

    def _is_provider_ready(self, name: str, provider: BaseLLMProvider) -> Tuple[bool, str]:
        # 1. Credentials configured
        if not provider.is_configured():
            return False, "Not configured with credentials"

        now = time.time()
        # 2. Temporary Retry-After cooldown
        if name in self.cooldown_until and now < self.cooldown_until[name]:
            return False, f"In Retry-After cooldown for {int(self.cooldown_until[name] - now)}s"

        # 3. Circuit breaker
        cb = self.circuit_breakers.get(name)
        if cb and not cb.is_available():
            return False, "Circuit breaker is OPEN"

        # 4. Soft quota check
        tracker = self.quota_trackers.get(name)
        if tracker and not tracker.can_request():
            return False, "Soft RPM/RPD limit reached"

        return True, "Ready"

    def _cache_key(self, query: str, context_str: str) -> str:
        h = hashlib.sha256(f"{query.strip()}||{context_str.strip()}".encode("utf-8")).hexdigest()
        return f"mrittika_assistant_llm_cache_{h}"

    def generate(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        cache_ttl: int = 3600,
        context_chunks: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executes query through the provider hierarchy with caching, jittered retries,
        circuit breaker tracking, and graceful fallback.
        """
        providers = self.get_provider_instances()
        order = self.get_configured_order()

        # Cache check (for non-streaming or full answer caching)
        user_content = next((m.get("content", "") for m in reversed(messages) if m.get("role") == "user"), "")
        system_content = next((m.get("content", "") for m in messages if m.get("role") == "system"), "")
        cache_key = self._cache_key(user_content, system_content)

        if not stream:
            cached_res = cache.get(cache_key)
            if cached_res:
                logger.info("Assistant LLM response served from cache.")
                return cached_res

        last_error = None

        for name in order:
            provider = providers.get(name)
            if not provider:
                continue

            ready, reason = self._is_provider_ready(name, provider)
            if not ready:
                logger.info("Skipping provider '%s': %s", name, reason)
                continue

            # Record soft quota usage
            tracker = self.quota_trackers.get(name)
            if tracker:
                tracker.record_request()

            # Execute with 1x jittered retry on failure
            for attempt in range(2):
                try:
                    logger.info("Attempting LLM call via '%s' (model: %s, attempt: %d)", name, provider.get_model_name(), attempt + 1)

                    if not stream:
                        text = provider.generate(messages, stream=False)
                        cb = self.circuit_breakers.get(name)
                        if cb:
                            cb.record_success()

                        res = {
                            "answer": text,
                            "provider_used": name,
                            "fallback": "উপজেলা কৃষি কর্মকর্তা" in text,
                            "cached": False,
                        }
                        # Save in cache if not a fallback
                        if not res["fallback"]:
                            cache.set(cache_key, res, cache_ttl)
                        return res
                    else:
                        token_generator = provider.generate(messages, stream=True)
                        cb = self.circuit_breakers.get(name)
                        if cb:
                            cb.record_success()
                        return {
                            "stream_generator": token_generator,
                            "provider_used": name,
                            "fallback": False,
                        }
                except RateLimitError as e:
                    last_error = e
                    logger.warning("Provider '%s' hit rate limit: %s", name, redact_secrets(str(e)))
                    if e.retry_after:
                        self.cooldown_until[name] = time.time() + e.retry_after
                    cb = self.circuit_breakers.get(name)
                    if cb:
                        cb.record_failure()
                    break  # Do not retry immediately on 429 rate limit
                except (ProviderTimeoutError, ProviderAPIError, MalformedOutputError) as e:
                    last_error = e
                    logger.warning("Provider '%s' error (attempt %d): %s", name, attempt + 1, redact_secrets(str(e)))
                    cb = self.circuit_breakers.get(name)
                    if cb:
                        cb.record_failure()
                    if attempt == 0:
                        # Jittered backoff before second attempt
                        jitter = 0.5 + random.uniform(0.1, 0.4)  # nosec B311
                        time.sleep(jitter)
                        continue
                    break

        # If ALL configured providers fail: degrade gracefully to retrieval-only reply
        logger.error("All LLM providers failed or exhausted. Degrading to retrieval-only response. Last error: %s", redact_secrets(str(last_error)))
        fallback_answer = self._synthesize_retrieval_fallback(context_chunks)

        if not stream:
            return {
                "answer": fallback_answer,
                "provider_used": "retrieval_fallback",
                "fallback": True,
                "error_detail": redact_secrets(str(last_error)) if os.getenv("DEBUG") == "True" else None,
            }
        else:
            # Wrap text in a generator for streaming API
            def _fallback_gen():
                for tok in fallback_answer.split():
                    yield tok + " "
            return {
                "stream_generator": _fallback_gen(),
                "provider_used": "retrieval_fallback",
                "fallback": True,
            }

    def _synthesize_retrieval_fallback(self, context_chunks: Optional[List[Dict[str, Any]]]) -> str:
        """
        Constructs a helpful, grounded response using raw source excerpts when all LLMs are down.
        """
        if not context_chunks:
            return OFFICER_FALLBACK_BN

        excerpts = []
        for i, c in enumerate(context_chunks[:2]):
            content = c.get("content", "").strip()
            source = c.get("source", "নথি")
            page = c.get("page", "১")
            # Take first 150 chars
            clean_snippet = content[:200].replace("\n", " ")
            excerpts.append(f"• \"{clean_snippet}...\" [{source}, পৃ. {page}]")

        excerpts_str = "\n".join(excerpts)
        return (
            f"কৃষি নির্দেশিকা থেকে প্রাপ্ত প্রাসঙ্গিক অংশ:\n{excerpts_str}\n\n"
            f"নোট: সম্পূর্ণ বিশ্লেষণ ও সুনির্দিষ্ট পরামর্শের জন্য অনুগ্রহ করে আপনার স্থানীয় "
            f"উপজেলা কৃষি কর্মকর্তা বা উপসহকারী কৃষি কর্মকর্তার (SAAO) সাথে যোগাযোগ করুন।"
        )


_ROUTER_SINGLETON: Optional[LLMRouter] = None


def get_llm_router() -> LLMRouter:
    global _ROUTER_SINGLETON
    if _ROUTER_SINGLETON is None:
        _ROUTER_SINGLETON = LLMRouter()
    return _ROUTER_SINGLETON
