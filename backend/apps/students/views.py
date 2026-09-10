from common.permissions import IsAdmissionsStaff
from rest_framework import generics

from .models import Student
from .serializers import StudentDetailSerializer, StudentListSerializer


class StudentsView(generics.ListAPIView):
    """Admissions-only, paginated/searchable students list."""

    permission_classes = [IsAdmissionsStaff]
    serializer_class = StudentListSerializer
    search_fields = [
        "student_number",
        "applicant__email",
        "applicant__first_name",
        "applicant__last_name",
    ]
    ordering_fields = ["created_at", "student_number"]
    # The client sends ordering=last_name; identity lives on the applicant, so
    # the default sort is by applicant name (unlisted params fall back here).
    ordering = ["applicant__last_name", "applicant__first_name"]

    def get_queryset(self):
        return Student.objects.select_related("applicant").all()


class StudentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAdmissionsStaff]
    serializer_class = StudentDetailSerializer

    def get_queryset(self):
        return Student.objects.select_related("applicant", "application").all()
