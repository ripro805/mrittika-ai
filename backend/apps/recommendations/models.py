"""
Models for storing user recommendation history and generated reports.
"""

from django.conf import settings
from django.db import models


class RecommendationHistory(models.Model):
    class Type(models.TextChoices):
        CROP = "CROP", "ফসলের সুপারিশ (Crop)"
        FERTILIZER = "FERTILIZER", "সারের সুপারিশ (Fertilizer)"
        COMBINED = "COMBINED", "সমন্বিত পরামর্শ (Combined)"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recommendations",
        null=True,
        blank=True,
        db_index=True,
    )
    rec_type = models.CharField(
        max_length=20,
        choices=Type.choices,
        default=Type.COMBINED,
        db_index=True,
    )
    crop_slug = models.CharField(max_length=100, blank=True, default="")
    crop_name_bn = models.CharField(max_length=150, blank=True, default="")
    fertilizer_plan = models.CharField(max_length=100, blank=True, default="")

    inputs = models.JSONField(
        default=dict,
        help_text="Snapshot of soil and weather inputs.",
    )
    outputs = models.JSONField(
        default=dict,
        help_text="Snapshot of top-3 crops or fertilizer plan items.",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Recommendation History"
        verbose_name_plural = "Recommendation Histories"

    def __str__(self):
        user_str = self.user.phone if self.user else "Guest"
        return f"{user_str} - {self.rec_type} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
