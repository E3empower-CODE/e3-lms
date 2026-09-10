"""
Public-registration domain (DATABASE.md — Admissions boundary):

    Applicant → Application → RegistrationCourse
                    ├── Guardian
                    └── EmergencyContact

Each submission captures an immutable snapshot: the applicant's details, the
application's answers, and per-course `fee_at_registration`. Choice values are
the snake_case wire codes the frontend already sends. Numbering, the atomic
submission service, and the application→student conversion are added on top of
these models in later steps.
"""

from common.models import TimeStampedModel
from django.core.validators import MinValueValidator
from django.db import models


class Gender(models.TextChoices):
    FEMALE = "female", "Female"
    MALE = "male", "Male"
    OTHER = "other", "Other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say", "Prefer not to say"


class EducationLevel(models.TextChoices):
    PRIMARY = "primary", "Primary"
    SECONDARY = "secondary", "Secondary"
    DIPLOMA = "diploma", "Diploma"
    UNDERGRADUATE = "undergraduate", "Undergraduate"
    POSTGRADUATE = "postgraduate", "Postgraduate"
    OTHER = "other", "Other"


class PreferredSession(models.TextChoices):
    MORNING = "morning", "Morning"
    AFTERNOON = "afternoon", "Afternoon"
    EVENING = "evening", "Evening"


class ReferralSource(models.TextChoices):
    FRIEND_FAMILY = "friend_family", "Friend or family"
    SOCIAL_MEDIA = "social_media", "Social media"
    SEARCH = "search", "Web search"
    EVENT = "event", "Event or fair"
    OTHER = "other", "Other"


class ApplicationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    UNDER_REVIEW = "under_review", "Under review"
    APPROVED = "approved", "Approved"
    WAITLISTED = "waitlisted", "Waitlisted"
    REJECTED = "rejected", "Rejected"
    CANCELLED = "cancelled", "Cancelled"


class NumberSequence(models.Model):
    """A per-scope, per-year counter for concurrency-safe display identifiers
    (e.g. application numbers). Incremented under a row lock — never
    read-the-last-row-and-add-one (DATABASE.md — Identifier Generation)."""

    scope = models.CharField(max_length=32)
    year = models.PositiveIntegerField()
    value = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["scope", "year"], name="uniq_sequence_scope_year"
            )
        ]

    def __str__(self):
        return f"{self.scope}/{self.year}={self.value}"


class Applicant(TimeStampedModel):
    """Identity + contact captured at registration. Applicants have no account."""

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    birth_date = models.DateField()
    gender = models.CharField(max_length=32, choices=Gender.choices)
    nationality = models.CharField(max_length=100)

    email = models.EmailField()
    phone = models.CharField(max_length=32)

    address_line = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state_region = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    passport_photo = models.ImageField(
        upload_to="applicants/photos/", null=True, blank=True
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["last_name", "first_name"]),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class Application(TimeStampedModel):
    """One public application. Education, schedule, and declaration answers live
    here; identity lives on the linked Applicant."""

    applicant = models.OneToOneField(
        Applicant, on_delete=models.CASCADE, related_name="application"
    )

    # Display identifier E3-APP-YYYY-######; assigned by the submission service.
    application_number = models.CharField(
        max_length=32, unique=True, null=True, blank=True
    )
    status = models.CharField(
        max_length=32,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING,
    )

    # Education
    education_level = models.CharField(max_length=32, choices=EducationLevel.choices)
    institution = models.CharField(max_length=255)
    current_level = models.CharField(max_length=100, blank=True)
    previous_computer_training = models.BooleanField(default=False)
    training_description = models.TextField(blank=True)

    # Schedule preference (applies to the selected courses)
    preferred_start_date = models.DateField(null=True, blank=True)
    preferred_session = models.CharField(
        max_length=16, choices=PreferredSession.choices, blank=True
    )

    # Additional details
    has_computer_access = models.BooleanField(default=False)
    reason_for_joining = models.TextField(blank=True)
    referral_source = models.CharField(
        max_length=32, choices=ReferralSource.choices, blank=True
    )

    # Declaration + lifecycle
    declaration_accepted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["application_number"]),
        ]

    def __str__(self):
        return self.application_number or f"Application #{self.pk}"


class Guardian(TimeStampedModel):
    """Guardian details, required when the applicant is a minor (enforced at the
    submission boundary, not the model)."""

    application = models.OneToOneField(
        Application, on_delete=models.CASCADE, related_name="guardian"
    )
    full_name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=100)
    phone = models.CharField(max_length=32)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.full_name


class EmergencyContact(TimeStampedModel):
    application = models.OneToOneField(
        Application, on_delete=models.CASCADE, related_name="emergency_contact"
    )
    name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=100)
    phone = models.CharField(max_length=32)
    alt_phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.name


class RegistrationCourse(TimeStampedModel):
    """A course selected on an application, with its immutable fee snapshot.

    `course_ref` is the catalog course id sent by the client; a proper FK to the
    Course model is added once the catalog app exists. `fee_at_registration` is
    historical money and must never be recomputed from current prices.
    """

    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="courses"
    )
    course_ref = models.PositiveIntegerField(null=True, blank=True)
    course_name = models.CharField(max_length=255)
    fee_at_registration = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["application", "course_ref"],
                name="uniq_course_per_application",
            ),
            models.CheckConstraint(
                condition=models.Q(fee_at_registration__gte=0),
                name="registrationcourse_fee_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.course_name} ({self.fee_at_registration})"
