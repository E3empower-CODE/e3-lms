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


# --- Admissions read + workflow (Phase 4) ---


class ApplicationListSerializer(serializers.ModelSerializer):
    """Row shape for the admissions list."""

    applicant_name = serializers.CharField(source="applicant.full_name", read_only=True)
    email = serializers.EmailField(source="applicant.email", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "application_number",
            "applicant_name",
            "email",
            "status",
            "created_at",
        ]
        read_only_fields = fields


class RegistrationCourseSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(source="course_name", read_only=True)
    fee_at_registration = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )


class ApplicationNoteSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    body = serializers.CharField()
    author_name = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class ApplicationActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    action = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)
    actor_name = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Full application for the detail view — applicant/guardian/emergency
    fields flattened to the top level, plus courses, notes, and activity."""

    applicant_name = serializers.CharField(source="applicant.full_name", read_only=True)
    first_name = serializers.CharField(source="applicant.first_name", read_only=True)
    last_name = serializers.CharField(source="applicant.last_name", read_only=True)
    birth_date = serializers.DateField(source="applicant.birth_date", read_only=True)
    gender = serializers.CharField(source="applicant.gender", read_only=True)
    nationality = serializers.CharField(source="applicant.nationality", read_only=True)
    email = serializers.EmailField(source="applicant.email", read_only=True)
    phone = serializers.CharField(source="applicant.phone", read_only=True)
    address_line = serializers.CharField(source="applicant.address_line", read_only=True)
    city = serializers.CharField(source="applicant.city", read_only=True)
    state_region = serializers.CharField(source="applicant.state_region", read_only=True)
    country = serializers.CharField(source="applicant.country", read_only=True)

    guardian_full_name = serializers.SerializerMethodField()
    guardian_relationship = serializers.SerializerMethodField()
    guardian_phone = serializers.SerializerMethodField()

    emergency_name = serializers.SerializerMethodField()
    emergency_relationship = serializers.SerializerMethodField()
    emergency_phone = serializers.SerializerMethodField()

    courses = RegistrationCourseSerializer(many=True, read_only=True)
    notes = ApplicationNoteSerializer(many=True, read_only=True)
    activity = ApplicationActivitySerializer(many=True, read_only=True)

    student_id = serializers.SerializerMethodField()
    student_number = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id", "application_number", "status", "created_at", "submitted_at",
            "applicant_name", "first_name", "last_name", "birth_date", "gender",
            "nationality", "email", "phone", "address_line", "city",
            "state_region", "country",
            "education_level", "institution", "current_level",
            "previous_computer_training", "training_description",
            "preferred_start_date", "preferred_session",
            "has_computer_access", "reason_for_joining", "referral_source",
            "guardian_full_name", "guardian_relationship", "guardian_phone",
            "emergency_name", "emergency_relationship", "emergency_phone",
            "courses", "notes", "activity", "student_id", "student_number",
        ]

    def _guardian(self, obj):
        return getattr(obj, "guardian", None)

    def get_guardian_full_name(self, obj) -> str:
        g = self._guardian(obj)
        return g.full_name if g else ""

    def get_guardian_relationship(self, obj) -> str:
        g = self._guardian(obj)
        return g.relationship if g else ""

    def get_guardian_phone(self, obj) -> str:
        g = self._guardian(obj)
        return g.phone if g else ""

    def _emergency(self, obj):
        return getattr(obj, "emergency_contact", None)

    def get_emergency_name(self, obj) -> str:
        e = self._emergency(obj)
        return e.name if e else ""

    def get_emergency_relationship(self, obj) -> str:
        e = self._emergency(obj)
        return e.relationship if e else ""

    def get_emergency_phone(self, obj) -> str:
        e = self._emergency(obj)
        return e.phone if e else ""

    def get_student_id(self, obj) -> int | None:
        student = getattr(obj, "student", None)
        return student.id if student else None

    def get_student_number(self, obj) -> str | None:
        student = getattr(obj, "student", None)
        return student.student_number if student else None


class TransitionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")
