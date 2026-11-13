"""
Mrittika AI URL Configuration.
All API endpoints are versioned under /api/v1/
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),

    # OpenAPI Schema & Swagger UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # Core (health, ready, model-info)
    path("api/v1/", include("apps.core.urls")),

    # Authentication & Profile
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.accounts.me_urls")),

    # Crop registry & metadata options
    path("api/v1/", include("apps.crops.urls")),

    # Recommendations & History
    path("api/v1/", include("apps.recommendations.urls")),

    # Weather
    path("api/v1/", include("apps.weather.urls")),

    # Bangla Agricultural Assistant (RAG)
    path("api/v1/", include("apps.assistant.urls")),

    # Feedback & Officer audit
    path("api/v1/", include("apps.feedback.urls")),
]
