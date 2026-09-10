from decimal import Decimal

import pytest
from accounts.models import Role, User
from admissions.models import (
    Applicant,
    Application,
    ApplicationActivity,
    ApplicationNote,
    ApplicationStatus,
    RegistrationCourse,
)
from django.utils import timezone
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def staff(db):
    return User.objects.create_user(
        email="officer@example.com", password="x", role=Role.ADMISSIONS
    )


@pytest.fixture
def staff_client(client, staff):
    client.force_authenticate(staff)
    return client


def make_application(email="ada@example.com", first="Ada", last="Obi", **kwargs):
    applicant = Applicant.objects.create(
        first_name=first,
        last_name=last,
        birth_date="1996-06-01",
        gender="female",
        nationality="Nigerian",
        email=email,
        phone="+2348000000000",
        address_line="1 Main St",
        city="Lagos",
        state_region="Lagos",
        country="Nigeria",
    )
    application = Application.objects.create(
        applicant=applicant,
        application_number=kwargs.get("number", "E3-APP-2026-000001"),
        status=kwargs.get("status", ApplicationStatus.PENDING),
        education_level="secondary",
        institution="Central High",
        preferred_start_date="2026-10-01",
        preferred_session="morning",
        reason_for_joining="Career switch",
        referral_source="friend_family",
        submitted_at=timezone.now(),
    )
    RegistrationCourse.objects.create(
        application=application,
        course_ref=1,
        course_name="Python 3 Beginner",
        fee_at_registration=Decimal("50000.00"),
    )
    return application


# --- Permissions ---------------------------------------------------------


def test_list_requires_authentication(client):
    resp = client.get("/api/v1/applications/")
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "NOT_AUTHENTICATED"


def test_list_forbidden_for_non_admissions(client):
    student = User.objects.create_user(
        email="s@example.com", password="x", role=Role.STUDENT
    )
    client.force_authenticate(student)
    resp = client.get("/api/v1/applications/")
    assert resp.status_code == 403


# --- List / filter / search ---------------------------------------------


def test_list_returns_envelope(staff_client):
    make_application()
    resp = staff_client.get("/api/v1/applications/")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body and "pagination" in body
    assert body["pagination"]["total_items"] == 1
    row = body["data"][0]
    assert row["applicant_name"] == "Ada Obi"
    assert row["email"] == "ada@example.com"


def test_list_filters_by_status(staff_client):
    make_application(email="a@example.com", number="E3-APP-2026-000001")
    make_application(
        email="b@example.com",
        number="E3-APP-2026-000002",
        status=ApplicationStatus.APPROVED,
    )
    resp = staff_client.get("/api/v1/applications/?status=approved")
    body = resp.json()
    assert body["pagination"]["total_items"] == 1
    assert body["data"][0]["status"] == "approved"


def test_list_searches_by_name(staff_client):
    make_application(email="a@example.com", first="Ada", number="E3-APP-2026-000001")
    make_application(
        email="b@example.com", first="Bola", last="Ade", number="E3-APP-2026-000002"
    )
    resp = staff_client.get("/api/v1/applications/?search=Bola")
    body = resp.json()
    assert body["pagination"]["total_items"] == 1
    assert body["data"][0]["applicant_name"] == "Bola Ade"


# --- Detail --------------------------------------------------------------


def test_detail_flattens_identity(staff_client):
    app = make_application()
    resp = staff_client.get(f"/api/v1/applications/{app.id}/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["first_name"] == "Ada"
    assert body["email"] == "ada@example.com"
    assert body["student_id"] is None
    assert len(body["courses"]) == 1


# --- Metrics -------------------------------------------------------------


def test_metrics_counts_by_status(staff_client):
    make_application(email="a@example.com", number="E3-APP-2026-000001")
    make_application(
        email="b@example.com",
        number="E3-APP-2026-000002",
        status=ApplicationStatus.APPROVED,
    )
    resp = staff_client.get("/api/v1/applications/metrics/")
    body = resp.json()
    assert body["total_applications"] == 2
    assert body["by_status"]["pending"] == 1
    assert body["by_status"]["approved"] == 1


# --- Transitions ---------------------------------------------------------


def test_transition_approves_and_logs_activity(staff_client):
    app = make_application(status=ApplicationStatus.UNDER_REVIEW)
    resp = staff_client.post(f"/api/v1/applications/{app.id}/approve/", {})
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"
    app.refresh_from_db()
    assert app.status == ApplicationStatus.APPROVED
    assert ApplicationActivity.objects.filter(
        application=app, action="approve"
    ).exists()


def test_transition_rejects_invalid_matrix_move(staff_client):
    app = make_application(status=ApplicationStatus.APPROVED)
    resp = staff_client.post(f"/api/v1/applications/{app.id}/approve/", {})
    assert resp.status_code == 400
    app.refresh_from_db()
    assert app.status == ApplicationStatus.APPROVED


def test_reject_requires_reason(staff_client):
    app = make_application(status=ApplicationStatus.PENDING)
    resp = staff_client.post(f"/api/v1/applications/{app.id}/reject/", {})
    assert resp.status_code == 400
    assert "reason" in resp.json()["error"]["details"]


def test_reject_with_reason_succeeds(staff_client):
    app = make_application(status=ApplicationStatus.PENDING)
    resp = staff_client.post(
        f"/api/v1/applications/{app.id}/reject/", {"reason": "Incomplete"}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "rejected"


# --- Notes ---------------------------------------------------------------


def test_add_note(staff_client, staff):
    app = make_application()
    resp = staff_client.post(
        f"/api/v1/applications/{app.id}/notes/", {"body": "Called applicant."}
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["body"] == "Called applicant."
    assert body["author_name"] == staff.name
    assert ApplicationNote.objects.filter(application=app).count() == 1


def test_empty_note_rejected(staff_client):
    app = make_application()
    resp = staff_client.post(f"/api/v1/applications/{app.id}/notes/", {"body": "  "})
    assert resp.status_code == 400
