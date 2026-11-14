"""
Serializers for Recommendation inputs, outputs, and history.
Implements bilingual range and constraint validation.
"""

from rest_framework import serializers

from .models import RecommendationHistory


class CropRecommendInputSerializer(serializers.Serializer):
    N = serializers.FloatField(
        min_value=0.0,
        max_value=300.0,
        error_messages={
            "min_value": "নাইট্রোজেনের পরিমাণ ০ এর কম হতে পারে না (N must be >= 0).",
            "max_value": "নাইট্রোজেনের পরিমাণ ৩০০ এর বেশি হতে পারে না (N must be <= 300).",
        },
    )
    P = serializers.FloatField(
        min_value=0.0,
        max_value=200.0,
        error_messages={
            "min_value": "ফসফরাসের পরিমাণ ০ এর কম হতে পারে না (P must be >= 0).",
            "max_value": "ফসফরাসের পরিমাণ ২০০ এর বেশি হতে পারে না (P must be <= 200).",
        },
    )
    K = serializers.FloatField(
        min_value=0.0,
        max_value=300.0,
        error_messages={
            "min_value": "পটাশিয়ামের পরিমাণ ০ এর কম হতে পারে না (K must be >= 0).",
            "max_value": "পটাশিয়ামের পরিমাণ ৩০০ এর বেশি হতে পারে না (K must be <= 300).",
        },
    )
    pH = serializers.FloatField(
        min_value=3.5,
        max_value=9.5,
        error_messages={
            "min_value": "মাটির pH অন্তত ৩.৫ হতে হবে (pH must be >= 3.5).",
            "max_value": "মাটির pH ৯.৫ এর বেশি হতে পারে না (pH must be <= 9.5).",
        },
    )
    temperature = serializers.FloatField(
        min_value=5.0,
        max_value=50.0,
        error_messages={
            "min_value": "তাপমাত্রা ৫°C এর নিচে গ্রহণযোগ্য নয় (Temperature must be >= 5).",
            "max_value": "তাপমাত্রা ৫০°C এর বেশি গ্রহণযোগ্য নয় (Temperature must be <= 50).",
        },
    )
    humidity = serializers.FloatField(
        min_value=10.0,
        max_value=100.0,
        error_messages={
            "min_value": "আর্দ্রতা ১০% এর নিচে হতে পারে না (Humidity must be >= 10).",
            "max_value": "আর্দ্রতা ১০০% এর বেশি হতে পারে না (Humidity must be <= 100).",
        },
    )
    rainfall = serializers.FloatField(
        min_value=0.0,
        max_value=1200.0,
        error_messages={
            "min_value": "বৃষ্টিপাত ০ এর কম হতে পারে না (Rainfall must be >= 0).",
            "max_value": "বৃষ্টিপাত ১২০০ মিলিমিটারের বেশি হতে পারে না (Rainfall must be <= 1200).",
        },
    )
    season = serializers.CharField(max_length=50, default="Rabi")
    soil_type = serializers.CharField(max_length=50, default="Loam")
    district = serializers.CharField(max_length=100, required=False, allow_blank=True)


class FertilizerRecommendInputSerializer(serializers.Serializer):
    crop = serializers.CharField(
        max_length=100,
        error_messages={"required": "ফসলের নাম বা স্লাগ নির্বাচন করুন (Crop is required)."},
    )
    N = serializers.FloatField(min_value=0.0, max_value=300.0)
    P = serializers.FloatField(min_value=0.0, max_value=200.0)
    K = serializers.FloatField(min_value=0.0, max_value=300.0)
    pH = serializers.FloatField(min_value=3.5, max_value=9.5)
    temperature = serializers.FloatField(min_value=5.0, max_value=50.0)
    humidity = serializers.FloatField(min_value=10.0, max_value=100.0)
    rainfall = serializers.FloatField(min_value=0.0, max_value=1200.0)
    season = serializers.CharField(max_length=50, default="Rabi")
    soil_type = serializers.CharField(max_length=50, default="Loam")

    # Optional nutrients
    S = serializers.FloatField(min_value=0.0, max_value=100.0, required=False, allow_null=True)
    Zn = serializers.FloatField(min_value=0.0, max_value=20.0, required=False, allow_null=True)
    organic_matter = serializers.FloatField(min_value=0.0, max_value=10.0, required=False, allow_null=True)

    # Optional land area & unit
    land_area = serializers.FloatField(min_value=0.01, required=False, default=1.0)
    land_unit = serializers.ChoiceField(
        choices=["bigha", "decimal", "hectare"],
        required=False,
        default="bigha",
    )


class RecommendationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendationHistory
        fields = [
            "id",
            "rec_type",
            "crop_slug",
            "crop_name_bn",
            "fertilizer_plan",
            "inputs",
            "outputs",
            "created_at",
        ]
