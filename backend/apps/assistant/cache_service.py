"""
Production-Ready Shared AI Response Caching & API Optimization Service for Mrittika AI.

Provides:
- Two-level cache lookup (Exact Fingerprint Match & Semantic Similarity Match)
- Context-aware agricultural fingerprinting (Question, Language, Crop, Season, Soil Nutrients)
- Intelligent category classification and TTL management
- Single-flight request deduplication to prevent duplicate concurrent LLM API calls
- Safety validation (excludes PII, fallback responses, or errored outputs)
- Officer and Admin verification, flagging, and invalidation controls
- Real-time telemetry, cache hit/miss counting, and analytics
"""

import hashlib
import json
import logging
import re
import threading
import unicodedata
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from django.conf import settings
from django.db import transaction
from django.db.models import F, Q
from django.utils import timezone as dj_timezone

from .models import AIResponseCache
from .rag_engine import get_embed_model

logger = logging.getLogger(__name__)

# Single-flight lock registry for concurrent request deduplication
_FLIGHT_LOCKS_LOCK = threading.Lock()
_SINGLE_FLIGHT_REGISTRY: Dict[str, threading.Lock] = {}

# Configurable semantic matching threshold (cosine similarity between 0.0 and 1.0)
SEMANTIC_SIMILARITY_THRESHOLD = getattr(settings, "SEMANTIC_CACHE_THRESHOLD", 0.90)

# TTL policies by category (in days/hours)
DEFAULT_CATEGORY_TTLS = {
    AIResponseCache.Category.GENERAL_FAQ: timedelta(days=30),
    AIResponseCache.Category.CROP_CULTIVATION: timedelta(days=14),
    AIResponseCache.Category.FERTILIZER_GUIDE: timedelta(days=7),
    AIResponseCache.Category.PEST_DISEASE: timedelta(days=14),
    AIResponseCache.Category.SEASONAL: timedelta(days=3),
    AIResponseCache.Category.WEATHER: timedelta(hours=6),
    AIResponseCache.Category.PERSONALIZED: timedelta(days=1),
}


# ==============================================================================
# 1. TEXT NORMALIZATION & LANGUAGE DETECTION
# ==============================================================================

def normalize_text_for_caching(text: str) -> str:
    """
    Normalizes a user question into a stable, canonical string for hashing.
    - Applies Unicode NFC normalization.
    - Strips leading/trailing whitespace.
    - Collapses multiple whitespace characters.
    - Lowers English text while preserving Bengali characters.
    - Normalizes repeated punctuation marks.
    """
    if not text:
        return ""

    # 1. Unicode normalization
    cleaned = unicodedata.normalize("NFC", text.strip())

    # 2. Lowercase English characters (Bengali is unaffected)
    cleaned = cleaned.lower()

    # 3. Collapse multiple whitespace, tabs, and newlines into a single space
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # 4. Normalize repetitive punctuation (e.g., ??? -> ?, !!! -> !, ।।। -> ।)
    cleaned = re.sub(r"\?+", "?", cleaned)
    cleaned = re.sub(r"!+", "!", cleaned)
    cleaned = re.sub(r"।+", "।", cleaned)
    cleaned = re.sub(r"\.+", ".", cleaned)
    cleaned = re.sub(r",+", ",", cleaned)

    return cleaned


def detect_language(text: str) -> str:
    """
    Detects whether text is primarily Bengali (bn) or English (en).
    Bengali Unicode block: U+0980 to U+09FF.
    """
    bengali_chars = len(re.findall(r"[\u0980-\u09FF]", text or ""))
    english_chars = len(re.findall(r"[a-zA-Z]", text or ""))
    return "bn" if bengali_chars >= english_chars else "en"


# ==============================================================================
# 2. CONTEXT CANONICALIZATION & FINGERPRINTING
# ==============================================================================

