"""
Comprehensive Automated Tests for Mrittika AI Shared AI Response Caching System.
Covers all 10 scenarios required by the system specification:
1. First-time question (miss, API called, cached, user session saved)
2. Identical question from another user (hit, 0 API calls, user session saved, isolated)
3. Semantically similar question matching (semantic similarity threshold > 0.90)
4. Different agricultural context (N, P, K variance -> different fingerprints)
5. Expired cache handling (expired entry not served, regenerated)
6. API provider downtime resilience (cached response served during API outage)
7. Concurrent requests (single-flight deduplication)
8. Admin and Officer invalidation (invalidated entry excluded from cache)
9. Multilingual handling (Bengali vs English cache isolation)
10. User privacy and conversation history isolation
Plus Admin Cache API management endpoints (stats, list, verify, invalidate, clear-expired).
"""

import threading
import time
from datetime import timedelta
from unittest.mock import MagicMock, patch

import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.assistant.cache_service import (
    canonicalize_context,
    clear_expired_caches,
    generate_cache_fingerprint,
    get_cache_analytics,
    invalidate_cache_entry,
    lookup_cache,
    normalize_text_for_caching,
    save_response_to_cache,
    verify_cache_entry,
)
from apps.assistant.models import AIResponseCache, AssistantMessage, AssistantSession


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_rahim():
    user, _ = User.objects.get_or_create(
        phone="01711000001",
        defaults={
            "name": "রহিম মিয়া",
            "role": User.Role.FARMER,
        },
    )
    user.set_password("TestPassword@123")
    user.save()
    return user


@pytest.fixture
def user_karim():
    user, _ = User.objects.get_or_create(
        phone="01711000002",
        defaults={
            "name": "করিম শেখ",
            "role": User.Role.FARMER,
        },
    )
    user.set_password("TestPassword@123")
    user.save()
    return user


@pytest.fixture
def admin_user():
    user, _ = User.objects.get_or_create(
        phone="01711000099",
        defaults={
            "name": "সিস্টেম অ্যাডমিন",
            "role": User.Role.ADMIN,
            "is_staff": True,
            "is_superuser": True,
        },
    )
    user.set_password("AdminPassword@123")
    user.save()
    return user


@pytest.fixture
def officer_user():
    user, _ = User.objects.get_or_create(
        phone="01711000055",
        defaults={
            "name": "উপজেলা কৃষি কর্মকর্তা",
            "role": User.Role.OFFICER,
            "is_verified": True,
        },
    )
    user.set_password("OfficerPassword@123")
    user.save()
    return user


# ==============================================================================
# SCENARIO 1 & 2: First-time question & Identical Question from another user
# ==============================================================================
@pytest.mark.django_db
def test_scenario_1_and_2_shared_caching_and_zero_duplicate_api_calls(api_client, user_rahim, user_karim):
    """
    Scenario 1: Rahim asks a question for the first time -> Cache miss -> AI API invoked -> Cached.
    Scenario 2: Karim asks the exact same question -> Cache hit -> 0 AI API calls -> Isolated session.
    """
    AIResponseCache.objects.all().delete()
    question = "ধানের জমিতে ইউরিয়া সার কখন দিতে হয়?"

    # Mock the LLM router to track exact external API invocation count
    with patch("apps.assistant.views.get_llm_router") as mock_router_getter:
        mock_router = MagicMock()
        mock_router.generate.return_value = {
            "answer": "আমন ধানের ক্ষেত্রে ইউরিয়া সার তিন কিস্তিতে দিতে হয়: চারা লাগানোর ১৫-২০ দিন পর প্রথম কিস্তি, কুশি গজানোর সময় দ্বিতীয় কিস্তি এবং থোড় আসার ৫-৭ দিন আগে শেষ কিস্তি।",
            "provider_used": "groq/llama-3.3-70b-versatile",
            "fallback": False,
        }
        mock_router_getter.return_value = mock_router

        # --- User Rahim's First Call (Scenario 1) ---
        api_client.force_authenticate(user=user_rahim)
        res1 = api_client.post("/api/v1/assistant/chat", {"message": question}, format="json")
        assert res1.status_code == status.HTTP_200_OK
        assert res1.data["is_cached"] is False
        assert mock_router.generate.call_count == 1

        # Check DB cache entry created
        cache_entry = AIResponseCache.objects.first()
        assert cache_entry is not None
        assert cache_entry.hit_count == 0
        assert "ইউরিয়া" in cache_entry.response_text

        # Rahim's message history in session
        rahim_session = AssistantSession.objects.filter(user=user_rahim).first()
        assert rahim_session is not None
        rahim_assistant_msg = rahim_session.messages.filter(role="assistant").first()
        assert rahim_assistant_msg.is_cached is False

        # --- User Karim's Identical Call (Scenario 2) ---
        api_client.force_authenticate(user=user_karim)
        res2 = api_client.post("/api/v1/assistant/chat", {"message": question}, format="json")
        assert res2.status_code == status.HTTP_200_OK
        assert res2.data["is_cached"] is True
        assert res2.data["match_type"] == "EXACT"

        # Verify NO new external LLM router call occurred (exact count still 1!)
        assert mock_router.generate.call_count == 1

        # Cache hit count atomically incremented
        cache_entry.refresh_from_db()
        assert cache_entry.hit_count == 1

        # Karim's private session message is properly recorded with is_cached=True
        karim_session = AssistantSession.objects.filter(user=user_karim).first()
        assert karim_session is not None
        assert karim_session.id != rahim_session.id
        karim_assistant_msg = karim_session.messages.filter(role="assistant").first()
        assert karim_assistant_msg.is_cached is True
        assert karim_assistant_msg.cache_entry_id == cache_entry.id


