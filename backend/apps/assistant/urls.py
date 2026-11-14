"""
Assistant URL Configuration.
"""

from django.urls import path

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
    path("chat/stream/", ChatStreamView.as_view(), name="assistant-chat-stream"),
    path("health/", AssistantHealthView.as_view(), name="assistant-health"),

    # Session management (authenticated users)
    path("sessions/", SessionListView.as_view(), name="assistant-sessions"),
    path("sessions/<uuid:session_id>/", SessionDetailView.as_view(), name="assistant-session-detail"),

    # Feedback & Officer auditing
    path("feedback/", AssistantFeedbackView.as_view(), name="assistant-feedback"),
    path("officer/flagged/", OfficerFlaggedListView.as_view(), name="assistant-officer-flagged"),
    path("officer/correct/", OfficerCorrectionView.as_view(), name="assistant-officer-correct"),

    # Admin knowledge document management
    path("admin/documents/", AdminKnowledgeListView.as_view(), name="assistant-admin-docs"),
    path("admin/documents/upload", AdminKnowledgeUploadView.as_view(), name="assistant-admin-upload"),
    path("admin/documents/<str:filename>/", AdminKnowledgeDeleteView.as_view(), name="assistant-admin-delete"),
    path("admin/reindex/", AdminKnowledgeReindexView.as_view(), name="assistant-admin-reindex"),

    # Legacy compatibility paths
    path("admin/knowledge", AdminKnowledgeListView.as_view(), name="legacy-admin-knowledge-list"),
    path("admin/knowledge/upload", AdminKnowledgeUploadView.as_view(), name="legacy-admin-knowledge-upload"),
]