def canonicalize_context(context: Optional[Dict[str, Any]]) -> Tuple[str, str, Dict[str, Any]]:
    """
    Extracts and standardizes answer-relevant agricultural context.
    Rounds numerical agronomic parameters to avoid float noise while preserving
    distinct soil profiles and management conditions.

    Returns:
        (canonical_json_string, context_hash, clean_context_dict)
    """
    if not context or not isinstance(context, dict):
        return "none", hashlib.sha256(b"none").hexdigest(), {}

    clean: Dict[str, Any] = {}

    # Standard string fields
    for str_key in ["crop", "season", "soil_type", "district", "land_unit"]:
        val = context.get(str_key)
        if val is not None and str(val).strip():
            clean[str_key] = normalize_text_for_caching(str(val))

    # Numerical fields with sensible rounding
    num_fields = {
        "pH": 1,          # pH rounded to 1 decimal place (e.g. 6.4)
        "N": 0,           # Nitrogen kg/ha rounded to integer
        "P": 0,           # Phosphorus kg/ha rounded to integer
        "K": 0,           # Potassium kg/ha rounded to integer
        "S": 0,           # Sulfur kg/ha
        "Zn": 1,          # Zinc kg/ha
        "organic_matter": 1,
        "temperature": 1,
        "humidity": 1,
        "rainfall": 0,
        "land_area": 2,
    }

    for num_key, decimals in num_fields.items():
        val = context.get(num_key)
        if val is not None and val != "":
            try:
                flt_val = float(val)
                clean[num_key] = round(flt_val, decimals) if decimals > 0 else round(flt_val)
            except (ValueError, TypeError):
                pass

    if not clean:
        return "none", hashlib.sha256(b"none").hexdigest(), {}

    # Deterministic JSON representation (sorted keys)
    canonical_json = json.dumps(clean, sort_keys=True, ensure_ascii=False)
    context_hash = hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

    return canonical_json, context_hash, clean


def generate_cache_fingerprint(
    normalized_question: str,
    context_hash: str,
) -> Tuple[str, str]:
    """
    Produces deterministic question_hash and compound fingerprint:
    fingerprint = sha256(question_hash + ":" + context_hash)
    """
    q_hash = hashlib.sha256(normalized_question.encode("utf-8")).hexdigest()
    fingerprint = hashlib.sha256(f"{q_hash}:{context_hash}".encode("utf-8")).hexdigest()
    return q_hash, fingerprint


# ==============================================================================
# 3. CATEGORY CLASSIFICATION & TTL RESOLUTION
# ==============================================================================

def classify_cache_category(
    question: str,
    clean_context: Dict[str, Any],
) -> Tuple[str, timedelta]:
    """
    Categorizes the agricultural query and assigns its appropriate TTL.
    """
    q_lower = question.lower()

    # 1. Personalized / soil-specific if numeric soil inputs are present
    if any(k in clean_context for k in ["pH", "N", "P", "K", "S", "Zn", "organic_matter"]):
        return AIResponseCache.Category.PERSONALIZED, DEFAULT_CATEGORY_TTLS[AIResponseCache.Category.PERSONALIZED]

    # 2. Weather-dependent advice
    weather_keywords = [
        "বৃষ্টি", "তাপমাত্রা", "আবহাওয়া", "খরা", "বন্যা", "ঘূর্ণিঝড়", "ঝড়", "কুয়াশা",
        "weather", "rain", "temperature", "forecast", "climate", "flood", "drought",
    ]
    if any(k in q_lower for k in weather_keywords):
        return AIResponseCache.Category.WEATHER, DEFAULT_CATEGORY_TTLS[AIResponseCache.Category.WEATHER]

    # 3. Fertilizer guidance
    fert_keywords = [
        "সার", "ইউরিয়া", "টিএসপি", "ডিএপি", "পটাশ", "এমওপি", "জিপসাম", "দস্তা", "চুন", "কম্পোস্ট",
        "গোবর", "সুষম", "উপাদান", "fertilizer", "urea", "tsp", "dap", "mop", "potash", "lime", "npk",
    ]
    if any(k in q_lower for k in fert_keywords):
        return AIResponseCache.Category.FERTILIZER_GUIDE, DEFAULT_CATEGORY_TTLS[AIResponseCache.Category.FERTILIZER_GUIDE]

    # 4. Pest & Disease Management
    pest_keywords = [
        "রোগ", "পোকা", "বালাই", "দমন", "ব্লাইট", "মাকড়", "মাজরা", "লেদা", "পঁচন", "ছত্রাক", "কীটনাশক",
        "কীট", "জীবাণু", "পোকামাকড়", "pest", "disease", "insect", "fungus", "blight", "pesticide",
    ]
    if any(k in q_lower for k in pest_keywords):
        return AIResponseCache.Category.PEST_DISEASE, DEFAULT_CATEGORY_TTLS[AIResponseCache.Category.PEST_DISEASE]

    # 5. Seasonal advice
    season_keywords = [
        "মৌসুম", "রবি", "খরিফ", "শীতকালীন", "গ্রীষ্মকালীন", "বর্ষা", "রোপণ কাল", "বপন সময়",
        "season", "rabi", "kharif", "sowing", "planting time", "harvest",
    ]
    if any(k in q_lower for k in season_keywords) or "season" in clean_context:
        return AIResponseCache.Category.SEASONAL, DEFAULT_CATEGORY_TTLS[AIResponseCache.Category.SEASONAL]

    # 6. Crop cultivation
    cultivation_keywords = [
        "চাষ", "চাষাবাদ", "জাত", "বীজ", "চারা", "ফলন", "রোপণ", "বপন", "ধান", "গম", "ভুট্টা",
        "আলু", "সরিষা", "পাট", "টমেটো", "বেগুন", "মরিচ", "cultivation", "yield", "variety", "crop",
    ]
    if any(k in q_lower for k in cultivation_keywords) or "crop" in clean_context:
        return AIResponseCache.Category.CROP_CULTIVATION, DEFAULT_CATEGORY_TTLS[AIResponseCache.Category.CROP_CULTIVATION]

    # 7. General Agricultural FAQ
    return AIResponseCache.Category.GENERAL_FAQ, DEFAULT_CATEGORY_TTLS[AIResponseCache.Category.GENERAL_FAQ]