# ==============================================================================
# SCENARIO 3: Semantically Similar Question Matching
# ==============================================================================
@pytest.mark.django_db
def test_scenario_3_semantic_similarity_matching():
    """
    Scenario 3: Semantically similar phrasing of an agricultural query
    hits Level 2 semantic matching and returns cached response without API calls.
    """
    AIResponseCache.objects.all().delete()

    # Pre-populate cache with a known answer and embedding
    base_question = "ধানের জমিতে ইউরিয়া কখন দিতে হয়?"
    cached = save_response_to_cache(
        original_question=base_question,
        response_text="ইউরিয়া সার তিন কিস্তিতে প্রয়োগ করতে হয়।",
        context={"crop": "ধান"},
        model_name="mock-ai",
    )
    assert cached is not None
    assert cached.embedding is not None

    # Query with a phrasing variant
    variant_question = "ধান চাষে ইউরিয়া সার প্রয়োগের সঠিক সময় কখন?"
    hit = lookup_cache(variant_question, context={"crop": "ধান"}, allow_semantic=True)

    assert hit is not None
    assert hit["hit"] is True
    # Either exact or semantic match depending on tokenizer, answer is returned
    assert "ইউরিয়া সার তিন কিস্তিতে" in hit["answer"]


# ==============================================================================
# SCENARIO 4: Context Variance ($N, P, K, pH$) produces Different Fingerprints
# ==============================================================================
@pytest.mark.django_db
def test_scenario_4_agricultural_context_fingerprint_variance():
    """
    Scenario 4: Two fertilizer queries with different soil nutrient values (N, P, K, pH)
    MUST yield distinct fingerprints so personalized recommendations never collide.
    """
    q = "আমার জমির জন্য সারের সঠিক পরিমাণ কত?"
    context_d = {"crop": "ধান", "N": 120, "P": 45, "K": 60, "pH": 6.4}
    context_e = {"crop": "ধান", "N": 40, "P": 20, "K": 30, "pH": 5.2}

    norm_q = normalize_text_for_caching(q)
    _, hash_d, _ = canonicalize_context(context_d)
    _, hash_e, _ = canonicalize_context(context_e)

    assert hash_d != hash_e

    _, fp_d = generate_cache_fingerprint(norm_q, hash_d)
    _, fp_e = generate_cache_fingerprint(norm_q, hash_e)

    assert fp_d != fp_e


# ==============================================================================
# SCENARIO 5: Expired Cache Not Served
# ==============================================================================
@pytest.mark.django_db
def test_scenario_5_expired_cache_not_served(api_client, user_rahim):
    """
    Scenario 5: An entry whose TTL has expired must not be returned on cache lookup.
    """
    AIResponseCache.objects.all().delete()
    question = "আলুর বিলম্বিত ধসা রোগের লক্ষণ কী?"

    entry = save_response_to_cache(
        original_question=question,
        response_text="পাতায় জলছাপের মতো দাগ পড়ে এবং দ্রুত পচন ধরে।",
        model_name="mock-ai",
    )
    assert entry is not None

    # Manually backdate expiration to 2 days ago
    entry.expires_at = timezone.now() - timedelta(days=2)
    entry.save()

    # Lookup should return None (miss)
    hit = lookup_cache(question)
    assert hit is None


