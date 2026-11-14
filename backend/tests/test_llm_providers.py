"""
Comprehensive unit tests for GroqProvider, GeminiProvider, MockProvider, and LLMRouter.
Uses mocked HTTP requests to verify success, failover, circuit breaker, soft quotas,
secret redaction, and caching without requiring external network or live API keys.
"""

from unittest.mock import MagicMock, patch

import pytest
import requests

from apps.assistant.llm.base import (
    MalformedOutputError,
    ProviderAPIError,
    ProviderTimeoutError,
    RateLimitError,
    redact_secrets,
)
from apps.assistant.llm.gemini import GeminiProvider
from apps.assistant.llm.groq import GroqProvider
from apps.assistant.llm.mock import MockProvider
from apps.assistant.llm.router import CircuitBreaker, LLMRouter, SoftQuotaTracker


# ---------------------------------------------------------
# Secret Redaction Tests
# ---------------------------------------------------------
def test_redact_secrets_masks_keys():
    fake_groq = "gsk_" + "1234567890abcdefghijklmnopqrstuvwxyz"
    fake_gemini = "AIzaSyD" + "1234567890abcdefghijklmnopqrstuvwxyz"
    text = f"Failed with {fake_groq} and key={fake_gemini} in Bearer token"
    redacted = redact_secrets(text)
    assert fake_groq not in redacted
    assert fake_gemini not in redacted
    assert "[REDACTED_GROQ_KEY]" in redacted
    assert "[REDACTED_GEMINI_KEY]" in redacted


# ---------------------------------------------------------
# Groq Provider Tests
# ---------------------------------------------------------
def test_groq_success_non_streaming():
    provider = GroqProvider(api_key="gsk_test123", model="openai/gpt-oss-120b")
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "choices": [{"message": {"content": "আমন ধানে সঠিক সময়ে ইউরিয়া প্রয়োগ করুন।"}}]
    }

    with patch("requests.post", return_value=mock_resp):
        messages = [{"role": "user", "content": "আমন ধানের সার"}]
        result = provider.generate(messages, stream=False)
        assert "ইউরিয়া" in result


def test_groq_429_rate_limit_with_retry_after():
    provider = GroqProvider(api_key="gsk_test123")
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.headers = {"Retry-After": "30"}
    mock_resp.text = "Rate limit exceeded for token per minute"

    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(RateLimitError) as exc_info:
            provider.generate([{"role": "user", "content": "টেস্ট"}])
        assert exc_info.value.retry_after == 30
        assert exc_info.value.provider_name == "groq"


def test_groq_5xx_server_error():
    provider = GroqProvider(api_key="gsk_test123")
    mock_resp = MagicMock()
    mock_resp.status_code = 503
    mock_resp.text = "Service Unavailable"

    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(ProviderAPIError) as exc_info:
            provider.generate([{"role": "user", "content": "টেস্ট"}])
        assert exc_info.value.status_code == 503


def test_groq_timeout():
    provider = GroqProvider(api_key="gsk_test123")
    with patch("requests.post", side_effect=requests.exceptions.Timeout("Read timeout")):
        with pytest.raises(ProviderTimeoutError):
            provider.generate([{"role": "user", "content": "টেস্ট"}])


def test_groq_malformed_json():
    provider = GroqProvider(api_key="gsk_test123")
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"choices": []}  # empty choices

    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(MalformedOutputError):
            provider.generate([{"role": "user", "content": "টেস্ট"}])


# ---------------------------------------------------------
# Gemini Provider Tests
# ---------------------------------------------------------
def test_gemini_success_non_streaming():
    provider = GeminiProvider(api_key="AIzaSyTestKey1234567890", model="gemini-2.5-flash-lite")
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "candidates": [{
            "content": {"parts": [{"text": "বোরো ধানে বিঘাপ্রতি ৩৫ কেজি ইউরিয়া দিন।"}]}
        }]
    }

    with patch("requests.post", return_value=mock_resp):
        messages = [
            {"role": "system", "content": "আপনি একজন কৃষিবিদ।"},
            {"role": "user", "content": "বোরো ধানের সার"},
        ]
        result = provider.generate(messages, stream=False)
        assert "৩৫ কেজি" in result


def test_gemini_429_rate_limit():
    provider = GeminiProvider(api_key="AIzaSyTestKey1234567890")
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.headers = {"Retry-After": "45"}
    mock_resp.text = "Quota exceeded"

    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(RateLimitError) as exc_info:
            provider.generate([{"role": "user", "content": "টেস্ট"}])
        assert exc_info.value.retry_after == 45


def test_gemini_malformed_empty_parts():
    provider = GeminiProvider(api_key="AIzaSyTestKey1234567890")
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"candidates": [{"content": {"parts": []}}]}

    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(MalformedOutputError):
            provider.generate([{"role": "user", "content": "টেস্ট"}])


