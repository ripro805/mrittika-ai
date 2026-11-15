"""
Admin and Officer views for Shared AI Response Cache Management.
Provides endpoints for cache analytics, filtering, inspection, verification,
invalidation, and bulk cleanup.
"""

import logging
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone as dj_timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..accounts.permissions import IsAdminRole, IsVerifiedOfficer

from .cache_service import (
    clear_expired_caches,
    flag_cache_entry_for_review,
    get_cache_analytics,
    invalidate_cache_entry,
    verify_cache_entry,
)
from .models import AIResponseCache

logger = logging.getLogger(__name__)


def serialize_cache_entry(entry: AIResponseCache, include_text: bool = True) -> dict:
    """Helper to serialize an AIResponseCache instance into a clean JSON dictionary."""
    now = dj_timezone.now()
    is_expired = entry.expires_at <= now if entry.expires_at else False

    data = {
        "id": str(entry.id),
        "original_question": entry.original_question,
        "normalized_question": entry.normalized_question,
        "language": entry.language,
        "category": entry.category,
        "category_display": entry.get_category_display(),
        "crop_name": entry.crop_name,
        "matching_type": entry.matching_type,
        "model_name": entry.model_name,
        "hit_count": entry.hit_count,
        "is_active": entry.is_active,
        "is_verified": entry.is_verified,
        "verification_status": entry.verification_status,
        "verification_status_display": entry.get_verification_status_display(),
        "verified_by": entry.verified_by.phone if entry.verified_by else None,
        "invalidation_reason": entry.invalidation_reason,
        "officer_notes": entry.officer_notes,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
        "updated_at": entry.updated_at.isoformat() if entry.updated_at else None,
        "expires_at": entry.expires_at.isoformat() if entry.expires_at else None,
        "last_accessed_at": entry.last_accessed_at.isoformat() if entry.last_accessed_at else None,
        "is_expired": is_expired,
        "has_embedding": bool(entry.embedding),
    }

    if include_text:
        data["response_text"] = entry.response_text
        data["source_references"] = entry.source_references or []
        data["response_metadata"] = entry.response_metadata or {}
        data["fingerprint"] = entry.fingerprint
        data["question_hash"] = entry.question_hash
        data["context_hash"] = entry.context_hash
    else:
        # Truncate response text for list views
        data["response_preview"] = (
            entry.response_text[:160] + "..." if len(entry.response_text) > 160 else entry.response_text
        )

    return data


class AdminCacheStatsView(APIView):
    """
    Returns real-time analytics for the Shared AI Response Cache.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        stats = get_cache_analytics()
        return Response(stats, status=status.HTTP_200_OK)


class AdminCacheListView(APIView):
    """
    List and filter shared AI cache entries.
    Supports query parameters:
      - search: text matching question or response
      - category: filter by AIResponseCache.Category
      - language: 'bn' or 'en'
      - status: 'VERIFIED', 'UNVERIFIED', 'FLAGGED', 'INVALIDATED', 'EXPIRED', 'ACTIVE'
      - sort: '-hit_count', '-last_accessed_at', '-created_at', 'expires_at'
      - page: page number (default 1)
      - page_size: items per page (default 20, max 100)
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        qs = AIResponseCache.objects.all()
        now = dj_timezone.now()

        # Search filter
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(original_question__icontains=search)
                | Q(normalized_question__icontains=search)
                | Q(response_text__icontains=search)
                | Q(crop_name__icontains=search)
            )

        # Category filter
        category = request.query_params.get("category", "").strip()
        if category and category != "all":
            qs = qs.filter(category=category)

        # Language filter
        lang = request.query_params.get("language", "").strip()
        if lang and lang != "all":
            qs = qs.filter(language=lang)

        # Status filter
        status_filter = request.query_params.get("status", "").strip().upper()
        if status_filter == "ACTIVE":
            qs = qs.filter(is_active=True, expires_at__gt=now)
        elif status_filter == "EXPIRED":
            qs = qs.filter(expires_at__lte=now)
        elif status_filter in ["VERIFIED", "UNVERIFIED", "FLAGGED", "INVALIDATED"]:
            qs = qs.filter(verification_status=status_filter)

        # Sorting
        sort = request.query_params.get("sort", "-last_accessed_at")
        allowed_sorts = [
            "-hit_count", "hit_count",
            "-last_accessed_at", "last_accessed_at",
            "-created_at", "created_at",
            "-expires_at", "expires_at",
        ]
        if sort in allowed_sorts:
            qs = qs.order_by(sort)
        else:
            qs = qs.order_by("-last_accessed_at")

        # Pagination
        try:
            page_size = min(int(request.query_params.get("page_size", 20)), 100)
            page_num = int(request.query_params.get("page", 1))
        except (ValueError, TypeError):
            page_size = 20
            page_num = 1

        paginator = Paginator(qs, page_size)
        try:
            page = paginator.page(page_num)
        except Exception:
            page = paginator.page(1)
            page_num = 1

        results = [serialize_cache_entry(item, include_text=True) for item in page.object_list]

        return Response({
            "results": results,
            "total_count": paginator.count,
            "total_pages": paginator.num_pages,
            "current_page": page_num,
            "page_size": page_size,
        }, status=status.HTTP_200_OK)


