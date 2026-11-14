"""
Weather API views.
"""

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import fetch_weather_for_district


class WeatherView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="District Weather Forecast & Autofill",
        description="Retrieves live temperature, humidity, and rainfall from Open-Meteo with 30-min cache and graceful fallback.",
        parameters=[
            OpenApiParameter(
                name="district",
                description="District name in English or Bangla (e.g. Bogra, Dhaka, বগুড়া)",
                required=False,
                type=str,
            ),
        ],
    )
    def get(self, request):
        district = request.query_params.get("district", "Dhaka")
        weather_data = fetch_weather_for_district(district)
        return Response(weather_data)
