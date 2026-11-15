"""
Portal Backend Views for Farmer, Extension Officer, and Admin Portals.
Provides high-performance aggregation and role-scoped endpoints.
"""

from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..accounts.permissions import IsAdminRole, IsFarmer, IsVerifiedOfficer
from ..accounts.serializers import UserSerializer
from ..assistant.models import AssistantMessage, AssistantSession
from ..core.models import ActivityLog
from ..feedback.models import Feedback
from ..feedback.serializers import FeedbackDetailSerializer
from ..recommendations.models import RecommendationHistory
from ..recommendations.serializers import RecommendationHistorySerializer
from ..weather.services import fetch_weather_for_district

User = get_user_model()


# ==============================================================================
# 1. FARMER PORTAL VIEWS
# ==============================================================================

class FarmerOverviewView(APIView):
    permission_classes = [IsFarmer]

    @extend_schema(summary="Farmer Dashboard Overview")
    def get(self, request):
        user = request.user
        user_recs = RecommendationHistory.objects.filter(user=user)

        total_recs = user_recs.count()
        crop_recs = user_recs.filter(rec_type=RecommendationHistory.Type.CROP).count()
        fert_recs = user_recs.filter(rec_type=RecommendationHistory.Type.FERTILIZER).count()
        chat_sessions = AssistantSession.objects.filter(user=user).count()

        recent_recs = user_recs[:5]

        # Weather for farmer's district
        district = user.district or "Bogra"
        try:
            weather_data = fetch_weather_for_district(district)
        except Exception:
            weather_data = {
                "temperature": 24.5,
                "humidity": 70.0,
                "rainfall": 10.0,
                "season": "Rabi",
                "district_bn": district,
                "fallback": True,
            }

        return Response({
            "farmer": {
                "id": user.id,
                "name": user.name,
                "phone": user.phone,
                "district": user.district,
                "upazila": user.upazila,
                "role": user.role,
            },
            "stats": {
                "total_recommendations": total_recs,
                "crop_recommendations": crop_recs,
                "fertilizer_plans": fert_recs,
                "chat_sessions": chat_sessions,
            },
            "weather": weather_data,
            "recent_recommendations": RecommendationHistorySerializer(recent_recs, many=True).data,
            "seasonal_tip": {
                "title_bn": "রবি মৌসুমের বিশেষ পরামর্শ",
                "content_bn": "শীতকালে মাটিতে রসের ঘাটতি দেখা দিতে পারে। গম, সরিষা ও আলুর ক্ষেতে সময়মতো হালকা সেচ প্রদান নিশ্চিত করুন।",
            },
        })


# ==============================================================================
# 2. EXTENSION OFFICER PORTAL VIEWS
# ==============================================================================

class OfficerOverviewView(APIView):
    permission_classes = [IsVerifiedOfficer]

    @extend_schema(summary="Officer Dashboard Overview")
    def get(self, request):
        officer = request.user
        all_flagged = Feedback.objects.filter(flagged=True)

        total_flagged = all_flagged.count()
        pending_count = all_flagged.filter(is_resolved=False).count()
        resolved_count = all_flagged.filter(is_resolved=True).count()
        my_corrections = Feedback.objects.filter(corrected_by=officer).count()

        recent_pending = all_flagged.filter(is_resolved=False).order_by("-created_at")[:5]
        recent_resolved = all_flagged.filter(is_resolved=True).order_by("-updated_at")[:5]

        return Response({
            "officer": {
                "id": officer.id,
                "name": officer.name,
                "phone": officer.phone,
                "district": officer.district,
                "upazila": officer.upazila,
                "is_verified": officer.is_verified,
            },
            "stats": {
                "total_flagged": total_flagged,
                "pending_reviews": pending_count,
                "resolved_reviews": resolved_count,
                "my_corrections": my_corrections,
                "resolution_rate_percent": round((resolved_count / total_flagged * 100), 1) if total_flagged else 100,
            },
            "recent_pending": FeedbackDetailSerializer(recent_pending, many=True).data,
            "recent_resolved": FeedbackDetailSerializer(recent_resolved, many=True).data,
        })


class OfficerAnalyticsView(APIView):
    permission_classes = [IsVerifiedOfficer]

    @extend_schema(summary="Officer Regional Agronomic Analytics")
    def get(self, request):
        # Distribution of crops queried in recommendations
        crop_counts = (
            RecommendationHistory.objects.values("crop_slug", "crop_name_bn")
            .annotate(query_count=Count("id"))
            .filter(crop_slug__gt="")
            .order_by("-query_count")[:8]
        )

        # Rating breakdown
        ratings = Feedback.objects.values("rating").annotate(count=Count("id")).order_by("rating")

        # Top flagged categories
        category_breakdown = Feedback.objects.values("module_type").annotate(count=Count("id"))

        return Response({
            "top_crops": list(crop_counts),
            "ratings_distribution": list(ratings),
            "module_feedback_counts": list(category_breakdown),
        })


# ==============================================================================
# 3. ADMIN PORTAL VIEWS
# ==============================================================================

