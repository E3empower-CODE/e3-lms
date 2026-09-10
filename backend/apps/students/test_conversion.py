from decimal import Decimal

import pytest
from accounts.models import Role, User
from admissions.models import (
    Applicant,
    Application,
    ApplicationStatus,
    RegistrationCourse,
)
from django.utils import timezone
from rest_framework.test import APIClient
from students.models import Student

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def staff_client(client):
    user = User.objects.create_user(
        email="officer@example.com", password="x", role=Role.ADMISSIONS
    )
    client.force_authenticate(user)
    return client


def make_application(
    email="ada@example.com",
    first="Ada",
    last="Obi",
    status=ApplicationStatus.APPROVED,
    number="E3-APP-2026-000001",
):
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
    app = Application.objects.create(
        applicant=applicant,
        application_number=number,
        status=status,
        education_level="secondary",
        institution="Central High",
        preferred_start_date="2026-10-01",
        preferred_session="morning",
        submitted_at=timezone.now(),
    )
    RegistrationCourse.objects.create(
        application=app,
        course_ref=1,
        course_name="Python 3 Beginner",
        fee_at_registration=Decimal("50000.00"),
    )
    return app


def test_convert_creates_student(staff_client):
    app = make_application()
    resp = staff_client.post(f"/api/v1/applications/{app.id}/convert/", {})
    assert resp.status_code == 201
    body = resp.json()
    assert body["student_number"].startswith("E3-STU-")
    assert body["full_name"] == "Ada Obi"
    assert body["application_id"] == app.id
    assert Student.objects.filter(application=app).count() == 1


def test_convert_requires_approved(staff_client):
    app = make_application(status=ApplicationStatus.PENDING)
    resp = staff_client.post(f"/api/v1/applications/{app.id}/convert/", {})
    assert resp.status_code == 400
    assert not Student.objects.filter(application=app).exists()


def test_convert_is_idempotent(staff_client):
    app = make_application()
    first = staff_client.post(f"/api/v1/applications/{app.id}/convert/", {})
    assert first.status_code == 201
    number = first.json()["student_number"]

    again = staff_client.post(f"/api/v1/applications/{app.id}/convert/", {})
    assert again.status_code == 409
    body = again.json()
    assert body["error"]["code"] == "ALREADY_CONVERTED"
    assert body["error"]["details"]["student"]["student_number"] == number
    assert Student.objects.filter(application=app).count() == 1


def test_convert_warns_on_duplicate_then_forces(staff_client):
    first_app = make_application(email="dup@example.com", number="E3-APP-2026-000001")
    staff_client.post(f"/api/v1/applications/{first_app.id}/convert/", {})

    # A second approved application for the same person (same email).
    second_app = make_application(email="dup@example.com", number="E3-APP-2026-000002")
    warn = staff_client.post(f"/api/v1/applications/{second_app.id}/convert/", {})
    assert warn.status_code == 409
    body = warn.json()
    assert body["error"]["code"] == "DUPLICATE_STUDENTS"
    assert len(body["error"]["details"]["duplicates"]) == 1

    forced = staff_client.post(
        f"/api/v1/applications/{second_app.id}/convert/", {"force": True}, format="json"
    )
    assert forced.status_code == 201
    assert Student.objects.count() == 2


def test_students_list_and_detail(staff_client):
    app = make_application()
    staff_client.post(f"/api/v1/applications/{app.id}/convert/", {})

    listing = staff_client.get("/api/v1/students/")
    assert listing.status_code == 200
    body = listing.json()
    assert body["pagination"]["total_items"] == 1
    student_id = body["data"][0]["id"]

    detail = staff_client.get(f"/api/v1/students/{student_id}/")
    assert detail.status_code == 200
    assert detail.json()["full_name"] == "Ada Obi"


def test_students_list_requires_auth(client):
    resp = client.get("/api/v1/students/")
    assert resp.status_code == 401
