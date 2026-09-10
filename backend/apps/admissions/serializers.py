from catalog.models import Course
from django.utils import timezone
from rest_framework import serializers

from .models import (
    Application,
    EducationLevel,
    Gender,
    PreferredSession,
    ReferralSource,
)

MAX_PHOTO_BYTES = 5 * 1024 * 1024
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png"}
MINOR_AGE = 18


def _age(birth_date, at):
    return at.year - birth_date.year - (
        (at.month, at.day) < (birth_date.month, birth_date.day)
    )


class ApplicationSubmissionSerializer(serializers.Serializer):
    """
    Validates and creates a full public application (applicant + application +
    optional guardian + emergency contact + selected courses) in one step.
    Fees and the age/guardian rule are evaluated server-side; the client's
    values are not authoritative.
    """

    # Applicant
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    birth_date = serializers.DateField()
    gender = serializers.ChoiceField(choices=Gender.choices)
    nationality = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32)
    address_line = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    state_region = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100)
    passport_photo = serializers.ImageField(required=False, allow_null=True)

    # Education
    education_level = serializers.ChoiceField(choices=EducationLevel.choices)
    institution = serializers.CharField(max_length=255)
    current_level = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    previous_computer_training = serializers.BooleanField(default=False)
    training_description = serializers.CharField(required=False, allow_blank=True, default="")

    # Schedule
    preferred_start_date = serializers.DateField()
    preferred_session = serializers.ChoiceField(choices=PreferredSession.choices)

    # Additional
    has_computer_access = serializers.BooleanField(default=False)
    reason_for_joining = serializers.CharField()
    referral_source = serializers.ChoiceField(choices=ReferralSource.choices)

    # Guardian (required when the applicant is a minor)
    guardian_full_name = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    guardian_relationship = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    guardian_phone = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")
    guardian_email = serializers.EmailField(required=False, allow_blank=True, default="")

    # Emergency contact
    emergency_name = serializers.CharField(max_length=255)
    emergency_relationship = serializers.CharField(max_length=100)
    emergency_phone = serializers.CharField(max_length=32)
    emergency_alt_phone = serializers.CharField(max_length=32, required=False, allow_blank=True, default="")
    emergency_email = serializers.EmailField(required=False, allow_blank=True, default="")

    # Courses + declaration
    course_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False
    )
    declaration_accepted = serializers.BooleanField()

    def validate_declaration_accepted(self, value):
        if value is not True:
            raise serializers.ValidationError(
                "You must confirm the declaration to submit."
            )
        return value

    def validate_passport_photo(self, photo):
        if photo is None:
            return photo
        if photo.size > MAX_PHOTO_BYTES:
            raise serializers.ValidationError("The photo must be 5MB or smaller.")
        content_type = getattr(photo, "content_type", None)
        if content_type and content_type not in ALLOWED_PHOTO_TYPES:
            raise serializers.ValidationError("The photo must be a JPEG or PNG.")
        return photo

    def validate_course_ids(self, value):
        ids = list(dict.fromkeys(value))  # de-duplicate, preserve order
        courses = Course.objects.filter(id__in=ids, active=True)
        by_id = {course.id: course for course in courses}
        missing = [i for i in ids if i not in by_id]
        if missing:
            raise serializers.ValidationError(
                f"These courses are unavailable: {missing}."
            )
        self._courses = [by_id[i] for i in ids]
        return ids

    def validate(self, attrs):
        # Under-18 rule is evaluated at submission time on the server.
        if _age(attrs["birth_date"], timezone.now().date()) < MINOR_AGE:
            missing = {}
            for field in ("guardian_full_name", "guardian_relationship", "guardian_phone"):
                if not attrs.get(field):
                    missing[field] = ["Required for applicants under 18."]
            if missing:
                raise serializers.ValidationError(missing)

        if attrs.get("previous_computer_training") and not attrs.get("training_description"):
            raise serializers.ValidationError(
                {"training_description": ["Describe your previous computer training."]}
            )
        return attrs

    def create(self, validated_data):
        from .services import submit_application

        applicant_fields = [
            "first_name", "last_name", "birth_date", "gender", "nationality",
            "email", "phone", "address_line", "city", "state_region", "country",
        ]
        application_fields = [
            "education_level", "institution", "current_level",
            "previous_computer_training", "training_description",
            "preferred_start_date", "preferred_session", "has_computer_access",
            "reason_for_joining", "referral_source", "declaration_accepted",
        ]

        applicant_data = {k: validated_data[k] for k in applicant_fields}
        application_data = {k: validated_data[k] for k in application_fields}

        is_minor = _age(validated_data["birth_date"], timezone.now().date()) < MINOR_AGE
        guardian_data = None
        if is_minor:
            guardian_data = {
                "full_name": validated_data["guardian_full_name"],
                "relationship": validated_data["guardian_relationship"],
                "phone": validated_data["guardian_phone"],
                "email": validated_data.get("guardian_email", ""),
            }

        emergency_data = {
            "name": validated_data["emergency_name"],
            "relationship": validated_data["emergency_relationship"],
            "phone": validated_data["emergency_phone"],
            "alt_phone": validated_data.get("emergency_alt_phone", ""),
            "email": validated_data.get("emergency_email", ""),
        }

        return submit_application(
            applicant_data=applicant_data,
            application_data=application_data,
            guardian_data=guardian_data,
            emergency_data=emergency_data,
            courses=self._courses,
            passport_photo=validated_data.get("passport_photo"),
        )


class ApplicationReceiptSerializer(serializers.ModelSerializer):
    """The success payload returned after submission."""

    class Meta:
        model = Application
        fields = ["id", "application_number", "status"]
        read_only_fields = fields
