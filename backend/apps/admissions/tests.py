import datetime
from decimal import Decimal

import pytest
from admissions.models import (
    Applicant,
    Application,
    ApplicationStatus,
    EmergencyContact,
    Guardian,
    RegistrationCourse,
)
from django.db import IntegrityError, transaction

pytestmark = pytest.mark.django_db


def make_applicant(**overrides):
    data = {
        "first_name": "Ada",
        "last_name": "Obi",
        "birth_date": datetime.date(2005, 6, 1),
        "gender": "female",
        "nationality": "Nigerian",
        "email": "ada@example.com",
        "phone": "+2348000000000",
        "address_line": "1 Main St",
        "city": "Lagos",
        "state_region": "Lagos",
        "country": "Nigeria",
    }
    data.update(overrides)
    return Applicant.objects.create(**data)


def make_application(applicant=None, **overrides):
    applicant = applicant or make_applicant()
    data = {
        "applicant": applicant,
        "education_level": "secondary",
        "institution": "Central High",
    }
    data.update(overrides)
    return Application.objects.create(**data)


def test_application_defaults_to_pending():
    app = make_application()
    assert app.status == ApplicationStatus.PENDING
    assert app.application_number is None
    assert str(app) == f"Application #{app.pk}"


def test_full_registration_graph():
    app = make_application()
    Guardian.objects.create(
        application=app, full_name="Ngozi Obi", relationship="Mother", phone="+2348111111111"
    )
    EmergencyContact.objects.create(
        application=app, name="Emeka Obi", relationship="Uncle", phone="+2348222222222"
    )
    RegistrationCourse.objects.create(
        application=app, course_ref=1, course_name="Python 3 Beginner", fee_at_registration=Decimal("50000.00")
    )
    RegistrationCourse.objects.create(
        application=app, course_ref=2, course_name="Web Basics", fee_at_registration=Decimal("40000.00")
    )
    assert app.guardian.full_name == "Ngozi Obi"
    assert app.emergency_contact.name == "Emeka Obi"
    assert app.courses.count() == 2


def test_application_number_is_unique():
    a1 = make_application()
    a1.application_number = "E3-APP-2026-000001"
    a1.save()
    a2 = make_application()
    a2.application_number = "E3-APP-2026-000001"
    with pytest.raises(IntegrityError), transaction.atomic():
        a2.save()


def test_course_is_unique_per_application():
    app = make_application()
    RegistrationCourse.objects.create(
        application=app, course_ref=1, course_name="Python 3 Beginner", fee_at_registration=Decimal("50000.00")
    )
    with pytest.raises(IntegrityError), transaction.atomic():
        RegistrationCourse.objects.create(
            application=app, course_ref=1, course_name="Python 3 Beginner", fee_at_registration=Decimal("50000.00")
        )


def test_negative_fee_is_rejected_by_constraint():
    app = make_application()
    with pytest.raises(IntegrityError), transaction.atomic():
        RegistrationCourse.objects.create(
            application=app, course_ref=3, course_name="Bad", fee_at_registration=Decimal("-1.00")
        )


def test_deleting_application_cascades_related_records():
    app = make_application()
    Guardian.objects.create(
        application=app, full_name="G", relationship="Mother", phone="+2348111111111"
    )
    RegistrationCourse.objects.create(
        application=app, course_ref=1, course_name="C", fee_at_registration=Decimal("1.00")
    )
    app.delete()
    assert Guardian.objects.count() == 0
    assert RegistrationCourse.objects.count() == 0
