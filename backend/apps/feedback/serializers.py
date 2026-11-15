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

    def to_internal_value(self, data):
        if isinstance(data, dict) and "module_type" in data:
            val = str(data["module_type"]).upper().strip()
            if val in ["ASSISTANT", "CHATBOT", "CHAT"]:
                data = {**data, "module_type": Feedback.ModuleType.CHAT}
            elif val in ["CROP", "CROPS"]:
                data = {**data, "module_type": Feedback.ModuleType.CROP}
            elif val in ["FERTILIZER", "FERTILIZERS"]:
                data = {**data, "module_type": Feedback.ModuleType.FERTILIZER}
        return super().to_internal_value(data)

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
        required=False,
        error_messages={"required": "সংশোধন বার্তা লিখুন (Correction text is required)."},
    )

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        if "officer_correction" not in ret or not ret["officer_correction"]:
            alt = data.get("correction_text") or data.get("correction")
            if alt and len(str(alt).strip()) >= 5:
                ret["officer_correction"] = str(alt).strip()
            else:
                raise serializers.ValidationError({"officer_correction": "সংশোধন বার্তা লিখুন (Correction text is required)."})
        return ret
