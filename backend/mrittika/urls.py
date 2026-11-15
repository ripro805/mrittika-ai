"""
Mrittika AI URL Configuration.
All API endpoints are versioned under /api/v1/
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

def root_view(request):
    return JsonResponse({
        "status": "online",
        "service": "Mrittika AI (মৃত্তিকা এআই) Backend API",
        "version": "1.0.0",
        "documentation": "/api/docs/",
        "health": "/api/v1/health/",
    })

def custom_server_error(request, *args, **kwargs):
    origin = request.headers.get("Origin", "")
    allowed = origin if ("vercel.app" in origin or "localhost" in origin or "127.0.0.1" in origin) else "*"
    response = JsonResponse(
        {
            "error": "সার্ভারে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
            "detail": "Internal server error occurred.",
            "fallback": True,
        },
        status=500,
    )
    response["Access-Control-Allow-Origin"] = allowed
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = "accept, authorization, content-type, user-agent, x-csrftoken, x-requested-with"
    response["Access-Control-Allow-Methods"] = "DELETE, GET, OPTIONS, PATCH, POST, PUT"
    return response

handler500 = custom_server_error

urlpatterns = [
    path("", root_view, name="root"),
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
    path("api/v1/assistant/", include("apps.assistant.urls")),

    # Feedback & Officer audit
    path("api/v1/", include("apps.feedback.urls")),
]
