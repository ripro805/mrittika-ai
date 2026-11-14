"""
Feedback views for user reviews and extension officer audits.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsVerifiedOfficer

from .models import Feedback
from .serializers import (
    FeedbackCreateSerializer,
    FeedbackDetailSerializer,
    OfficerCorrectionSerializer,
)


class FeedbackCreateView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Submit Feedback or Flag Output",
        description="Submits rating, comment, or flag for crop, fertilizer, or chatbot answer.",
        request=FeedbackCreateSerializer,
        responses={201: FeedbackDetailSerializer},
    )
    def post(self, request):
        serializer = FeedbackCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None

        fb = serializer.save(user=user)
        return Response(
            {
                "message": "মতামত সফলভাবে গৃহীত হয়েছে (Feedback submitted successfully).",
                "feedback": FeedbackDetailSerializer(fb).data,
            },
            status=status.HTTP_201_CREATED,
        )


class OfficerFlaggedFeedbackListView(APIView):
    permission_classes = [IsVerifiedOfficer]

    @extend_schema(
        summary="List Flagged Feedbacks (Extension Officer Only)",
        description="Lists all flagged outputs awaiting agronomic review.",
        responses={200: FeedbackDetailSerializer(many=True)},
    )
    def get(self, request):
        flagged_items = Feedback.objects.filter(flagged=True).order_by("is_resolved", "-created_at")
        return Response(FeedbackDetailSerializer(flagged_items, many=True).data)


class OfficerCorrectionView(APIView):
    permission_classes = [IsVerifiedOfficer]

    @extend_schema(
        summary="Submit Agronomic Correction (Extension Officer Only)",
        request=OfficerCorrectionSerializer,
        responses={200: FeedbackDetailSerializer},
    )
    def post(self, request, pk):
        try:
            fb = Feedback.objects.get(pk=pk)
        except Feedback.DoesNotExist:
            return Response({"error": "ফিডব্যাক পাওয়া যায়নি (Feedback not found)."}, status=status.HTTP_404_NOT_FOUND)

        serializer = OfficerCorrectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        fb.officer_correction = serializer.validated_data["officer_correction"]
        fb.corrected_by = request.user
        fb.is_resolved = True
        fb.save()

        return Response(
            {
                "message": "সংশোধন সফলভাবে সংরক্ষিত হয়েছে (Correction saved).",
                "feedback": FeedbackDetailSerializer(fb).data,
            },
            status=status.HTTP_200_OK,
        )
