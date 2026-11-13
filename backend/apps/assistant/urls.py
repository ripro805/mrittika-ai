from django.urls import path

from .views import AdminKnowledgeListView, AdminKnowledgeUploadView, ChatView

urlpatterns = [
    path("chat", ChatView.as_view(), name="chat"),
    path("admin/knowledge", AdminKnowledgeListView.as_view(), name="admin-knowledge-list"),
    path("admin/knowledge/upload", AdminKnowledgeUploadView.as_view(), name="admin-knowledge-upload"),
]
