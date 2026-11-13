from django.urls import path

from .views import (
    CropRecommendView,
    DownloadReportPDFView,
    FertilizerRecommendView,
    HistoryDetailView,
    HistoryListView,
)

urlpatterns = [
    path("crop/recommend", CropRecommendView.as_view(), name="crop-recommend"),
    path("fertilizer/recommend", FertilizerRecommendView.as_view(), name="fertilizer-recommend"),
    path("history", HistoryListView.as_view(), name="history-list"),
    path("history/<int:pk>", HistoryDetailView.as_view(), name="history-detail"),
    path("report/<int:pk>.pdf", DownloadReportPDFView.as_view(), name="report-pdf"),
]
