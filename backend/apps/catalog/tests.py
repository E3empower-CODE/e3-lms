from decimal import Decimal

import pytest
from catalog.models import Course, CourseCategory
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def catalog():
    dev = CourseCategory.objects.create(name="Software Development")
    inactive_cat = CourseCategory.objects.create(name="Archived", active=False)
    active = Course.objects.create(
        category=dev, name="Python 3 Beginner", fee=Decimal("50000.00"), duration_label="8 weeks"
    )
    Course.objects.create(
        category=inactive_cat, name="Old Course", fee=Decimal("10000.00"), active=False
    )
    return {"active": active}


def test_courses_are_public_and_enveloped(client, catalog):
    resp = client.get("/api/v1/courses/")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body and "pagination" in body
    assert body["pagination"]["total_items"] == 2


def test_courses_filter_active_and_expose_category_name(client, catalog):
    resp = client.get("/api/v1/courses/?active=true")
    assert resp.status_code == 200
    rows = resp.json()["data"]
    assert len(rows) == 1
    row = rows[0]
    assert row["name"] == "Python 3 Beginner"
    assert row["category_name"] == "Software Development"
    assert row["fee"] == "50000.00"


def test_course_categories_are_public(client, catalog):
    resp = client.get("/api/v1/course-categories/")
    assert resp.status_code == 200
    assert resp.json()["pagination"]["total_items"] == 2


def test_seed_command_is_idempotent(db):
    from django.core.management import call_command

    call_command("seed_catalog")
    first = Course.objects.count()
    assert first > 0
    call_command("seed_catalog")
    assert Course.objects.count() == first
