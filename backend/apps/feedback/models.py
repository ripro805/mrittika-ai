"""
Models for User Feedback and Extension Officer Agronomic Corrections.
"""

from django.conf import settings
from django.db import models


class Feedback(models.Model):
    class ModuleType(models.TextChoices):
        CROP = "CROP", "ফসলের সুপারিশ (Crop)"
        FERTILIZER = "FERTILIZER", "সারের সুপারিশ (Fertilizer)"
        CHAT = "CHAT", "কৃষি সহকারী (Assistant)"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedbacks",
    )
    module_type = models.CharField(
        max_length=20,
        choices=ModuleType.choices,
        default=ModuleType.CHAT,
        db_index=True,
    )
    rating = models.PositiveSmallIntegerField(
        default=5,
        help_text="Rating score from 1 to 5.",
    )
    flagged = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Marked as problematic or requiring agronomic officer review.",
    )
    comment = models.TextField(blank=True, default="")
    context_data = models.JSONField(blank=True, default=dict)

    # Officer review & correction
    officer_correction = models.TextField(blank=True, default="")
    corrected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="corrections_made",
    )
    is_resolved = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Feedback"
        verbose_name_plural = "Feedbacks"

    def __str__(self):
        flag_str = " [FLAGGED]" if self.flagged else ""
        return f"Feedback #{self.id} ({self.module_type}, {self.rating}★){flag_str}"