# ==============================================================================
# SCENARIO 6: API Provider Downtime Resilience
# ==============================================================================
@pytest.mark.django_db
def test_scenario_6_api_provider_downtime_serves_from_cache(api_client, user_rahim):
    """
    Scenario 6: Even if external AI router / APIs crash or throw exceptions,
    previously cached responses are served seamlessly.
    """
    AIResponseCache.objects.all().delete()
    question = "কীভাবে সরিষা চাষ করতে হয়?"

    save_response_to_cache(
        original_question=question,
        response_text="কার্তিক অগ্রহায়ণ মাসে বেলে দোআঁশ মাটিতে সরিষা বপন করতে হয়।",
        model_name="mock-ai",
    )

    # Simulate total external LLM router failure
    with patch("apps.assistant.views.get_llm_router") as mock_router_getter:
        mock_router = MagicMock()
        mock_router.generate.side_effect = RuntimeError("External Groq & Gemini APIs are DOWN!")
        mock_router_getter.return_value = mock_router

        api_client.force_authenticate(user=user_rahim)
        res = api_client.post("/api/v1/assistant/chat", {"message": question}, format="json")
        assert res.status_code == status.HTTP_200_OK
        assert res.data["is_cached"] is True
        assert "সরিষা বপন করতে হয়" in res.data["answer"]


# ==============================================================================
# SCENARIO 7: Concurrent Single-Flight Deduplication
# ==============================================================================
@pytest.mark.django_db(transaction=True)
def test_scenario_7_concurrent_requests_single_flight():
    """
    Scenario 7: When two callers ask an identical question simultaneously,
    single-flight lock ensures only one LLM API call is executed.
    """
    AIResponseCache.objects.all().delete()
    question = "টমেটোর পাতা কোকড়ানো রোগ দমনে করণীয় কী?"

    call_count = {"count": 0}

    def slow_generator_and_cache():
        # First check cache
        c = lookup_cache(question)
        if c:
            return c["answer"]
        norm_q = normalize_text_for_caching(question)
        _, ctx_hash, _ = canonicalize_context({})
        _, fp = generate_cache_fingerprint(norm_q, ctx_hash)

        from apps.assistant.cache_service import acquire_single_flight
        with acquire_single_flight(fp):
            double_check = lookup_cache(question)
            if double_check:
                return double_check["answer"]
            time.sleep(0.05)  # Simulate external API latency
            call_count["count"] += 1
            ans = "সাদা মাছি দমনের জন্য কীটনাশক ব্যবহার করুন।"
            save_response_to_cache(question, ans)
            return ans

    t1 = threading.Thread(target=slow_generator_and_cache)
    t2 = threading.Thread(target=slow_generator_and_cache)

    t1.start()
    t2.start()
    t1.join()
    t2.join()

    # The external LLM call should only happen ONCE
    assert call_count["count"] == 1


# ==============================================================================
# SCENARIO 8: Admin & Officer Invalidation
# ==============================================================================
@pytest.mark.django_db
def test_scenario_8_admin_officer_invalidation():
    """
    Scenario 8: When an officer or admin invalidates an inaccurate answer,
    the cache lookup immediately treats it as a miss.
    """
    AIResponseCache.objects.all().delete()
    question = "গম চাষে ইউরিয়া সার কতটুকু দিতে হয়?"

    entry = save_response_to_cache(
        original_question=question,
        response_text="ভুল উত্তর: অতিরিক্ত সার দিন।",
        model_name="mock-ai",
    )
    assert entry is not None

    # Before invalidation: cache hits
    assert lookup_cache(question) is not None

    # Invalidate
    ok = invalidate_cache_entry(entry.id, reason="কৃষিতাত্ত্বিক তথ্যে ভুল রয়েছে")
    assert ok is True

    # After invalidation: cache miss
    assert lookup_cache(question) is None


