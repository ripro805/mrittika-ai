from django.urls import path

from .views import HealthView, ModelInfoView, ReadyView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("ready/", ReadyView.as_view(), name="ready"),
    path("model-info/", ModelInfoView.as_view(), name="model-info"),
]
