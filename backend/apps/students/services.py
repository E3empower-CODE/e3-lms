"""Application → student conversion: number generation, duplicate detection,
and the idempotent, transactional create service."""

from admissions.models import ApplicationStatus as S
from admissions.models import NumberSequence
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from .models import Student


class ConversionError(Exception):
    """Raised when an application cannot be converted (e.g. not approved)."""


class DuplicateWarning(Exception):
    """Raised when likely-duplicate students exist and `force` was not set.

    `candidates` is a list of the matching Student instances for human review.
    """

    def __init__(self, candidates):
        self.candidates = candidates
        super().__init__("Possible duplicate students found.")


def next_student_number(year=None):
    """Return the next E3-STU-YYYY-###### under a row lock (concurrency-safe)."""
    year = year or timezone.now().year
    NumberSequence.objects.get_or_create(scope="student", year=year)
    with transaction.atomic():
        seq = NumberSequence.objects.select_for_update().get(scope="student", year=year)
        seq.value += 1
        seq.save(update_fields=["value"])
    return f"E3-STU-{year}-{seq.value:06d}"


def _find_duplicates(applicant):
    """Existing students whose applicant shares this applicant's email or full
    name (case-insensitive), used to warn before creating a second record."""
    return list(
        Student.objects.select_related("applicant").filter(
            Q(applicant__email__iexact=applicant.email)
            | Q(
                applicant__first_name__iexact=applicant.first_name,
                applicant__last_name__iexact=applicant.last_name,
            )
        )
    )


@transaction.atomic
def convert_application(application, *, force=False):
    """
    Create (or return the existing) Student for an approved application.

    Idempotent: if the application already maps to a student, that student is
    returned and `created` is False — callers surface this as ALREADY_CONVERTED.
    Unless `force` is set, likely duplicates raise DuplicateWarning for review.
    """
    # Lock the application row so concurrent converts serialize on it.
    application = (
        application.__class__.objects.select_for_update()
        .select_related("applicant")
        .get(pk=application.pk)
    )

    existing = Student.objects.filter(application=application).first()
    if existing:
        return existing, False

    if application.status != S.APPROVED:
        raise ConversionError("Only approved applications can be converted.")

    applicant = application.applicant

    if not force:
        candidates = _find_duplicates(applicant)
        if candidates:
            raise DuplicateWarning(candidates)

    student = Student.objects.create(
        application=application,
        applicant=applicant,
        student_number=next_student_number(),
    )
    return student, True
