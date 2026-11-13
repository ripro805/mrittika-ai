"""
Recommendation API views: Crop Recommend, Fertilizer Recommend, History, and PDF Download.
"""

from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import RecommendationHistory
from .pdf_report import generate_advisory_pdf
from .serializers import (
    CropRecommendInputSerializer,
    FertilizerRecommendInputSerializer,
    RecommendationHistorySerializer,
)
from .services import run_crop_recommendation, run_fertilizer_recommendation


class MLRateThrottle(ScopedRateThrottle):
    scope = "anon_ml"


class CropRecommendView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [MLRateThrottle]

    @extend_schema(
        summary="Crop Recommendation",
        description="Predicts top-3 crops with confidence percentages and agronomic explanations.",
        request=CropRecommendInputSerializer,
    )
    def post(self, request):
        serializer = CropRecommendInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = run_crop_recommendation(
            n=data["N"],
            p=data["P"],
            k=data["K"],
            ph=data["pH"],
            temperature=data["temperature"],
            humidity=data["humidity"],
            rainfall=data["rainfall"],
            season=data.get("season", "Rabi"),
            soil_type=data.get("soil_type", "Loam"),
        )

        # Save history if user is authenticated
        history_id = None
        if request.user and request.user.is_authenticated:
            top_rec = result["recommendations"][0] if result["recommendations"] else {}
            history = RecommendationHistory.objects.create(
                user=request.user,
                rec_type=RecommendationHistory.Type.CROP,
                crop_slug=top_rec.get("crop_slug", ""),
                crop_name_bn=top_rec.get("crop_name_bn", ""),
                inputs=data,
                outputs=result,
            )
            history_id = history.id

        result["history_id"] = history_id
        return Response(result, status=status.HTTP_200_OK)


class FertilizerRecommendView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [MLRateThrottle]

    @extend_schema(
        summary="Fertilizer Recommendation",
        description="Predicts fertilizer dosages in kg/ha, kg/bigha, kg/decimal, application schedule and soil notes.",
        request=FertilizerRecommendInputSerializer,
    )
    def post(self, request):
        serializer = FertilizerRecommendInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = run_fertilizer_recommendation(
            crop_slug=data["crop"],
            n=data["N"],
            p=data["P"],
            k=data["K"],
            ph=data["pH"],
            temperature=data["temperature"],
            humidity=data["humidity"],
            rainfall=data["rainfall"],
            season=data.get("season", "Rabi"),
            soil_type=data.get("soil_type", "Loam"),
            s=data.get("S"),
            zn=data.get("Zn"),
            organic_matter=data.get("organic_matter"),
            land_area=data.get("land_area", 1.0),
            land_unit=data.get("land_unit", "bigha"),
        )

        if not result.get("supported"):
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        # Save history if authenticated
        history_id = None
        if request.user and request.user.is_authenticated:
            history = RecommendationHistory.objects.create(
                user=request.user,
                rec_type=RecommendationHistory.Type.FERTILIZER,
                crop_slug=result.get("crop_slug", ""),
                crop_name_bn=result.get("crop_name_bn", ""),
                fertilizer_plan=result.get("fertilizer_plan", ""),
                inputs=data,
                outputs=result,
            )
            history_id = history.id

        result["history_id"] = history_id
        return Response(result, status=status.HTTP_200_OK)


class HistoryListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="User Recommendation History",
        responses={200: RecommendationHistorySerializer(many=True)},
    )
    def get(self, request):
        histories = RecommendationHistory.objects.filter(user=request.user)
        return Response(RecommendationHistorySerializer(histories, many=True).data)


class HistoryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Delete History Record",
        description="Deletes a specific history record belonging to the authenticated user.",
    )
    def delete(self, request, pk):
        try:
            history = RecommendationHistory.objects.get(pk=pk)
        except RecommendationHistory.DoesNotExist:
            return Response(
                {"error": "রেকর্ডটি পাওয়া যায়নি (Record not found)."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # IDOR protection: only owner or staff
        if history.user != request.user and not request.user.is_staff:
            return Response(
                {"error": "এই তথ্যটি মুছে ফেলার অনুমতি আপনার নেই (Access Denied)."},
                status=status.HTTP_403_FORBIDDEN,
            )

        history.delete()
        return Response({"message": "রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে (Deleted)."}, status=status.HTTP_200_OK)


class DownloadReportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Download Advisory Report PDF",
        description="Generates and streams a single-page PDF with embedded Noto Sans Bengali font.",
    )
    def get(self, request, pk):
        try:
            history = RecommendationHistory.objects.get(pk=pk)
        except RecommendationHistory.DoesNotExist:
            return Response(
                {"error": "রেকর্ডটি পাওয়া যায়নি (Record not found)."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # IDOR protection: only owner or staff
        if history.user != request.user and not request.user.is_staff:
            return Response(
                {"error": "এই রিপোর্টটি দেখার অনুমতি আপনার নেই (Access Denied)."},
                status=status.HTTP_403_FORBIDDEN,
            )

        farmer_name = request.user.name or "সম্মানিত কৃষক"
        pdf_bytes = generate_advisory_pdf(history, farmer_name=farmer_name)

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        filename = f"mrittika_advisory_{history.id}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