class AdminOverviewView(APIView):
    permission_classes = [IsAdminRole]

    @extend_schema(summary="Admin Executive Command Overview")
    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # User metrics
        users_by_role = User.objects.values("role").annotate(count=Count("id"))
        role_map = {item["role"]: item["count"] for item in users_by_role}

        total_users = User.objects.count()
        new_users_month = User.objects.filter(created_at__gte=thirty_days_ago).count()

        # Recommendation metrics
        total_recs = RecommendationHistory.objects.count()
        crop_recs = RecommendationHistory.objects.filter(rec_type=RecommendationHistory.Type.CROP).count()
        fert_recs = RecommendationHistory.objects.filter(rec_type=RecommendationHistory.Type.FERTILIZER).count()

        # Assistant metrics
        total_sessions = AssistantSession.objects.count()
        total_messages = AssistantMessage.objects.count()

        # Feedback metrics
        total_feedbacks = Feedback.objects.count()
        flagged_feedbacks = Feedback.objects.filter(flagged=True).count()
        resolved_feedbacks = Feedback.objects.filter(is_resolved=True).count()

        # Recent audit logs
        recent_logs = ActivityLog.objects.order_by("-created_at")[:10]

        return Response({
            "users": {
                "total": total_users,
                "farmers": role_map.get("FARMER", 0),
                "officers": role_map.get("OFFICER", 0),
                "admins": role_map.get("ADMIN", 0),
                "new_last_30_days": new_users_month,
            },
            "recommendations": {
                "total": total_recs,
                "crop": crop_recs,
                "fertilizer": fert_recs,
            },
            "assistant": {
                "sessions": total_sessions,
                "messages": total_messages,
            },
            "audits": {
                "total_feedback": total_feedbacks,
                "flagged": flagged_feedbacks,
                "resolved": resolved_feedbacks,
                "pending": flagged_feedbacks - resolved_feedbacks,
            },
            "system_health": {
                "database": "online",
                "ml_crop_model": "active (ExtraTreesClassifier)",
                "ml_fertilizer_model": "active (MultiOutputRegressor)",
                "rag_vector_db": "active (ChromaDB)",
                "llm_primary": "groq/openai/gpt-oss-120b",
                "llm_secondary": "gemini/gemini-2.5-flash-lite",
            },
            "recent_activity": [
                {
                    "id": log.id,
                    "action": log.action,
                    "description": log.description,
                    "ip": log.ip_address,
                    "created_at": log.created_at,
                }
                for log in recent_logs
            ],
        })


class AdminUserListView(APIView):
    permission_classes = [IsAdminRole]

    @extend_schema(summary="Admin List & Filter Users")
    def get(self, request):
        role_filter = request.query_params.get("role")
        search_query = request.query_params.get("search", "").strip()

        qs = User.objects.all()
        if role_filter:
            qs = qs.filter(role=role_filter.upper())
        if search_query:
            qs = qs.filter(Q(name__icontains=search_query) | Q(phone__icontains=search_query) | Q(district__icontains=search_query))

        limit = int(request.query_params.get("limit", 50))
        users = qs.order_by("-created_at")[:limit]

        return Response({
            "total": qs.count(),
            "users": UserSerializer(users, many=True).data,
        })


class AdminUserUpdateView(APIView):
    permission_classes = [IsAdminRole]

    @extend_schema(summary="Admin Toggle User Status or Update Role")
    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "ব্যবহারকারী পাওয়া যায়নি (User not found)."}, status=status.HTTP_404_NOT_FOUND)

        if "is_active" in request.data:
            user.is_active = bool(request.data["is_active"])
        if "role" in request.data and request.data["role"] in dict(User.Role.choices):
            user.role = request.data["role"]
        if "is_verified" in request.data:
            user.is_verified = bool(request.data["is_verified"])

        user.save()

        # Log action
        ActivityLog.objects.create(
            user=request.user,
            action="USER_UPDATE",
            description=f"অ্যাডমিন {request.user.name} ব্যবহারকারী {user.phone}-এর তথ্য পরিবর্তন করেছেন।",
        )

        return Response({
            "message": "ব্যবহারকারীর তথ্য হালনাগাদ হয়েছে (User updated).",
            "user": UserSerializer(user).data,
        })


class AdminActivityLogListView(APIView):
    permission_classes = [IsAdminRole]

    @extend_schema(summary="Admin List System Audit Logs")
    def get(self, request):
        action_filter = request.query_params.get("action")
        search_query = request.query_params.get("search", "").strip()

        qs = ActivityLog.objects.all()
        if action_filter:
            qs = qs.filter(action=action_filter)
        if search_query:
            qs = qs.filter(Q(description__icontains=search_query) | Q(ip_address__icontains=search_query))

        limit = int(request.query_params.get("limit", 50))
        logs = qs.order_by("-created_at")[:limit]

        return Response({
            "total": qs.count(),
            "logs": [
                {
                    "id": log.id,
                    "action": log.action,
                    "description": log.description,
                    "ip": log.ip_address,
                    "metadata": log.metadata,
                    "created_at": log.created_at,
                }
                for log in logs
            ],
        })
