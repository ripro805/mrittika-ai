"""
Security, Authentication, RBAC, and IDOR prevention test suite.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.recommendations.models import RecommendationHistory

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def farmer_user():
    return User.objects.create_user(
        phone="01711111111",
        password="ValidPassword123#",
        name="Farmer Rahim",
        district="Bogra",
        upazila="Sherpur",
        role=User.Role.FARMER,
    )


@pytest.fixture
def other_farmer():
    return User.objects.create_user(
        phone="01722222222",
        password="ValidPassword123#",
        name="Farmer Karim",
        district="Dhaka",
        role=User.Role.FARMER,
    )


@pytest.fixture
def unverified_officer():
    return User.objects.create_user(
        phone="01733333333",
        password="ValidPassword123#",
        name="Unverified Officer",
        role=User.Role.OFFICER,
        is_verified=False,
    )


@pytest.fixture
def verified_officer():
    return User.objects.create_user(
        phone="01744444444",
        password="ValidPassword123#",
        name="Verified Officer",
        role=User.Role.OFFICER,
        is_verified=True,
    )


@pytest.fixture
def admin_user():
    return User.objects.create_superuser(
        phone="01755555555",
        password="ValidPassword123#",
        name="System Admin",
    )


@pytest.mark.django_db
def test_user_registration_and_phone_validation(client):
    # Valid BD registration
    payload = {
        "phone": "01788888888",
        "password": "StrongPassword999!",
        "name": "নতুন কৃষক",
        "district": "Rangpur",
        "upazila": "Mithapukur",
    }
    r = client.post("/api/v1/auth/register", payload, format="json")
    assert r.status_code == status.HTTP_201_CREATED
    assert "access" in r.data
    # Refresh token set in cookie
    assert "mrittika_refresh_token" in r.cookies

    # Invalid phone format
    bad_payload = payload.copy()
    bad_payload["phone"] = "12345"
    r_bad = client.post("/api/v1/auth/register", bad_payload, format="json")
    assert r_bad.status_code == status.HTTP_400_BAD_REQUEST

    # Short password
    short_pw = payload.copy()
    short_pw["phone"] = "01799999999"
    short_pw["password"] = "short"
    r_short = client.post("/api/v1/auth/register", short_pw, format="json")
    assert r_short.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_user_login_refresh_logout(client, farmer_user):
    # Login
    r_login = client.post(
        "/api/v1/auth/login",
        {"phone": "01711111111", "password": "ValidPassword123#"},
        format="json",
    )
    assert r_login.status_code == status.HTTP_200_OK
    assert "access" in r_login.data
    assert "mrittika_refresh_token" in r_login.cookies
    refresh_cookie = r_login.cookies["mrittika_refresh_token"].value

    # Refresh
    client.cookies["mrittika_refresh_token"] = refresh_cookie
    r_ref = client.post("/api/v1/auth/refresh")
    assert r_ref.status_code == status.HTTP_200_OK
    assert "access" in r_ref.data

    # Logout
    r_out = client.post("/api/v1/auth/logout")
    assert r_out.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_rbac_history_and_officer_endpoints(
    client, farmer_user, unverified_officer, verified_officer, admin_user
):
    # 1. Guest cannot access history
    r_guest = client.get("/api/v1/history")
    assert r_guest.status_code == status.HTTP_401_UNAUTHORIZED

    # 2. Farmer can access their own history, but CANNOT access officer flagged list
    client.force_authenticate(user=farmer_user)
    r_farmer_hist = client.get("/api/v1/history")
    assert r_farmer_hist.status_code == status.HTTP_200_OK

    r_farmer_officer = client.get("/api/v1/officer/feedback/flagged")
    assert r_farmer_officer.status_code == status.HTTP_403_FORBIDDEN

    # 3. Unverified officer CANNOT access officer flagged list
    client.force_authenticate(user=unverified_officer)
    r_unver = client.get("/api/v1/officer/feedback/flagged")
    assert r_unver.status_code == status.HTTP_403_FORBIDDEN

    # 4. Verified officer CAN access officer flagged list
    client.force_authenticate(user=verified_officer)
    r_ver = client.get("/api/v1/officer/feedback/flagged")
    assert r_ver.status_code == status.HTTP_200_OK

    # 5. Non-admin CANNOT upload knowledge documents
    r_upload_fail = client.post("/api/v1/admin/knowledge/upload")
    assert r_upload_fail.status_code == status.HTTP_403_FORBIDDEN

    # 6. Admin CAN access admin knowledge endpoints
    client.force_authenticate(user=admin_user)
    r_admin_know = client.get("/api/v1/admin/knowledge")
    assert r_admin_know.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_idor_protection_history_and_report(client, farmer_user, other_farmer):
    # Create a history record for farmer_user
    rec = RecommendationHistory.objects.create(
        user=farmer_user,
        rec_type=RecommendationHistory.Type.FERTILIZER,
        crop_slug="rice_aman",
        crop_name_bn="আমন ধান",
        inputs={"land_area": 1.0, "land_unit": "bigha"},
        outputs={"fertilizer_items": []},
    )

    # other_farmer tries to view report PDF of farmer_user's record -> 403 Forbidden
    client.force_authenticate(user=other_farmer)
    r_idor_pdf = client.get(f"/api/v1/report/{rec.id}.pdf")
    assert r_idor_pdf.status_code == status.HTTP_403_FORBIDDEN

    # other_farmer tries to delete farmer_user's record -> 403 Forbidden
    r_idor_del = client.delete(f"/api/v1/history/{rec.id}")
    assert r_idor_del.status_code == status.HTTP_403_FORBIDDEN

    # Owner can download PDF -> 200 OK
    client.force_authenticate(user=farmer_user)
    r_owner_pdf = client.get(f"/api/v1/report/{rec.id}.pdf")
    assert r_owner_pdf.status_code == status.HTTP_200_OK
    assert r_owner_pdf["Content-Type"] == "application/pdf"
