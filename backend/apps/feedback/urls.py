from django.urls import path

from .views import (
    FeedbackCreateView,
    OfficerCorrectionView,
    OfficerFlaggedFeedbackListView,
)

urlpatterns = [
    path("feedback", FeedbackCreateView.as_view(), name="feedback-create"),
    path("officer/feedback/flagged", OfficerFlaggedFeedbackListView.as_view(), name="officer-flagged-list"),
    path("officer/feedback/<int:pk>/correction", OfficerCorrectionView.as_view(), name="officer-correction"),
]
