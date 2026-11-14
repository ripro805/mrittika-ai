"""
Integration and API tests for Assistant endpoints:
- POST /api/v1/assistant/chat
- POST /api/v1/assistant/chat/stream/
- GET/DELETE /api/v1/assistant/sessions/
- POST /api/v1/assistant/feedback/
- GET /api/v1/assistant/health/
- Officer audit & IDOR isolation
"""

import json
from unittest.mock import patch

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.assistant.models import AssistantMessage, AssistantSession
from apps.feedback.models import Feedback


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def farmer_user():
    return User.objects.create_user(
        phone="01711112222",
        name="করিম কৃষক",
        role=User.Role.FARMER,
        password="TestPassword@123",
    )


@pytest.fixture
def other_farmer_user():
    return User.objects.create_user(
        phone="01833334444",
        name="রহিম কৃষক",
        role=User.Role.FARMER,
        password="TestPassword@123",
    )


@pytest.fixture
def officer_user():
    return User.objects.create_user(
        phone="01955556666",
        name="কৃষি অফিসার তানভীর",
        role=User.Role.OFFICER,
        is_verified=True,
        password="TestPassword@123",
    )


# ---------------------------------------------------------
# Chat Endpoint Tests
# ---------------------------------------------------------
@pytest.mark.django_db
def test_assistant_chat_validation_empty_and_max_length(client):
    # Empty message
    r1 = client.post("/api/v1/assistant/chat", {"message": ""}, format="json")
    assert r1.status_code == status.HTTP_400_BAD_REQUEST

    # Message over 1000 chars
    long_msg = "ধান " * 500
    r2 = client.post("/api/v1/assistant/chat", {"message": long_msg}, format="json")
    assert r2.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_assistant_chat_anonymous_success(client):
    payload = {"message": "আমন ধানের ইউরিয়া প্রয়োগের নিয়ম বলুন"}
    r = client.post("/api/v1/assistant/chat", payload, format="json")
    assert r.status_code == status.HTTP_200_OK
    assert "answer" in r.data
    assert "sources" in r.data
    assert "session_id" in r.data
    assert "fallback" in r.data


@pytest.mark.django_db
def test_assistant_chat_authenticated_persists_session(api_client, farmer_user):
    api_client.force_authenticate(user=farmer_user)
    payload = {"message": "আলুর নাভিধসা রোগ দমন কীভাবে করব?"}
    r = api_client.post("/api/v1/assistant/chat", payload, format="json")
    assert r.status_code == status.HTTP_200_OK
    session_id = r.data["session_id"]

    # Verify session and message are saved in DB
    session = AssistantSession.objects.filter(id=session_id, user=farmer_user).first()
    assert session is not None
    assert session.messages.count() == 2  # user msg + bot msg


# ---------------------------------------------------------
# SSE Streaming Endpoint Tests
# ---------------------------------------------------------
@pytest.mark.django_db
def test_assistant_chat_stream_format(api_client):
    payload = {"message": "মাটির pH কীভাবে বাড়ানো যায়?"}
    r = api_client.post("/api/v1/assistant/chat/stream/", payload, format="json")
    assert r.status_code == status.HTTP_200_OK
    assert "text/event-stream" in r.headers.get("Content-Type", "")

    # Collect streaming chunks
    stream_content = b"".join(r.streaming_content).decode("utf-8")
    assert "event: sources" in stream_content
    assert "event: token" in stream_content
    assert "event: done" in stream_content


# ---------------------------------------------------------
# Global Daily Cap Test
# ---------------------------------------------------------
@pytest.mark.django_db
def test_assistant_global_rpd_cap(api_client):
    with patch("apps.assistant.views.check_global_rpd_limit", return_value=False):
        r = api_client.post("/api/v1/assistant/chat", {"message": "টেস্ট প্রশ্ন"}, format="json")
        assert r.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        assert "দৈনিক সেবার সীমা" in r.data["error"]


