"""
Metadata Options API view for Mrittika AI.
"""

from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .registry import BANGLADESH_DISTRICTS, CANONICAL_CROPS


class MetaOptionsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Metadata Options",
        description="Returns canonical crop options, soil types, seasons, districts with GPS coordinates, units, and input validation bounds.",
    )
    def get(self, request):
        return Response({
            "crops": CANONICAL_CROPS,
            "seasons": [
                {"id": "Kharif-1", "name_bn": "খরিফ-১ (মার্চ-মে / প্রাক-বর্ষা)", "name_en": "Kharif-1 (Early Summer)"},
                {"id": "Kharif-2", "name_bn": "খরিফ-২ (জুন-অক্টোবর / বর্ষা)", "name_en": "Kharif-2 (Monsoon)"},
                {"id": "Rabi", "name_bn": "রবি (নভেম্বর-ফেব্রুয়ারি / শীতকাল)", "name_en": "Rabi (Winter)"},
                {"id": "Perennial", "name_bn": "বহুবর্ষজীবী (বারোমাসি)", "name_en": "Perennial"},
                {"id": "Year-round", "name_bn": "সারা বছর", "name_en": "Year-round"},
            ],
            "soil_types": [
                {"id": "Loam", "name_bn": "দোআঁশ (Loam)", "name_en": "Loam"},
                {"id": "Sandy Loam", "name_bn": "বেলে দোআঁশ (Sandy Loam)", "name_en": "Sandy Loam"},
                {"id": "Clay Loam", "name_bn": "এঁটেল দোআঁশ (Clay Loam)", "name_en": "Clay Loam"},
                {"id": "Clay", "name_bn": "এঁটেল মাটি (Clay)", "name_en": "Clay"},
                {"id": "Silty Loam", "name_bn": "পলি দোআঁশ (Silty Loam)", "name_en": "Silty Loam"},
                {"id": "Silty Clay", "name_bn": "পলি এঁটেল (Silty Clay)", "name_en": "Silty Clay"},
                {"id": "Sandy", "name_bn": "বেলে মাটি (Sandy)", "name_en": "Sandy"},
                {"id": "Loam (Acidic Hill Soil)", "name_bn": "পাহাড়ি অম্লীয় দোআঁশ (Acidic Hill Soil)", "name_en": "Loam (Acidic Hill Soil)"},
            ],
            "districts": BANGLADESH_DISTRICTS,
            "units": [
                {"id": "kg_bigha", "name_bn": "কেজি / বিঘা (৩৩ শতক)", "name_en": "kg / Bigha (33 decimals)", "multiplier_from_kg_ha": 0.13355},
                {"id": "kg_decimal", "name_bn": "কেজি / শতক (ডেসিমাল)", "name_en": "kg / Decimal", "multiplier_from_kg_ha": 0.004047},
                {"id": "kg_ha", "name_bn": "কেজি / হেক্টর", "name_en": "kg / Hectare", "multiplier_from_kg_ha": 1.0},
            ],
            "input_ranges": {
                "N": {"min": 0.0, "max": 300.0, "default": 90.0, "unit": "kg/ha equiv", "label_bn": "নাইট্রোজেন (N)"},
                "P": {"min": 0.0, "max": 200.0, "default": 45.0, "unit": "kg/ha equiv", "label_bn": "ফসফরাস (P)"},
                "K": {"min": 0.0, "max": 300.0, "default": 60.0, "unit": "kg/ha equiv", "label_bn": "পটাশিয়াম (K)"},
                "pH": {"min": 3.5, "max": 9.5, "default": 6.5, "unit": "pH scale", "label_bn": "মাটির পিএইচ (pH)"},
                "S": {"min": 0.0, "max": 100.0, "default": 20.0, "unit": "kg/ha equiv", "label_bn": "সালফার / গন্ধক (S)"},
                "Zn": {"min": 0.0, "max": 20.0, "default": 2.5, "unit": "kg/ha equiv", "label_bn": "জিংক / দস্তা (Zn)"},
                "organic_matter": {"min": 0.0, "max": 10.0, "default": 1.8, "unit": "%", "label_bn": "জৈব পদার্থ (OM %)"},
                "temperature": {"min": 5.0, "max": 50.0, "default": 25.0, "unit": "°C", "label_bn": "তাপমাত্রা (°C)"},
                "humidity": {"min": 10.0, "max": 100.0, "default": 75.0, "unit": "%", "label_bn": "বায়ুর আর্দ্রতা (%)"},
                "rainfall": {"min": 0.0, "max": 1200.0, "default": 150.0, "unit": "mm", "label_bn": "বৃষ্টিপাত (mm)"},
            },
        })