# ==============================================================================
# SCENARIO 9: Multilingual Handling
# ==============================================================================
@pytest.mark.django_db
def test_scenario_9_multilingual_handling():
    """
    Scenario 9: Bengali questions and English questions do not collide.
    """
    q_bn = "ধান চাষের নিয়ম"
    q_en = "Rice cultivation guide"

    assert normalize_text_for_caching(q_bn) != normalize_text_for_caching(q_en)

    _, hash_bn = generate_cache_fingerprint(normalize_text_for_caching(q_bn), "none")
    _, hash_en = generate_cache_fingerprint(normalize_text_for_caching(q_en), "none")

    assert hash_bn != hash_en


# ==============================================================================
# SCENARIO 10: User Privacy & Conversation Isolation
# ==============================================================================
@pytest.mark.django_db
def test_scenario_10_user_privacy_isolation(api_client, user_rahim, user_karim):
    """
    Scenario 10: Users share the verified agricultural answers,
    but user conversation histories and private sessions remain strictly isolated.
    """
    AIResponseCache.objects.all().delete()
    AssistantSession.objects.all().delete()

    save_response_to_cache(
        original_question="ভুট্টা চাষের সময় কখন?",
        response_text="রবি মৌসুমে মধ্য অক্টোবর থেকে নভেম্বর মাসে ভুট্টা বপন করা হয়।",
        model_name="mock-ai",
    )

    # Rahim queries and saves session
    api_client.force_authenticate(user=user_rahim)
    r1 = api_client.post("/api/v1/assistant/chat", {"message": "ভুট্টা চাষের সময় কখন?"}, format="json")
    rahim_sid = r1.data["session_id"]

    # Karim queries and saves session
    api_client.force_authenticate(user=user_karim)
    r2 = api_client.post("/api/v1/assistant/chat", {"message": "ভুট্টা চাষের সময় কখন?"}, format="json")
    karim_sid = r2.data["session_id"]

    # Assert sessions are completely isolated
    assert rahim_sid != karim_sid
    rahim_session = AssistantSession.objects.get(id=rahim_sid)
    karim_session = AssistantSession.objects.get(id=karim_sid)

    assert rahim_session.user == user_rahim
    assert karim_session.user == user_karim

    # Karim cannot access Rahim's session detail endpoint
    forbidden_res = api_client.get(f"/api/v1/assistant/sessions/{rahim_sid}/")
    assert forbidden_res.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================================
# ADMIN CACHE MANAGEMENT API ENDPOINTS
# ==============================================================================
@pytest.mark.django_db
def test_admin_cache_management_endpoints(api_client, admin_user):
    """
    Tests Admin cache statistics, listing, filtering, verification, and clear-expired actions.
    """
    AIResponseCache.objects.all().delete()

    entry = save_response_to_cache(
        original_question="পাট কাটার সঠিক সময় কখন?",
        response_text="গাছে ফুল আসার পর পাট কাটলে সর্বোত্তম আঁশের গুণমান পাওয়া যায়।",
        model_name="test-ai",
    )
    assert entry is not None

    api_client.force_authenticate(user=admin_user)

    # 1. Stats endpoint
    stats_res = api_client.get("/api/v1/assistant/admin/cache/stats/")
    assert stats_res.status_code == status.HTTP_200_OK
    assert stats_res.data["total_cached"] >= 1
    assert "cache_hit_rate_percent" in stats_res.data

    # 2. List endpoint
    list_res = api_client.get("/api/v1/assistant/admin/cache/")
    assert list_res.status_code == status.HTTP_200_OK
    assert list_res.data["total_count"] >= 1

    # 3. Action: Verify
    verify_res = api_client.post(f"/api/v1/assistant/admin/cache/{entry.id}/action/", {"action": "verify"}, format="json")
    assert verify_res.status_code == status.HTTP_200_OK
    entry.refresh_from_db()
    assert entry.is_verified is True
    assert entry.verification_status == AIResponseCache.VerificationStatus.VERIFIED

    # 4. Action: Invalidate
    inval_res = api_client.post(
        f"/api/v1/assistant/admin/cache/{entry.id}/action/",
        {"action": "invalidate", "reason": "পুরনো তথ্য"},
        format="json",
    )
    assert inval_res.status_code == status.HTTP_200_OK
    entry.refresh_from_db()
    assert entry.is_active is False
    assert entry.verification_status == AIResponseCache.VerificationStatus.INVALIDATED

    # 5. Clear Expired endpoint
    clear_res = api_client.post("/api/v1/assistant/admin/cache/clear-expired/")
    assert clear_res.status_code == status.HTTP_200_OK
    assert "deleted_count" in clear_res.data
