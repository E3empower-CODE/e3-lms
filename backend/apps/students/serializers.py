from rest_framework import serializers

from .models import Student


class StudentListSerializer(serializers.ModelSerializer):
    """Row shape for the students list."""

    full_name = serializers.CharField(source="applicant.full_name", read_only=True)
    email = serializers.EmailField(source="applicant.email", read_only=True)

    class Meta:
        model = Student
        fields = ["id", "student_number", "full_name", "email", "is_active"]
        read_only_fields = fields


class StudentSummarySerializer(serializers.ModelSerializer):
    """Minimal student shape for conversion results and duplicate candidates."""

    full_name = serializers.CharField(source="applicant.full_name", read_only=True)

    class Meta:
        model = Student
        fields = ["id", "student_number", "full_name"]
        read_only_fields = fields


class StudentDetailSerializer(serializers.ModelSerializer):
    """Full student profile — identity flattened from the linked applicant, plus
    a pointer back to the originating application."""

    full_name = serializers.CharField(source="applicant.full_name", read_only=True)
    first_name = serializers.CharField(source="applicant.first_name", read_only=True)
    last_name = serializers.CharField(source="applicant.last_name", read_only=True)
    email = serializers.EmailField(source="applicant.email", read_only=True)
    phone = serializers.CharField(source="applicant.phone", read_only=True)
    birth_date = serializers.DateField(source="applicant.birth_date", read_only=True)
    gender = serializers.CharField(source="applicant.gender", read_only=True)
    nationality = serializers.CharField(source="applicant.nationality", read_only=True)
    address_line = serializers.CharField(
        source="applicant.address_line", read_only=True
    )
    city = serializers.CharField(source="applicant.city", read_only=True)
    state_region = serializers.CharField(
        source="applicant.state_region", read_only=True
    )
    country = serializers.CharField(source="applicant.country", read_only=True)

    application_id = serializers.IntegerField(source="application.id", read_only=True)
    application_number = serializers.CharField(
        source="application.application_number", read_only=True
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "student_number",
            "is_active",
            "full_name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "birth_date",
            "gender",
            "nationality",
            "address_line",
            "city",
            "state_region",
            "country",
            "application_id",
            "application_number",
            "created_at",
        ]
        read_only_fields = fields
