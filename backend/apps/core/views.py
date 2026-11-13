"""
Core system views: Health, Readiness, and Model Info.
"""

import json
from pathlib import Path

from django.conf import settings
from django.db import connection
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Liveness probe returning 200 if the process is up."""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Service Liveness Probe",
        description="Returns 200 if the backend server process is alive.",
        responses={200: OpenApiResponse(description="Process is healthy")},
    )
    def get(self, request):
        return Response(
            {"status": "ok", "service": "Mrittika AI Backend", "version": "1.0.0"},
            status=status.HTTP_200_OK,
        )


class ReadyView(APIView):
    """Readiness probe checking database connectivity and ML model integrity."""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Service Readiness Probe",
        description="Verifies database connection and loaded ML models.",
        responses={200: OpenApiResponse(description="Ready to serve traffic")},
    )
    def get(self, request):
        checks = {}
        all_ready = True

        # 1. Database check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                checks["database"] = "ok" if row and row[0] == 1 else "error"
        except Exception as e:
            checks["database"] = f"error: {str(e)}"
            all_ready = False

        # 2. Model files check
        models_dir: Path = settings.ML_MODELS_DIR
        lock_file = models_dir / "models.lock"
        crop_model = models_dir / "mrittika_crop_model.pkl"
        fert_model = models_dir / "mrittika_fertilizer_model.pkl"

        if crop_model.exists() and fert_model.exists() and lock_file.exists():
            checks["ml_models"] = "ok"
        else:
            checks["ml_models"] = "missing_or_uninitialized"
            all_ready = False

        status_code = status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(
            {
                "status": "ready" if all_ready else "not_ready",
                "checks": checks,
            },
            status=status_code,
        )


class ModelInfoView(APIView):
    """Provides model metadata, benchmark metrics, and synthetic data disclaimer."""
    permission_classes = [AllowAny]

    @extend_schema(
        summary="ML Model Metrics & Agronomic Limitations",
        description="Fetches benchmark metrics from training and prominent disclaimer regarding synthetic data limitations.",
        responses={200: OpenApiResponse(description="Model metadata and disclosures")},
    )
    def get(self, request):
        models_dir: Path = settings.ML_MODELS_DIR
        crop_metrics_path = models_dir / "metrics.json"
        fert_metrics_path = models_dir / "fertilizer_metrics.json"

        crop_metrics = {}
        fert_metrics = {}

        if crop_metrics_path.exists():
            try:
                with open(crop_metrics_path, "r", encoding="utf-8") as f:
                    crop_metrics = json.load(f)
            except Exception as err:
                import logging
                logging.getLogger(__name__).debug("Crop metrics read error: %s", err)

        if fert_metrics_path.exists():
            try:
                with open(fert_metrics_path, "r", encoding="utf-8") as f:
                    fert_metrics = json.load(f)
            except Exception as err:
                import logging
                logging.getLogger(__name__).debug("Fertilizer metrics read error: %s", err)

        return Response({
            "models": {
                "crop_recommendation": {
                    "architecture": "ExtraTreesClassifier with ColumnTransformer (num: median imputer, cat: OHE)",
                    "supported_crops_count": 24,
                    "metrics": crop_metrics,
                },
                "fertilizer_recommendation": {
                    "classifier": "XGBoost Classifier (8 Fertilizer Plan classes)",
                    "regressor": "LightGBM MultiOutputRegressor (7 Fertilizer Doses in kg/ha)",
                    "supported_crops_count": 13,
                    "metrics": fert_metrics,
                },
            },
            "disclaimer": {
                "bn": "সতর্কবার্তা: বর্তমান মডেলগুলোর প্রশিক্ষণে ব্যবহৃত ডেটাসেট কৃত্রিম বা সিন্থেটিক (Synthetic Data) তথ্যের সমন্বয়ে তৈরি। এই সুপারিশগুলো কৃষকদের সহায়তার জন্য একটি প্রোটোটাইপ গাইড। জমিতে সার ও কীটনাশক ব্যবহারের পূর্বে সর্বদা উপজেলা কৃষি অফিস বা উপসহকারী কৃষি কর্মকর্তার সাথে পরামর্শ করুন।",
                "en": "Notice: The underlying training datasets incorporate synthetic agronomic data generated for research and decision-support modeling. These advisories serve as decision-support guides and do not replace certified agronomist evaluations.",
                "is_synthetic": True,
                "advisory_authority": "Consult local Upazila Agriculture Office (DAE / উপজেলা কৃষি অফিস).",
            },
        })
