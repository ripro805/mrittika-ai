"""
Models for Core System Activity Auditing and Metrics.
"""

from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    class ActionType(models.TextChoices):
        USER_LOGIN = "USER_LOGIN", "ব্যবহারকারী লগইন (User Login)"
        USER_REGISTER = "USER_REGISTER", "নতুন নিবন্ধন (User Register)"
        CROP_RECOMMEND = "CROP_RECOMMEND", "ফসল সুপারিশ (Crop Recommendation)"
        FERTILIZER_RECOMMEND = "FERTILIZER_RECOMMEND", "সার সুপারিশ (Fertilizer Recommendation)"
        CHAT_QUERY = "CHAT_QUERY", "কৃষি সহকারী জিজ্ঞাসা (Chat Query)"
        OFFICER_CORRECTION = "OFFICER_CORRECTION", "কর্মকর্তা সংশোধন (Officer Correction)"
        DOC_INGEST = "DOC_INGEST", "নথি সংযোজন (Document Ingest)"
        MODEL_SWITCH = "MODEL_SWITCH", "মডেল পরিবর্তন (Model Switch)"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    action = models.CharField(max_length=60, choices=ActionType.choices, db_index=True)
    description = models.TextField(blank=True, default="")
    metadata = models.JSONField(blank=True, default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Activity Log"
        verbose_name_plural = "Activity Logs"

    def __str__(self):
        user_str = self.user.phone if self.user else "Anonymous"
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {user_str} - {self.action}"