# ---------------------------------------------------------
# Mock Provider Tests
# ---------------------------------------------------------
def test_mock_provider_deterministic_answer():
    provider = MockProvider()
    messages = [
        {"role": "system", "content": "<context>[বাংলাদেশ ধান গবেষণা ইনস্টিটিউট, পৃ. ৪]: আমন ধানে ৩ কিস্তিতে সার দিন।</context>"},
        {"role": "user", "content": "আমন ধানের সার কীভাবে দেব?"},
    ]
    ans = provider.generate(messages, stream=False)
    assert "আমন ধানে" in ans
    assert "[উৎস: বাংলাদেশ ধান গবেষণা ইনস্টিটিউট, পৃ. ৪]" in ans


def test_mock_provider_streaming():
    provider = MockProvider()
    messages = [
        {"role": "system", "content": "<context>[নথি, পৃ. ১]: আলুর যত্ন নিন।</context>"},
        {"role": "user", "content": "আলু"},
    ]
    tokens = list(provider.generate(messages, stream=True))
    assert len(tokens) > 0
    full = "".join(tokens)
    assert "আলু" in full


# ---------------------------------------------------------
# Circuit Breaker Tests
# ---------------------------------------------------------
def test_circuit_breaker_transitions():
    cb = CircuitBreaker(max_failures=3, cooldown_seconds=1.0)
    assert cb.is_available() is True
    assert cb.state == "CLOSED"

    cb.record_failure()
    cb.record_failure()
    assert cb.is_available() is True

    # 3rd failure trips breaker
    cb.record_failure()
    assert cb.state == "OPEN"
    assert cb.is_available() is False

    # After success, resets
    cb.record_success()
    assert cb.state == "CLOSED"
    assert cb.is_available() is True


# ---------------------------------------------------------
# Soft Quota Tracker Tests
# ---------------------------------------------------------
def test_soft_quota_tracker_blocks_excess():
    tracker = SoftQuotaTracker(rpm_soft=2, rpd_soft=10)
    assert tracker.can_request() is True

    tracker.record_request()
    tracker.record_request()
    # Now at 2 requests in minute window
    assert tracker.can_request() is False


# ---------------------------------------------------------
# Router Failover & Caching Tests
# ---------------------------------------------------------
@pytest.mark.django_db
def test_router_failover_groq_to_gemini():
    router = LLMRouter()
    groq_mock = MagicMock()
    groq_mock.is_configured.return_value = True
    groq_mock.generate.side_effect = RateLimitError("Groq 429", provider_name="groq")

    gemini_mock = MagicMock()
    gemini_mock.is_configured.return_value = True
    gemini_mock.generate.return_value = "Gemini থেকে পাওয়া সঠিক উত্তর।"

    with patch.object(router, "get_provider_instances", return_value={"groq": groq_mock, "gemini": gemini_mock}):
        with patch.object(router, "get_configured_order", return_value=["groq", "gemini"]):
            res = router.generate([{"role": "user", "content": "ফসল পরামর্শ"}], stream=False)
            assert res["provider_used"] == "gemini"
            assert "Gemini" in res["answer"]


@pytest.mark.django_db
def test_router_all_fail_degrades_gracefully():
    router = LLMRouter()
    groq_mock = MagicMock()
    groq_mock.is_configured.return_value = True
    groq_mock.generate.side_effect = ProviderAPIError("Groq Down")

    gemini_mock = MagicMock()
    gemini_mock.is_configured.return_value = True
    gemini_mock.generate.side_effect = ProviderAPIError("Gemini Down")

    chunks = [{"content": "জৈব সার প্রয়োগ মাটির স্বাস্থ্য ভালো রাখে।", "source": "BARC নির্দেশিকা", "page": "১২"}]

    with patch.object(router, "get_provider_instances", return_value={"groq": groq_mock, "gemini": gemini_mock}):
        with patch.object(router, "get_configured_order", return_value=["groq", "gemini"]):
            res = router.generate(
                [{"role": "user", "content": "জৈব সার"}],
                stream=False,
                context_chunks=chunks,
            )
            # Must NOT crash or return 500, degrades gracefully
            assert res["fallback"] is True
            assert res["provider_used"] == "retrieval_fallback"
            assert "জৈব সার প্রয়োগ" in res["answer"]
            assert "উপজেলা কৃষি কর্মকর্তা" in res["answer"]


@pytest.mark.django_db
def test_router_caching_returns_identical_answer():
    from django.core.cache import cache
    cache.clear()

    router = LLMRouter()
    mock_p = MagicMock()
    mock_p.is_configured.return_value = True
    mock_p.get_model_name.return_value = "mock-1"
    mock_p.generate.return_value = "প্রথমবার তৈরি করা উত্তর।"

    with patch.object(router, "get_provider_instances", return_value={"mock": mock_p}):
        with patch.object(router, "get_configured_order", return_value=["mock"]):
            # First call
            res1 = router.generate([{"role": "user", "content": "একই প্রশ্ন"}], stream=False)
            assert res1["answer"] == "প্রথমবার তৈরি করা উত্তর।"
            assert mock_p.generate.call_count == 1

            # Second call with identical input hits cache
            res2 = router.generate([{"role": "user", "content": "একই প্রশ্ন"}], stream=False)
            assert res2["answer"] == "প্রথমবার তৈরি করা উত্তর।"
            # Should not call provider generate a second time
            assert mock_p.generate.call_count == 1