class AdminCacheDetailView(APIView):
    """
    Retrieve or delete a single cache entry.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, pk):
        try:
            entry = AIResponseCache.objects.get(pk=pk)
        except AIResponseCache.DoesNotExist:
            return Response({"error": "Cache entry not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(serialize_cache_entry(entry, include_text=True), status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            entry = AIResponseCache.objects.get(pk=pk)
        except AIResponseCache.DoesNotExist:
            return Response({"error": "Cache entry not found."}, status=status.HTTP_404_NOT_FOUND)

        entry.delete()
        return Response({"message": "Cache entry deleted successfully."}, status=status.HTTP_200_OK)


class AdminCacheActionView(APIView):
    """
    Perform management actions on a specific cache entry:
      - verify
      - invalidate (requires reason)
      - flag (requires notes)
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        action = request.data.get("action", "").lower()

        if action == "verify":
            ok = verify_cache_entry(pk, verified_by_user=request.user)
            if ok:
                return Response({"message": "ক্যাশ এন্ট্রি সফলভাবে যাচাইকৃত হয়েছে (Verified)."}, status=status.HTTP_200_OK)
            return Response({"error": "Cache entry not found."}, status=status.HTTP_404_NOT_FOUND)

        elif action == "invalidate":
            reason = request.data.get("reason", "Admin manual invalidation")
            ok = invalidate_cache_entry(pk, reason=reason, invalidated_by_user=request.user)
            if ok:
                return Response({"message": "ক্যাশ এন্ট্রি সফলভাবে বাতিল করা হয়েছে (Invalidated)."}, status=status.HTTP_200_OK)
            return Response({"error": "Cache entry not found."}, status=status.HTTP_404_NOT_FOUND)

        elif action == "flag":
            notes = request.data.get("notes", "")
            ok = flag_cache_entry_for_review(pk, officer_notes=notes, officer_user=request.user)
            if ok:
                return Response({"message": "ক্যাশ এন্ট্রি পর্যালোচনার জন্য চিহ্নিত করা হয়েছে (Flagged)."}, status=status.HTTP_200_OK)
            return Response({"error": "Cache entry not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"error": f"Invalid action: {action}"}, status=status.HTTP_400_BAD_REQUEST)


class AdminCacheClearExpiredView(APIView):
    """
    Clears all expired cache entries from the database.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        deleted_count = clear_expired_caches()
        return Response({
            "message": f"সফলভাবে {deleted_count} টি মেয়াদোত্তীর্ণ ক্যাশ মুছে ফেলা হয়েছে।",
            "deleted_count": deleted_count,
        }, status=status.HTTP_200_OK)


class OfficerCacheReviewView(APIView):
    """
    Endpoint for Extension Officers to inspect and review flagged or unverified cached responses.
    Officers can add agronomic review notes, mark answers as verified, or flag them for invalidation.
    """
    permission_classes = [IsAuthenticated, IsVerifiedOfficer]

    def get(self, request):
        """List cache entries that require officer attention (flagged or unverified)."""
        qs = AIResponseCache.objects.filter(
            is_active=True,
            verification_status__in=[
                AIResponseCache.VerificationStatus.FLAGGED,
                AIResponseCache.VerificationStatus.UNVERIFIED,
            ],
        ).order_by("-hit_count", "-last_accessed_at")[:50]

        results = [serialize_cache_entry(e, include_text=True) for e in qs]
        return Response({"results": results, "count": len(results)}, status=status.HTTP_200_OK)

    def post(self, request, pk):
        """Submit officer agronomic review."""
        action = request.data.get("action", "").lower()
        notes = request.data.get("notes", "").strip()

        if action == "verify":
            ok = verify_cache_entry(pk, verified_by_user=request.user)
            if ok and notes:
                AIResponseCache.objects.filter(id=pk).update(officer_notes=notes)
            return Response({"message": "সফলভাবে উত্তর যাচাই করা হয়েছে।", "verified": True}, status=status.HTTP_200_OK)

        elif action in ["flag", "invalidate"]:
            if action == "invalidate" and getattr(request.user, "role", "") == "ADMIN":
                invalidate_cache_entry(pk, reason=notes or "Officer invalidation", invalidated_by_user=request.user)
            else:
                flag_cache_entry_for_review(pk, officer_notes=notes or "Officer agronomic concern", officer_user=request.user)
            return Response({"message": "পর্যালোচনার জন্য চিহ্নিত করা হয়েছে।", "flagged": True}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action. Supported: verify, flag."}, status=status.HTTP_400_BAD_REQUEST)
