"""
Models for Assistant Sessions, Conversation Messages, and Shared AI Response Caching.
Persisted strictly for authenticated users; guest history is managed client-side.
Shared AI Response Cache reduces redundant external LLM calls across all users.
"""

import uuid
from django.conf import settings
from django.db import models


class AIResponseCache(models.Model):
    """
    Centralized, context-aware shared cache for AI responses.
    Allows instant reuse of high-quality agricultural answers across users
    while isolating individual user conversation histories.
    """

    objects = models.Manager()

    class Category(models.TextChoices):
        GENERAL_FAQ = "GENERAL_FAQ", "সাধারণ কৃষি জিজ্ঞাসা (General FAQ)"
        CROP_CULTIVATION = "CROP_CULTIVATION", "ফসল চাষাবাদ পদ্ধতি (Crop Cultivation)"
        FERTILIZER_GUIDE = "FERTILIZER_GUIDE", "সুষম সার প্রয়োগ নির্দেশিকা (Fertilizer Guide)"
        PEST_DISEASE = "PEST_DISEASE", "রোগবালাই ও প্রতিকার (Pest & Disease)"
        SEASONAL = "SEASONAL", "মৌসুমি পরামর্শ (Seasonal Advice)"
        WEATHER = "WEATHER", "আবহাওয়া-নির্ভর পরামর্শ (Weather Advisory)"
        PERSONALIZED = "PERSONALIZED", "মাটি ও পুষ্টি বিশ্লেষণ (Personalized Advisory)"

    class MatchType(models.TextChoices):
        EXACT = "EXACT", "সরাসরি মিল (Exact Match)"
        SEMANTIC = "SEMANTIC", "অর্থগত মিল (Semantic Similarity)"

    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "UNVERIFIED", "অযাচাইকৃত (Unverified)"
        VERIFIED = "VERIFIED", "কর্মকর্তা কর্তৃক অনুমোদিত (Verified)"
        FLAGGED = "FLAGGED", "পর্যালোচনার জন্য চিহ্নিত (Flagged for Review)"
        INVALIDATED = "INVALIDATED", "বাতিলকৃত (Invalidated)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_question = models.TextField(help_text="User's original query text")
    normalized_question = models.TextField(help_text="Cleaned, normalized query text")
    question_hash = models.CharField(max_length=64, db_index=True)
    context_hash = models.CharField(max_length=64, db_index=True, default="none")
    fingerprint = models.CharField(
        max_length=128,
        db_index=True,
        help_text="Compound sha256(question_hash + ':' + context_hash)",
    )
    language = models.CharField(max_length=10, default="bn", db_index=True)

    response_text = models.TextField()
    response_metadata = models.JSONField(default=dict, blank=True)
    source_references = models.JSONField(default=list, blank=True)

    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.GENERAL_FAQ,
        db_index=True,
    )
    crop_name = models.CharField(max_length=100, blank=True, default="", db_index=True)
    matching_type = models.CharField(
        max_length=20,
        choices=MatchType.choices,
        default=MatchType.EXACT,
    )

    model_name = models.CharField(max_length=100, blank=True, default="")
    prompt_version = models.CharField(max_length=50, default="v1.0")
    knowledge_base_version = models.CharField(max_length=50, default="v1.0")

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(db_index=True)
    last_accessed_at = models.DateTimeField(auto_now_add=True, db_index=True)

    hit_count = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.UNVERIFIED,
        db_index=True,
    )

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verified_caches",
    )
    invalidation_reason = models.TextField(blank=True, default="")
    officer_notes = models.TextField(blank=True, default="")
    embedding = models.JSONField(null=True, blank=True, help_text="Normalized float embedding vector")

    class Meta:
        ordering = ["-last_accessed_at", "-hit_count"]
        indexes = [
            models.Index(fields=["fingerprint", "is_active", "expires_at"]),
            models.Index(fields=["question_hash", "context_hash", "is_active"]),
            models.Index(fields=["category", "is_active", "expires_at"]),
            models.Index(fields=["verification_status", "is_active"]),
        ]

    def __str__(self):
        return f"[{self.category}] {self.normalized_question[:40]} (Hits: {self.hit_count})"


class AssistantSession(models.Model):
    """
    Persistent conversational session for authenticated users.
    """
    objects = models.Manager()
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assistant_sessions",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255, default="নতুন আলোচনা (New Chat)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.id})"


class AssistantMessage(models.Model):
    """
    Individual message turn within an assistant session.
    Tracks whether the response was served from shared cache or freshly generated.
    """
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    objects = models.Manager()
    session = models.ForeignKey(
        AssistantSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    content = models.TextField()
    sources = models.JSONField(default=list, blank=True)
    fallback = models.BooleanField(default=False)
    provider_used = models.CharField(max_length=50, blank=True, default="")
    is_cached = models.BooleanField(default=False, db_index=True)
    cache_entry = models.ForeignKey(
        AIResponseCache,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="session_messages",
    )
    cache_match_type = models.CharField(max_length=20, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        cached_flag = " [CACHED]" if self.is_cached else ""
        return f"{self.role}{cached_flag}: {self.content[:40]}"
