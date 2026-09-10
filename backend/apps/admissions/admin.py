from django.contrib import admin

from .models import (
    Applicant,
    Application,
    EmergencyContact,
    Guardian,
    RegistrationCourse,
)


class GuardianInline(admin.StackedInline):
    model = Guardian
    extra = 0


class EmergencyContactInline(admin.StackedInline):
    model = EmergencyContact
    extra = 0


class RegistrationCourseInline(admin.TabularInline):
    model = RegistrationCourse
    extra = 0


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["__str__", "status", "applicant", "created_at"]
    list_filter = ["status", "preferred_session", "referral_source"]
    search_fields = [
        "application_number",
        "applicant__first_name",
        "applicant__last_name",
        "applicant__email",
    ]
    inlines = [GuardianInline, EmergencyContactInline, RegistrationCourseInline]


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email", "phone", "created_at"]
    search_fields = ["first_name", "last_name", "email"]
