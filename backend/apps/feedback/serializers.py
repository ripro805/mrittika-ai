"""
Serializers for Feedback and Officer Corrections.
"""

from rest_framework import serializers

from .models import Feedback


class FeedbackCreateSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        default=5,
        error_messages={"min_value": "Rating must be between 1 and 5.", "max_value": "Rating must be between 1 and 5."},
    )

    class Meta:
        model = Feedback
        fields = [
            "module_type",
            "rating",
            "flagged",
            "comment",
            "context_data",
        ]


class FeedbackDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    corrected_by_name = serializers.CharField(source="corrected_by.name", read_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id",
            "user_name",
            "user_phone",
            "module_type",
            "rating",
            "flagged",
            "comment",
            "context_data",
            "officer_correction",
            "corrected_by_name",
            "is_resolved",
            "created_at",
            "updated_at",
        ]


class OfficerCorrectionSerializer(serializers.Serializer):
    officer_correction = serializers.CharField(
        min_length=5,
        error_messages={"required": "সংশোধন বার্তা লিখুন (Correction text is required)."},
    )