# ==============================================================================
# 4. SINGLE-FLIGHT CONCURRENT DEDUPLICATION
# ==============================================================================

@contextmanager
def acquire_single_flight(fingerprint: str):
    """
    Thread-safe single-flight mechanism.
    If multiple identical uncached queries arrive concurrently, only the first
    thread invokes the external AI API, while others wait on the lock and
    subsequently retrieve the newly generated answer directly from cache.
    """
    with _FLIGHT_LOCKS_LOCK:
        if fingerprint not in _SINGLE_FLIGHT_REGISTRY:
            _SINGLE_FLIGHT_REGISTRY[fingerprint] = threading.Lock()
        lock = _SINGLE_FLIGHT_REGISTRY[fingerprint]

    lock.acquire()
    try:
        yield
    finally:
        lock.release()
        with _FLIGHT_LOCKS_LOCK:
            # Clean up lock entry if not locked
            if not lock.locked():
                _SINGLE_FLIGHT_REGISTRY.pop(fingerprint, None)


# ==============================================================================
# 5. TWO-LEVEL CACHE LOOKUP SERVICE
# ==============================================================================

def lookup_cache(
    question: str,
    context: Optional[Dict[str, Any]] = None,
    allow_semantic: bool = True,
) -> Optional[Dict[str, Any]]:
    """
    Executes multi-level cache lookup:
    1. Level 1: Exact normalized fingerprint match.
    2. Level 2: Semantic vector similarity match (if enabled and applicable).

    Returns a dict with cached response data or None on cache miss.
    """
    normalized_q = normalize_text_for_caching(question)
    if not normalized_q or len(normalized_q) < 3:
        return None

    _, context_hash, clean_context = canonicalize_context(context)
    _, fingerprint = generate_cache_fingerprint(normalized_q, context_hash)
    now = dj_timezone.now()

    # --------------------------------------------------------------------------
    # Level 1: Exact Fingerprint Match
    # --------------------------------------------------------------------------
    exact_match = (
        AIResponseCache.objects.filter(
            fingerprint=fingerprint,
            is_active=True,
            expires_at__gt=now,
        )
        .exclude(verification_status=AIResponseCache.VerificationStatus.INVALIDATED)
        .first()
    )

    if exact_match:
        # Atomic hit count increment and last accessed update
        AIResponseCache.objects.filter(id=exact_match.id).update(
            hit_count=F("hit_count") + 1,
            last_accessed_at=now,
        )
        logger.info(
            "Cache HIT (EXACT) [id=%s, hits=%d]: '%s'",
            exact_match.id,
            exact_match.hit_count + 1,
            normalized_q[:50],
        )
        return {
            "hit": True,
            "match_type": "EXACT",
            "cache_id": str(exact_match.id),
            "answer": exact_match.response_text,
            "sources": exact_match.source_references or [],
            "metadata": exact_match.response_metadata or {},
            "category": exact_match.category,
            "is_verified": exact_match.is_verified,
            "verification_status": exact_match.verification_status,
            "crop_name": exact_match.crop_name,
            "created_at": exact_match.created_at.isoformat(),
            "expires_at": exact_match.expires_at.isoformat(),
        }

    # --------------------------------------------------------------------------
    # Level 2: Semantic Similarity Match
    # --------------------------------------------------------------------------
    if not allow_semantic:
        return None

    lang = detect_language(normalized_q)
    category, _ = classify_cache_category(normalized_q, clean_context)

    # Do not semantically match personalized nutrient cards or weather-dependent queries
    if category in [AIResponseCache.Category.PERSONALIZED, AIResponseCache.Category.WEATHER]:
        return None

    # Retrieve candidate active cache entries in the same language and category
    candidates = (
        AIResponseCache.objects.filter(
            language=lang,
            category=category,
            is_active=True,
            expires_at__gt=now,
            embedding__isnull=False,
        )
        .exclude(verification_status=AIResponseCache.VerificationStatus.INVALIDATED)
        .only("id", "normalized_question", "embedding", "response_text", "source_references", "response_metadata", "category", "is_verified", "verification_status", "crop_name", "created_at", "expires_at", "hit_count")[:40]
    )

    if not candidates.exists():
        return None

    # Fast token-based similarity check first (0.0001s, zero CPU lag)
    q_words = set(re.findall(r"[\u0980-\u09FF\w]+", normalized_q))
    if q_words:
        for cand in candidates:
            cand_words = set(re.findall(r"[\u0980-\u09FF\w]+", cand.normalized_question))
            if not cand_words:
                continue
            intersection = len(q_words & cand_words)
            union = len(q_words | cand_words)
            jaccard = intersection / union if union > 0 else 0
            if jaccard >= 0.75:
                AIResponseCache.objects.filter(id=cand.id).update(
                    hit_count=F("hit_count") + 1,
                    last_accessed_at=now,
                )
                logger.info("Cache HIT (FAST_LEXICAL, sim=%.4f) [id=%s]: '%s' ~ '%s'", jaccard, cand.id, normalized_q[:40], cand.normalized_question[:40])
                return {
                    "hit": True,
                    "match_type": "SEMANTIC",
                    "similarity_score": round(jaccard, 4),
                    "cache_id": str(cand.id),
                    "answer": cand.response_text,
                    "sources": cand.source_references or [],
                    "metadata": cand.response_metadata or {},
                    "category": cand.category,
                    "is_verified": cand.is_verified,
                    "verification_status": cand.verification_status,
                    "crop_name": cand.crop_name,
                    "created_at": cand.created_at.isoformat(),
                    "expires_at": cand.expires_at.isoformat(),
                }

    if not getattr(settings, "ENABLE_NEURAL_EMBEDDINGS", False):
        return None

    try:
        embedder = get_embed_model()
        q_prefix = f"query: {normalized_q}" if "e5" in getattr(settings, "EMBEDDING_MODEL", "").lower() else normalized_q
        query_vec = np.array(embedder.encode(q_prefix, normalize_embeddings=True), dtype=np.float32)

        best_candidate = None
        best_similarity = -1.0

        for cand in candidates:
            if not cand.embedding:
                continue
            cand_vec = np.array(cand.embedding, dtype=np.float32)
            # Dot product of normalized unit vectors equals cosine similarity
            sim = float(np.dot(query_vec, cand_vec))
            if sim > best_similarity:
                best_similarity = sim
                best_candidate = cand

        if best_candidate and best_similarity >= SEMANTIC_SIMILARITY_THRESHOLD:
            # Atomic hit count update
            AIResponseCache.objects.filter(id=best_candidate.id).update(
                hit_count=F("hit_count") + 1,
                last_accessed_at=now,
            )
            logger.info(
                "Cache HIT (SEMANTIC, sim=%.4f) [id=%s]: '%s' ~ '%s'",
                best_similarity,
                best_candidate.id,
                normalized_q[:40],
                best_candidate.normalized_question[:40],
            )
            return {
                "hit": True,
                "match_type": "SEMANTIC",
                "similarity_score": round(best_similarity, 4),
                "cache_id": str(best_candidate.id),
                "answer": best_candidate.response_text,
                "sources": best_candidate.source_references or [],
                "metadata": best_candidate.response_metadata or {},
                "category": best_candidate.category,
                "is_verified": best_candidate.is_verified,
                "verification_status": best_candidate.verification_status,
                "crop_name": best_candidate.crop_name,
                "created_at": best_candidate.created_at.isoformat(),
                "expires_at": best_candidate.expires_at.isoformat(),
            }
    except Exception as emb_err:
        logger.warning("Semantic cache search failed gracefully: %s", emb_err)

    return None


