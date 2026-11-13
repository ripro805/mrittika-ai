"""
Assistant API views for Chat and Admin Knowledge Document management.
"""

from pathlib import Path

from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminRole

from .llm_providers import get_llm_provider
from .rag_engine import get_collection, ingest_document, query_knowledge_base


class ChatThrottle(ScopedRateThrottle):
    scope = "anon_chat"


class ChatInputSerializer(serializers.Serializer):
    message = serializers.CharField(
        max_length=2000,
        error_messages={"required": "বার্তাটি খালি রাখা যাবে না (Message cannot be empty)."},
    )
    context = serializers.DictField(required=False, default=dict)


class ChatView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ChatThrottle]

    @extend_schema(
        summary="Bangla Agricultural Assistant Chatbot",
        description="RAG-grounded chatbot answering from verified agricultural guides with citations and Upazila Officer safety fallback.",
        request=ChatInputSerializer,
    )
    def post(self, request):
        serializer = ChatInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        client_context = serializer.validated_data.get("context", {})

        # Enrich query with crop context if passed from unified flow
        query_enrichment = message
        if client_context.get("crop"):
            query_enrichment = f"{client_context['crop']} - {message}"

        # 1. Retrieve knowledge chunks
        chunks, is_low_confidence = query_knowledge_base(query_enrichment, top_k=3)

        # 2. Generate response via LLM provider
        provider = get_llm_provider()
        res = provider.generate(
            user_message=message,
            context_chunks=chunks,
            context_metadata=client_context,
        )

        res["client_context"] = client_context
        return Response(res, status=status.HTTP_200_OK)


class AdminKnowledgeListView(APIView):
    permission_classes = [IsAdminRole]

    @extend_schema(summary="List Knowledge Documents (Admin Only)")
    def get(self, request):
        collection = get_collection()
        total_chunks = collection.count()
        sample_docs_dir = settings.BASE_DIR / "apps" / "assistant" / "sample_docs"

        files = []
        if sample_docs_dir.exists():
            for f in sample_docs_dir.glob("*.*"):
                files.append({
                    "filename": f.name,
                    "size_bytes": f.stat().st_size,
                    "is_sample": True,
                })

        return Response({
            "total_indexed_chunks": total_chunks,
            "sample_documents": files,
        })


class AdminKnowledgeUploadView(APIView):
    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(summary="Upload and Index Knowledge Document (Admin Only)")
    def post(self, request):
        upload_file = request.FILES.get("file")
        if not upload_file:
            return Response({"error": "নথি ফাইল নির্বাচন করুন (File is required)."}, status=status.HTTP_400_BAD_REQUEST)

        # Security: Size cap (10MB) and extension allow-list
        if upload_file.size > 10 * 1024 * 1024:
            return Response({"error": "ফাইলের আকার ১০ মেগাবাইটের বেশি হতে পারবে না (Max 10MB)."}, status=status.HTTP_400_BAD_REQUEST)

        ext = Path(upload_file.name).suffix.lower()
        if ext not in [".md", ".txt", ".pdf"]:
            return Response({"error": "অননুমোদিত ফাইল ফরম্যাট। শুধুমাত্র .md, .txt, .pdf গ্রহণযোগ্য।"}, status=status.HTTP_400_BAD_REQUEST)

        dest_dir = settings.BASE_DIR / "apps" / "assistant" / "uploaded_docs"
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / upload_file.name

        with open(dest_path, "wb+") as f:
            for chunk in upload_file.chunks():
                f.write(chunk)

        try:
            chunks_count = ingest_document(dest_path)
            return Response(
                {"message": f"নথি সফলভাবে আপলোড ও সূচীকরণ সম্পন্ন হয়েছে ({chunks_count} chunks indexed)."},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response({"error": f"ইনডেক্সিং ব্যর্থ হয়েছে: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
