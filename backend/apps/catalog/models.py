"""
Course catalog (PLAN.md Phase 2 / DATABASE.md — Catalog).

A Course is permanent catalog data (a permanent offering like "Python 3
Beginner"); scheduled deliveries (Class/Intake) are added in later phases.
Registration snapshots a course's `fee` into RegistrationCourse.fee_at_registration
at submission, so later price changes never rewrite history.
"""

from common.models import TimeStampedModel
from django.core.validators import MinValueValidator
from django.db import models


class CourseCategory(TimeStampedModel):
    name = models.CharField(max_length=150, unique=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "course categories"

    def __str__(self):
        return self.name


class Course(TimeStampedModel):
    category = models.ForeignKey(
        CourseCategory, on_delete=models.PROTECT, related_name="courses"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    fee = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    duration_label = models.CharField(max_length=100, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["category", "name"], name="uniq_course_name_per_category"
            ),
            models.CheckConstraint(
                condition=models.Q(fee__gte=0), name="course_fee_non_negative"
            ),
        ]
        indexes = [models.Index(fields=["active"])]

    def __str__(self):
        return self.name

    @property
    def category_name(self):
        return self.category.name