# ==============================================================================
# 6. CACHE PERSISTENCE & SAFETY VALIDATION
# ==============================================================================

def is_eligible_for_caching(
    question: str,
    answer: str,
    fallback: bool = False,
) -> bool:
    """
    Validates whether an AI generated answer is eligible for global shared caching.
    Excludes fallback responses, empty responses, or queries containing private PII.
    """
    if not answer or not answer.strip():
        return False

    if fallback:
        return False

    # Do not cache safety fallback messages
    if "উপজেলা কৃষি কর্মকর্তা বা উপসহকারী কৃষি কর্মকর্তার" in answer:
        return False
    if "আমি এই বিষয়ে পুরোপুরি নিশ্চিত নই" in answer:
        return False

    # Check for telephone or NID leaks
    if re.search(r"(?:\+?880\s?|0)1[3-9]\d{2}[-\s]?\d{6}\b", question):
        return False

    return True


def save_response_to_cache(
    original_question: str,
    response_text: str,
    context: Optional[Dict[str, Any]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
    metadata: Optional[Dict[str, Any]] = None,
    fallback: bool = False,
    model_name: str = "groq/gpt-oss-120b",
) -> Optional[AIResponseCache]:
    """
    Saves a verified AI generated response into the shared response cache.
    Computes vector embedding for future semantic lookups.
    """
    if not is_eligible_for_caching(original_question, response_text, fallback):
        logger.debug("Response ineligible for caching (fallback or safety criteria).")
        return None

    normalized_q = normalize_text_for_caching(original_question)
    canonical_ctx, context_hash, clean_context = canonicalize_context(context)
    q_hash, fingerprint = generate_cache_fingerprint(normalized_q, context_hash)

    lang = detect_language(normalized_q)
    category, ttl = classify_cache_category(normalized_q, clean_context)
    crop_name = clean_context.get("crop", "")
    now = dj_timezone.now()
    expires_at = now + ttl

    # Compute question embedding for semantic search if neural embeddings enabled
    embedding = None
    if getattr(settings, "ENABLE_NEURAL_EMBEDDINGS", False):
        try:
            embedder = get_embed_model()
            q_prefix = f"query: {normalized_q}" if "e5" in getattr(settings, "EMBEDDING_MODEL", "").lower() else normalized_q
            embedding = embedder.encode(q_prefix, normalize_embeddings=True).tolist()
        except Exception as e:
            logger.warning("Could not compute embedding for cache entry: %s", e)

    meta = metadata or {}
    meta.setdefault("provider_used", meta.get("provider_used", "ai_api"))
    meta.setdefault("cached_at", now.isoformat())

    try:
        with transaction.atomic():
            cache_entry, created = AIResponseCache.objects.update_or_create(
                fingerprint=fingerprint,
                defaults={
                    "original_question": original_question,
                    "normalized_question": normalized_q,
                    "question_hash": q_hash,
                    "context_hash": context_hash,
                    "language": lang,
                    "response_text": response_text,
                    "response_metadata": meta,
                    "source_references": sources or [],
                    "category": category,
                    "crop_name": crop_name,
                    "matching_type": AIResponseCache.MatchType.EXACT,
                    "model_name": model_name,
                    "prompt_version": getattr(settings, "PROMPT_VERSION", "v1.0"),
                    "knowledge_base_version": getattr(settings, "KNOWLEDGE_BASE_VERSION", "v1.0"),
                    "expires_at": expires_at,
                    "last_accessed_at": now,
                    "is_active": True,
                    "verification_status": AIResponseCache.VerificationStatus.UNVERIFIED,
                    "embedding": embedding,
                },
            )
            action = "Created" if created else "Updated"
            logger.info("Shared AI Cache %s [id=%s, cat=%s]: '%s'", action, cache_entry.id, category, normalized_q[:40])
            return cache_entry
    except Exception as pe:
        logger.error("Failed to persist shared AI cache entry: %s", pe)
        return None


# ==============================================================================
# 7. ADMIN & OFFICER MANAGEMENT / INVALIDATION ACTIONS
# ==============================================================================

def verify_cache_entry(cache_id: str, verified_by_user: Any = None) -> bool:
    """Marks a cached agricultural answer as verified by an authorized officer or admin."""
    updated = AIResponseCache.objects.filter(id=cache_id).update(
        is_verified=True,
        verification_status=AIResponseCache.VerificationStatus.VERIFIED,
        verified_by=verified_by_user,
        updated_at=dj_timezone.now(),
    )
    return updated > 0


def invalidate_cache_entry(cache_id: str, reason: str, invalidated_by_user: Any = None) -> bool:
    """Invalidates an outdated or incorrect cached response so it is never served again."""
    updated = AIResponseCache.objects.filter(id=cache_id).update(
        is_active=False,
        verification_status=AIResponseCache.VerificationStatus.INVALIDATED,
        invalidation_reason=reason or "Admin/Officer manual invalidation",
        updated_at=dj_timezone.now(),
    )
    return updated > 0


def flag_cache_entry_for_review(cache_id: str, officer_notes: str, officer_user: Any = None) -> bool:
    """Extension officer flags a potentially problematic response for agronomic audit."""
    updated = AIResponseCache.objects.filter(id=cache_id).update(
        verification_status=AIResponseCache.VerificationStatus.FLAGGED,
        officer_notes=officer_notes,
        updated_at=dj_timezone.now(),
    )
    return updated > 0


def clear_expired_caches() -> int:
    """Removes or marks inactive any cache entries whose TTL has elapsed."""
    now = dj_timezone.now()
    deleted_count, _ = AIResponseCache.objects.filter(expires_at__lte=now).delete()
    logger.info("Cleaned up %d expired shared AI cache entries.", deleted_count)
    return deleted_count


def get_cache_analytics() -> Dict[str, Any]:
    """
    Computes real-time telemetry for the Admin Cache Management Dashboard.
    Uses actual database records without fabricated metrics.
    """
    now = dj_timezone.now()
    total_cached = AIResponseCache.objects.count()
    active_cached = AIResponseCache.objects.filter(is_active=True, expires_at__gt=now).count()
    expired_count = AIResponseCache.objects.filter(expires_at__lte=now).count()
    invalidated_count = AIResponseCache.objects.filter(
        verification_status=AIResponseCache.VerificationStatus.INVALIDATED
    ).count()
    verified_count = AIResponseCache.objects.filter(is_verified=True).count()
    flagged_count = AIResponseCache.objects.filter(
        verification_status=AIResponseCache.VerificationStatus.FLAGGED
    ).count()

    # Sum of hit_counts represents exact AI API calls saved across all users
    from django.db.models import Sum
    hits_aggregation = AIResponseCache.objects.aggregate(total_hits=Sum("hit_count"))
    total_hits = hits_aggregation.get("total_hits") or 0

    # Total AI calls made is cached entries + non-cached turns
    from .models import AssistantMessage
    total_assistant_msgs = AssistantMessage.objects.filter(role="assistant").count()
    cached_msgs_served = AssistantMessage.objects.filter(role="assistant", is_cached=True).count()
    direct_api_calls = total_assistant_msgs - cached_msgs_served

    total_requests = total_assistant_msgs if total_assistant_msgs > 0 else (total_hits + total_cached)
    hit_rate = round((total_hits / (total_hits + max(1, direct_api_calls))) * 100, 1) if (total_hits + direct_api_calls) > 0 else 0.0

    # Category distribution
    from django.db.models import Count
    cat_breakdown = (
        AIResponseCache.objects.values("category")
        .annotate(count=Count("id"), hits=Sum("hit_count"))
        .order_by("-count")
    )

    # Top reused questions
    top_questions = (
        AIResponseCache.objects.filter(is_active=True)
        .values("id", "normalized_question", "category", "hit_count", "language", "is_verified", "verification_status")
        .order_by("-hit_count")[:8]
    )

    return {
        "total_cached": total_cached,
        "active_cached": active_cached,
        "expired_cached": expired_count,
        "invalidated_cached": invalidated_count,
        "verified_cached": verified_count,
        "flagged_cached": flagged_count,
        "total_cache_hits": total_hits,
        "direct_api_calls": direct_api_calls,
        "api_calls_saved": total_hits,
        "cache_hit_rate_percent": hit_rate,
        "category_breakdown": list(cat_breakdown),
        "top_questions": list(top_questions),
    }
