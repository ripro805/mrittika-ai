"""
Production-quality API views for the Bangla Agricultural Assistant.
Includes JSON & SSE streaming chat, session persistence, feedback, officer audit,
admin document ingestion, and health diagnostics.
"""

import datetime
import json
import logging
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List

from django.conf import settings
from django.core.cache import cache
from django.http import StreamingHttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminRole, IsVerifiedOfficer
from apps.feedback.models import Feedback

from .llm.base import redact_secrets
from .llm.router import OFFICER_FALLBACK_BN, get_llm_router
from .models import AssistantMessage, AssistantSession
from .rag_engine import (
    build_assistant_messages,
    get_collection,
    ingest_document,
    query_knowledge_base,
)

logger = logging.getLogger(__name__)


class AnonChatThrottle(AnonRateThrottle):
    scope = "anon_chat"


class UserChatThrottle(UserRateThrottle):
    scope = "user_chat"


def check_global_rpd_limit() -> bool:
    """
    Validates total daily requests against CHAT_GLOBAL_RPD to prevent quota exhaustion.
    Returns True if allowed, False if exceeded.
    """
    global_limit = getattr(settings, "CHAT_GLOBAL_RPD", int(os.getenv("CHAT_GLOBAL_RPD", "5000")))
    today_key = f"mrittika_global_chat_rpd_{datetime.date.today().isoformat()}"
    try:
        current_count = cache.get(today_key)
        if current_count is None:
            cache.set(today_key, 1, 86400)
            return True
        if int(current_count) >= global_limit:
            return False
        cache.incr(today_key)
        return True
    except Exception as e:
        logger.warning("Error checking global RPD cache counter: %s", e)
        return True


