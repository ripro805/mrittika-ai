from django.urls import path

from .portal_views import (
    AdminActivityLogListView,
    AdminOverviewView,
    AdminUserListView,
    AdminUserUpdateView,
    FarmerOverviewView,
    OfficerAnalyticsView,
    OfficerOverviewView,
)
from .views import HealthView, ModelInfoView, ReadyView

urlpatterns = [
    # Core health & telemetry
    path("health/", HealthView.as_view(), name="health"),
    path("ready/", ReadyView.as_view(), name="ready"),
    path("model-info/", ModelInfoView.as_view(), name="model-info"),

    # Farmer portal
    path("farmer/overview", FarmerOverviewView.as_view(), name="farmer-overview"),

    # Officer portal
    path("officer/overview", OfficerOverviewView.as_view(), name="officer-overview"),
    path("officer/analytics", OfficerAnalyticsView.as_view(), name="officer-analytics"),

    # Admin portal
    path("admin/overview", AdminOverviewView.as_view(), name="admin-overview"),
    path("admin/users", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("admin/activity-logs", AdminActivityLogListView.as_view(), name="admin-activity-logs"),
]
