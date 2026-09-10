from decimal import Decimal

import pytest
from admissions.models import (
    Application,
    ApplicationStatus,
    Guardian,
    RegistrationCourse,
)
from catalog.models import Course, CourseCategory
from django.utils import timezone
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

URL = "/api/v1/applications/"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def courses():
    cat = CourseCategory.objects.create(name="Software Development")
    c1 = Course.objects.create(category=cat, name="Python 3 Beginner", fee=Decimal("50000.00"))
    c2 = Course.objects.create(category=cat, name="Web Basics", fee=Decimal("40000.00"))
    inactive = Course.objects.create(category=cat, name="Retired", fee=Decimal("1.00"), active=False)
    return {"c1": c1, "c2": c2, "inactive": inactive}


def base_payload(courses, **overrides):
    data = {
        "first_name": "Ada",
        "last_name": "Obi",
        "birth_date": "1996-06-01",
        "gender": "female",
        "nationality": "Nigerian",
        "email": "ada@example.com",
        "phone": "+2348000000000",
        "address_line": "1 Main St",
        "city": "Lagos",
        "state_region": "Lagos",
        "country": "Nigeria",
        "education_level": "secondary",
        "institution": "Central High",
        "preferred_start_date": "2026-10-01",
        "preferred_session": "morning",
        "reason_for_joining": "Career switch",
        "referral_source": "friend_family",
        "emergency_name": "Emeka",
        "emergency_relationship": "Uncle",
        "emergency_phone": "+2348222222222",
        "course_ids": [courses["c1"].id, courses["c2"].id],
        "declaration_accepted": True,
    }
    data.update(overrides)
    return data


def test_adult_submission_creates_graph_and_number(client, courses):
    resp = client.post(URL, base_payload(courses), format="json")
    assert resp.status_code == 201, resp.content
    body = resp.json()
    assert body["status"] == ApplicationStatus.PENDING
    assert body["application_number"].startswith("E3-APP-")

    app = Application.objects.get(id=body["id"])
    assert app.applicant.email == "ada@example.com"
    assert app.submitted_at is not None
    assert not hasattr(app, "guardian")  # adult → no guardian
    # Fees are snapshotted from the catalog, not the client.
    fees = sorted(rc.fee_at_registration for rc in app.courses.all())
    assert fees == [Decimal("40000.00"), Decimal("50000.00")]


def test_minor_requires_guardian(client, courses):
    minor = base_payload(courses, birth_date="2012-01-01")
    resp = client.post(URL, minor, format="json")
    assert resp.status_code == 400
    assert "guardian_full_name" in resp.json()["error"]["details"]

    minor.update(
        {
            "guardian_full_name": "Ngozi Obi",
            "guardian_relationship": "Mother",
            "guardian_phone": "+2348111111111",
        }
    )
    resp = client.post(URL, minor, format="json")
    assert resp.status_code == 201
    app = Application.objects.get(id=resp.json()["id"])
    assert Guardian.objects.filter(application=app).exists()


def test_declaration_must_be_accepted(client, courses):
    resp = client.post(URL, base_payload(courses, declaration_accepted=False), format="json")
    assert resp.status_code == 400
    assert "declaration_accepted" in resp.json()["error"]["details"]


def test_unavailable_course_is_rejected(client, courses):
    payload = base_payload(courses, course_ids=[courses["inactive"].id])
    resp = client.post(URL, payload, format="json")
    assert resp.status_code == 400
    assert "course_ids" in resp.json()["error"]["details"]


def test_application_numbers_are_sequential_and_unique(client, courses):
    n1 = client.post(URL, base_payload(courses), format="json").json()["application_number"]
    n2 = client.post(URL, base_payload(courses, email="two@example.com"), format="json").json()[
        "application_number"
    ]
    assert n1 != n2
    year = timezone.now().year
    assert n1 == f"E3-APP-{year}-000001"
    assert n2 == f"E3-APP-{year}-000002"
    assert RegistrationCourse.objects.count() == 4
