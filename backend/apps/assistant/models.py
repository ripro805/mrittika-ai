"""
Models for Assistant Sessions and Conversation Messages.
Persisted strictly for authenticated users; guest history is managed client-side.
"""

import uuid

from django.conf import settings
from django.db import models


class AssistantSession(models.Model):
    """
    Persistent conversational session for authenticated users.
    """
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
    """
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.content[:40]}"
