"""
Assistant URL Configuration.
"""

from django.urls import path

from .cache_admin_views import (
    AdminCacheActionView,
    AdminCacheClearExpiredView,
    AdminCacheDetailView,
    AdminCacheListView,
    AdminCacheStatsView,
    OfficerCacheReviewView,
)
from .views import (
    AdminKnowledgeDeleteView,
    AdminKnowledgeListView,
    AdminKnowledgeReindexView,
    AdminKnowledgeUploadView,
    AssistantFeedbackView,
    AssistantHealthView,
    ChatStreamView,
    ChatView,
    OfficerCorrectionView,
    OfficerFlaggedListView,
    SessionDetailView,
    SessionListView,
)

urlpatterns = [
    # Chat endpoints
    path("chat", ChatView.as_view(), name="assistant-chat"),
    path("chat/", ChatView.as_view(), name="assistant-chat-slash"),
    path("chat/stream", ChatStreamView.as_view(), name="assistant-chat-stream-noslash"),
    path("chat/stream/", ChatStreamView.as_view(), name="assistant-chat-stream"),
    path("health/", AssistantHealthView.as_view(), name="assistant-health"),

    # Session management (authenticated users)
    path("sessions/", SessionListView.as_view(), name="assistant-sessions"),
    path("sessions/<uuid:session_id>/", SessionDetailView.as_view(), name="assistant-session-detail"),

    # Feedback & Officer auditing
    path("feedback/", AssistantFeedbackView.as_view(), name="assistant-feedback"),
    path("officer/flagged/", OfficerFlaggedListView.as_view(), name="assistant-officer-flagged"),
    path("officer/correct/", OfficerCorrectionView.as_view(), name="assistant-officer-correct"),
    path("officer/cache-reviews/", OfficerCacheReviewView.as_view(), name="assistant-officer-cache-list"),
    path("officer/cache/<uuid:pk>/review/", OfficerCacheReviewView.as_view(), name="assistant-officer-cache-review"),

    # Admin knowledge document management
    path("admin/documents/", AdminKnowledgeListView.as_view(), name="assistant-admin-docs"),
    path("admin/documents/upload", AdminKnowledgeUploadView.as_view(), name="assistant-admin-upload"),
    path("admin/documents/<str:filename>/", AdminKnowledgeDeleteView.as_view(), name="assistant-admin-delete"),
    path("admin/reindex/", AdminKnowledgeReindexView.as_view(), name="assistant-admin-reindex"),

    # Admin AI Response Cache management
    path("admin/cache/", AdminCacheListView.as_view(), name="assistant-admin-cache-list"),
    path("admin/cache/stats/", AdminCacheStatsView.as_view(), name="assistant-admin-cache-stats"),
    path("admin/cache/clear-expired/", AdminCacheClearExpiredView.as_view(), name="assistant-admin-cache-clear-expired"),
    path("admin/cache/<uuid:pk>/", AdminCacheDetailView.as_view(), name="assistant-admin-cache-detail"),
    path("admin/cache/<uuid:pk>/action/", AdminCacheActionView.as_view(), name="assistant-admin-cache-action"),

    # Legacy compatibility paths
    path("admin/knowledge", AdminKnowledgeListView.as_view(), name="legacy-admin-knowledge-list"),
    path("admin/knowledge/upload", AdminKnowledgeUploadView.as_view(), name="legacy-admin-knowledge-upload"),
]