def format_sources_for_client(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Formats retrieved context chunks with snippet and verified status."""
    clean_sources = []
    for c in chunks:
        content = c.get("content", "")
        clean_sources.append({
            "source": c.get("source", "নথি"),
            "filename": c.get("filename", ""),
            "page": str(c.get("page", "১")),
            "snippet": content[:220].replace("\n", " ").strip() + "...",
            "is_sample": c.get("is_sample", True),
        })
    return clean_sources


class ChatInputSerializer(serializers.Serializer):
    message = serializers.CharField(
        max_length=1000,
        error_messages={"required": "বার্তাটি খালি রাখা যাবে না (Message cannot be empty)."},
    )
    session_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    context = serializers.DictField(required=False, default=dict)


class ChatView(APIView):
    """
    Standard JSON endpoint for the Bangla Agricultural Assistant.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonChatThrottle, UserChatThrottle]

    @extend_schema(
        summary="Bangla Agricultural Assistant Chatbot (JSON)",
        description="Grounded agricultural advice in Bangla with sources, citations, and Upazila Officer safety fallback.",
        request=ChatInputSerializer,
    )
    def post(self, request):
        if not check_global_rpd_limit():
            return Response(
                {
                    "error": "দৈনিক সেবার সীমা পূর্ণ হয়েছে। অনুগ্রহ করে আগামীকাল আবার চেষ্টা করুন। (Daily chat quota reached)",
                    "fallback": True,
                    "answer": OFFICER_FALLBACK_BN,
                    "sources": [],
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = ChatInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        client_context = serializer.validated_data.get("context", {})
        session_id_str = serializer.validated_data.get("session_id")

        # 1. Session resolution for logged-in users vs guest
        session = None
        session_id = session_id_str or str(uuid.uuid4())
        conversation_history = []

        if request.user and request.user.is_authenticated:
            if session_id_str:
                try:
                    session = AssistantSession.objects.filter(id=session_id_str, user=request.user).first()
                except Exception:
                    session = None
            if not session:
                title = message[:40] + ("..." if len(message) > 40 else "")
                session = AssistantSession.objects.create(user=request.user, title=title)
            session_id = str(session.id)
            # Load last 4 turns
            past_msgs = session.messages.order_by("-created_at")[:4]
            for m in reversed(list(past_msgs)):
                conversation_history.append({"role": m.role, "content": m.content})

        # 2. Enrich query for retrieval if crop context is active
        query_enrichment = message
        if client_context.get("crop"):
            query_enrichment = f"{client_context['crop']} - {message}"

        # 3. Retrieve chunks with relevance threshold check
        chunks, is_low_confidence = query_knowledge_base(query_enrichment, top_k=4)
        clean_sources = format_sources_for_client(chunks)

        # 4. If low confidence: immediate fallback without calling LLM
        if is_low_confidence:
            answer = OFFICER_FALLBACK_BN
            provider_used = "retrieval_threshold"
            fallback = True
        else:
            messages = build_assistant_messages(
                user_message=message,
                context_chunks=chunks,
                client_context=client_context,
                conversation_history=conversation_history,
                max_prompt_tokens=getattr(settings, "MAX_PROMPT_TOKENS", 3000),
            )
            router = get_llm_router()
            result = router.generate(messages, stream=False, context_chunks=chunks)
            answer = result["answer"]
            provider_used = result.get("provider_used", "unknown")
            fallback = result.get("fallback", False)

        # 5. Persist messages for authenticated users
        if session:
            try:
                AssistantMessage.objects.create(session=session, role="user", content=message)
                AssistantMessage.objects.create(
                    session=session,
                    role="assistant",
                    content=answer,
                    sources=clean_sources,
                    fallback=fallback,
                    provider_used=provider_used,
                )
                session.save(update_fields=["updated_at"])
            except Exception as e:
                logger.warning("Failed to persist assistant messages: %s", e)

        resp_data = {
            "answer": answer,
            "sources": clean_sources,
            "fallback": fallback,
            "session_id": session_id,
            "client_context": client_context,
        }
        # Only expose provider_used to admins or in DEBUG mode
        if settings.DEBUG or (request.user and getattr(request.user, "role", None) == "ADMIN"):
            resp_data["provider_used"] = provider_used

        return Response(resp_data, status=status.HTTP_200_OK)


class ChatStreamView(APIView):
    """
    Server-Sent Events (SSE) streaming chat endpoint.
    Emits events: sources, token, done, error.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonChatThrottle, UserChatThrottle]

    def post(self, request):
        if not check_global_rpd_limit():
            return Response(
                {"error": "দৈনিক সেবার সীমা পূর্ণ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।"},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = ChatInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        client_context = serializer.validated_data.get("context", {})
        session_id_str = serializer.validated_data.get("session_id")

        session = None
        session_id = session_id_str or str(uuid.uuid4())
        conversation_history = []

        if request.user and request.user.is_authenticated:
            if session_id_str:
                try:
                    session = AssistantSession.objects.filter(id=session_id_str, user=request.user).first()
                except Exception:
                    session = None
            if not session:
                title = message[:40] + ("..." if len(message) > 40 else "")
                session = AssistantSession.objects.create(user=request.user, title=title)
            session_id = str(session.id)
            past_msgs = session.messages.order_by("-created_at")[:4]
            for m in reversed(list(past_msgs)):
                conversation_history.append({"role": m.role, "content": m.content})

        query_enrichment = message
        if client_context.get("crop"):
            query_enrichment = f"{client_context['crop']} - {message}"

        chunks, is_low_confidence = query_knowledge_base(query_enrichment, top_k=4)
        clean_sources = format_sources_for_client(chunks)

        def event_stream():
            try:
                # 1. Send sources event
                yield f"event: sources\ndata: {json.dumps(clean_sources)}\n\n"

                accumulated_tokens = []
                provider_used = "mock"
                fallback = False

                if is_low_confidence:
                    fallback = True
                    provider_used = "retrieval_threshold"
                    for word in OFFICER_FALLBACK_BN.split():
                        tok = word + " "
                        accumulated_tokens.append(tok)
                        yield f"event: token\ndata: {json.dumps({'token': tok})}\n\n"
                else:
                    messages = build_assistant_messages(
                        user_message=message,
                        context_chunks=chunks,
                        client_context=client_context,
                        conversation_history=conversation_history,
                        max_prompt_tokens=getattr(settings, "MAX_PROMPT_TOKENS", 3000),
                    )
                    router = get_llm_router()
                    gen_result = router.generate(messages, stream=True, context_chunks=chunks)
                    provider_used = gen_result.get("provider_used", "unknown")
                    fallback = gen_result.get("fallback", False)
                    generator = gen_result.get("stream_generator")

                    if generator:
                        for token in generator:
                            accumulated_tokens.append(token)
                            yield f"event: token\ndata: {json.dumps({'token': token})}\n\n"

                final_answer = "".join(accumulated_tokens).strip()

                # Persist message turn if session exists
                if session and final_answer:
                    try:
                        AssistantMessage.objects.create(session=session, role="user", content=message)
                        AssistantMessage.objects.create(
                            session=session,
                            role="assistant",
                            content=final_answer,
                            sources=clean_sources,
                            fallback=fallback,
                            provider_used=provider_used,
                        )
                        session.save(update_fields=["updated_at"])
                    except Exception as pe:
                        logger.warning("Could not persist streamed assistant message: %s", pe)

                done_payload = {
                    "session_id": session_id,
                    "fallback": fallback,
                }
                if settings.DEBUG or (request.user and getattr(request.user, "role", None) == "ADMIN"):
                    done_payload["provider_used"] = provider_used

                yield f"event: done\ndata: {json.dumps(done_payload)}\n\n"

            except Exception as stream_err:
                logger.error("SSE stream error: %s", redact_secrets(str(stream_err)))
                yield f"event: error\ndata: {json.dumps({'error': 'সার্ভারে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'})}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


class SessionListView(APIView):
    """
    Lists conversation sessions for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = AssistantSession.objects.filter(user=request.user).order_by("-updated_at")
        data = [
            {
                "id": str(s.id),
                "title": s.title,
                "created_at": s.created_at.isoformat(),
                "updated_at": s.updated_at.isoformat(),
                "message_count": s.messages.count(),
            }
            for s in sessions
        ]
        return Response(data, status=status.HTTP_200_OK)


class SessionDetailView(APIView):
    """
    Retrieves message history or deletes an individual session.
    Strictly isolated to ensure users cannot access or delete other users' sessions (IDOR protection).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = AssistantSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            return Response({"error": "আলোচনা পাওয়া যায়নি (Session not found)."}, status=status.HTTP_404_NOT_FOUND)

        messages = session.messages.order_by("created_at")
        msg_data = [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "sources": m.sources,
                "fallback": m.fallback,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
        return Response({
            "id": str(session.id),
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "messages": msg_data,
        }, status=status.HTTP_200_OK)

    def delete(self, request, session_id):
        session = AssistantSession.objects.filter(id=session_id, user=request.user).first()
        if not session:
            return Response({"error": "আলোচনা পাওয়া যায়নি (Session not found)."}, status=status.HTTP_404_NOT_FOUND)

        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssistantFeedbackView(APIView):
    """
    Receives feedback, helpfulness ratings, and flagged problematic assistant responses.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        rating = int(request.data.get("rating", 5))
        flagged = bool(request.data.get("flagged", False))
        comment = str(request.data.get("comment", "")).strip()
        context_data = request.data.get("context_data", {})

        fb = Feedback.objects.create(
            user=request.user if request.user and request.user.is_authenticated else None,
            module_type=Feedback.ModuleType.CHAT,
            rating=min(max(rating, 1), 5),
            flagged=flagged,
            comment=comment,
            context_data=context_data,
        )
        return Response({"message": "মতামত সফলভাবে সংরক্ষিত হয়েছে।", "id": fb.id}, status=status.HTTP_201_CREATED)


class OfficerFlaggedListView(APIView):
    """
    Extension Officer queue of flagged assistant responses.
    """
    permission_classes = [IsVerifiedOfficer]

    def get(self, request):
        flagged = Feedback.objects.filter(
            module_type=Feedback.ModuleType.CHAT,
            flagged=True,
            is_resolved=False,
        ).order_by("-created_at")

        data = [
            {
                "id": f.id,
                "user_phone": f.user.phone if f.user else "অতিথি (Guest)",
                "comment": f.comment,
                "context_data": f.context_data,
                "created_at": f.created_at.isoformat(),
            }
            for f in flagged
        ]
        return Response(data, status=status.HTTP_200_OK)


class OfficerCorrectionView(APIView):
    """
    Submits an agronomist correction to a flagged assistant answer.
    """
    permission_classes = [IsVerifiedOfficer]

    def post(self, request):
        feedback_id = request.data.get("feedback_id")
        correction = request.data.get("correction", "").strip()

        if not feedback_id or not correction:
            return Response({"error": "ফিডব্যাক আইডি ও সংশোধন বাধ্যতামূলক।"}, status=status.HTTP_400_BAD_REQUEST)

        fb = Feedback.objects.filter(id=feedback_id).first()
        if not fb:
            return Response({"error": "ফিডব্যাক খুঁজে পাওয়া যায়নি।"}, status=status.HTTP_404_NOT_FOUND)

        fb.officer_correction = correction
        fb.corrected_by = request.user
        fb.is_resolved = True
        fb.save()
        return Response({"message": "বিশেষজ্ঞ সংশোধন সফলভাবে যুক্ত হয়েছে।"}, status=status.HTTP_200_OK)


class AdminKnowledgeListView(APIView):
    """
    Lists knowledge base document status and vector chunk counts.
    """
    permission_classes = [IsAdminRole]

    def get(self, request):
        collection = get_collection()
        total_chunks = collection.count()

        sample_docs_dir = settings.BASE_DIR / "apps" / "assistant" / "sample_docs"
        uploaded_docs_dir = settings.BASE_DIR / "apps" / "assistant" / "uploaded_docs"

        files = []
        if sample_docs_dir.exists():
            for f in sample_docs_dir.glob("*.*"):
                files.append({
                    "filename": f.name,
                    "size_bytes": f.stat().st_size,
                    "is_sample": True,
                    "source_type": "sample",
                })
        if uploaded_docs_dir.exists():
            for f in uploaded_docs_dir.glob("*.*"):
                files.append({
                    "filename": f.name,
                    "size_bytes": f.stat().st_size,
                    "is_sample": False,
                    "source_type": "uploaded",
                })

        return Response({
            "total_indexed_chunks": total_chunks,
            "documents": files,
        }, status=status.HTTP_200_OK)


class AdminKnowledgeUploadView(APIView):
    """
    Uploads and indexes a new document into ChromaDB.
    """
    permission_classes = [IsAdminRole]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload_file = request.FILES.get("file")
        if not upload_file:
            return Response({"error": "নথি ফাইল নির্বাচন করুন (File is required)."}, status=status.HTTP_400_BAD_REQUEST)

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


class AdminKnowledgeDeleteView(APIView):
    """
    Deletes a document from disk and removes all corresponding chunks from ChromaDB.
    """
    permission_classes = [IsAdminRole]

    def delete(self, request, filename):
        dest_dir = settings.BASE_DIR / "apps" / "assistant" / "uploaded_docs"
        file_path = dest_dir / filename

        collection = get_collection()
        # Find and delete matching chunks from collection
        try:
            matched_items = collection.get(where={"filename": filename})
            ids_to_delete = matched_items.get("ids", [])
            if ids_to_delete:
                collection.delete(ids=ids_to_delete)
        except Exception as e:
            logger.warning("Could not delete chunks for %s from ChromaDB: %s", filename, e)

        if file_path.exists():
            file_path.unlink()

        return Response({"message": f"'{filename}' নথি এবং এর সংশ্লিষ্ট ভেক্টর মুছে ফেলা হয়েছে।"}, status=status.HTTP_200_OK)


class AdminKnowledgeReindexView(APIView):
    """
    Triggers complete re-indexing of all sample and uploaded documents.
    """
    permission_classes = [IsAdminRole]

    def post(self, request):
        collection = get_collection()
        all_ids = collection.get()["ids"]
        if all_ids:
            collection.delete(ids=all_ids)

        total_chunks = 0
        sample_dir = settings.BASE_DIR / "apps" / "assistant" / "sample_docs"
        upload_dir = settings.BASE_DIR / "apps" / "assistant" / "uploaded_docs"

        for directory in (sample_dir, upload_dir):
            if directory.exists():
                for ext in ("*.md", "*.txt", "*.pdf"):
                    for f in directory.glob(ext):
                        try:
                            total_chunks += ingest_document(f)
                        except Exception as e:
                            logger.error("Failed reindexing %s: %s", f.name, e)

        return Response({
            "message": "সম্পূর্ণ নলেজবেস পুনঃসূচীকরণ সম্পন্ন হয়েছে।",
            "total_indexed_chunks": total_chunks,
        }, status=status.HTTP_200_OK)


class AssistantHealthView(APIView):
    """
    Health check diagnostic reporting configured providers, embedding status, and vector counts.
    Never exposes raw API keys or secrets.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        groq_key = os.getenv("GROQ_API_KEY", "").strip()
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

        col = get_collection()
        doc_count = col.count()

        return Response({
            "status": "healthy",
            "groq_configured": bool(groq_key),
            "gemini_configured": bool(gemini_key),
            "embedding_model": getattr(settings, "EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"),
            "vector_store_chunks": doc_count,
            "provider_order": getattr(settings, "LLM_PROVIDER_ORDER", "groq,gemini"),
        }, status=status.HTTP_200_OK)
