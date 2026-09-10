"""
Student identity created from an approved application (DATABASE.md — Students
boundary). A Student is the durable record the rest of the LMS (enrollments,
attendance, finance, certificates) hangs off; identity is read through the
linked Applicant so it stays a single source of truth.
"""

from common.models import TimeStampedModel
from django.db import models


class Student(TimeStampedModel):
    """One student, created by converting an approved Application. The link to
    the application is one-to-one and idempotent: an application maps to exactly
    one student."""

    application = models.OneToOneField(
        "admissions.Application",
        on_delete=models.PROTECT,
        related_name="student",
    )
    applicant = models.OneToOneField(
        "admissions.Applicant",
        on_delete=models.PROTECT,
        related_name="student",
    )

    # Display identifier E3-STU-YYYY-######; assigned by the conversion service.
    student_number = models.CharField(max_length=32, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student_number"]),
        ]

    def __str__(self):
        return self.student_number

    @property
    def full_name(self):
        return self.applicant.full_name
