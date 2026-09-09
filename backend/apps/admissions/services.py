"""Registration submission: number generation and the atomic create service."""

from django.db import transaction
from django.utils import timezone

from .models import (
    Applicant,
    Application,
    EmergencyContact,
    Guardian,
    NumberSequence,
    RegistrationCourse,
)


def next_application_number(year=None):
    """Return the next E3-APP-YYYY-###### under a row lock (concurrency-safe)."""
    year = year or timezone.now().year
    NumberSequence.objects.get_or_create(scope="application", year=year)
    with transaction.atomic():
        seq = NumberSequence.objects.select_for_update().get(
            scope="application", year=year
        )
        seq.value += 1
        seq.save(update_fields=["value"])
    return f"E3-APP-{year}-{seq.value:06d}"


@transaction.atomic
def submit_application(*, applicant_data, application_data, guardian_data,
                       emergency_data, courses, passport_photo=None):
    """
    Persist an application and all related records in one transaction and assign
    a unique application number. `courses` is a list of resolved catalog
    Course instances; each fee is snapshotted immutably at submission.
    """
    applicant = Applicant.objects.create(
        **applicant_data,
        passport_photo=passport_photo,
    )

    application = Application.objects.create(
        applicant=applicant,
        application_number=next_application_number(),
        submitted_at=timezone.now(),
        **application_data,
    )

    if guardian_data:
        Guardian.objects.create(application=application, **guardian_data)

    EmergencyContact.objects.create(application=application, **emergency_data)

    RegistrationCourse.objects.bulk_create(
        [
            RegistrationCourse(
                application=application,
                course_ref=course.id,
                course_name=course.name,
                fee_at_registration=course.fee,
            )
            for course in courses
        ]
    )

    return application