# ---------------------------------------------------------
# Session Management & IDOR Protection Tests
# ---------------------------------------------------------
@pytest.mark.django_db
def test_session_isolation_and_idor_protection(api_client, farmer_user, other_farmer_user):
    # Farmer User creates a session
    api_client.force_authenticate(user=farmer_user)
    session_user1 = AssistantSession.objects.create(user=farmer_user, title="ধান সংক্রান্ত আলোচনা")
    AssistantMessage.objects.create(session=session_user1, role="user", content="ধানের প্রশ্ন")

    # Farmer User lists own sessions
    r_list = api_client.get("/api/v1/assistant/sessions/")
    assert r_list.status_code == status.HTTP_200_OK
    assert len(r_list.data) >= 1
    assert str(session_user1.id) in [s["id"] for s in r_list.data]

    # Other Farmer attempts IDOR read of User 1's session
    api_client.force_authenticate(user=other_farmer_user)
    r_idor_get = api_client.get(f"/api/v1/assistant/sessions/{session_user1.id}/")
    assert r_idor_get.status_code == status.HTTP_404_NOT_FOUND

    # Other Farmer attempts IDOR delete of User 1's session
    r_idor_del = api_client.delete(f"/api/v1/assistant/sessions/{session_user1.id}/")
    assert r_idor_del.status_code == status.HTTP_404_NOT_FOUND

    # Confirm session still exists
    assert AssistantSession.objects.filter(id=session_user1.id).exists()

    # Original Farmer deletes own session
    api_client.force_authenticate(user=farmer_user)
    r_del = api_client.delete(f"/api/v1/assistant/sessions/{session_user1.id}/")
    assert r_del.status_code == status.HTTP_204_NO_CONTENT
    assert not AssistantSession.objects.filter(id=session_user1.id).exists()


# ---------------------------------------------------------
# Feedback & Officer Audit Tests
# ---------------------------------------------------------
@pytest.mark.django_db
def test_feedback_and_officer_correction_flow(api_client, farmer_user, officer_user):
    # 1. Farmer flags wrong answer
    api_client.force_authenticate(user=farmer_user)
    fb_payload = {
        "rating": 1,
        "flagged": True,
        "comment": "সারের মাত্রা অতিরিক্ত মনে হচ্ছে।",
        "context_data": {"test_crop": "rice_aman"},
    }
    r_fb = api_client.post("/api/v1/assistant/feedback/", fb_payload, format="json")
    assert r_fb.status_code == status.HTTP_201_CREATED
    feedback_id = r_fb.data["id"]

    # 2. Officer views flagged feedbacks
    api_client.force_authenticate(user=officer_user)
    r_flagged = api_client.get("/api/v1/assistant/officer/flagged/")
    assert r_flagged.status_code == status.HTTP_200_OK
    flagged_ids = [item["id"] for item in r_flagged.data]
    assert feedback_id in flagged_ids

    # 3. Officer submits agronomist correction
    corr_payload = {
        "feedback_id": feedback_id,
        "correction": "বিঘাপ্রতি সর্বোচ্চ ২০ কেজি ইউরিয়া দিতে হবে।",
    }
    r_corr = api_client.post("/api/v1/assistant/officer/correct/", corr_payload, format="json")
    assert r_corr.status_code == status.HTTP_200_OK

    # 4. Verify feedback is now resolved
    fb = Feedback.objects.get(id=feedback_id)
    assert fb.is_resolved is True
    assert fb.corrected_by == officer_user
    assert "২০ কেজি" in fb.officer_correction


# ---------------------------------------------------------
# Health Endpoint Tests
# ---------------------------------------------------------
@pytest.mark.django_db
def test_assistant_health_endpoint(client):
    r = client.get("/api/v1/assistant/health/")
    assert r.status_code == status.HTTP_200_OK
    assert r.data["status"] == "healthy"
    assert "groq_configured" in r.data
    assert "gemini_configured" in r.data
    assert "vector_store_chunks" in r.data
    # Assert secrets are not leaked
    raw_str = json.dumps(r.data)
    assert "gsk_" not in raw_str
    assert "AIza" not in raw_str
