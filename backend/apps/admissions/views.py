from common.exceptions import error_response
from common.permissions import IsAdmissionsStaff
from django.db.models import Count
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, serializers, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

# Phase 5 conversion payloads; imported at module level for schema generation.
from students.serializers import (
    StudentDetailSerializer,
    StudentSummarySerializer,
)

from .models import Application, ApplicationNote
from .serializers import (
    ApplicationDetailSerializer,
    ApplicationListSerializer,
    ApplicationNoteSerializer,
    ApplicationReceiptSerializer,
    ApplicationSubmissionSerializer,
    TransitionSerializer,
)
from .workflow import ACTIONS, REASON_REQUIRED, TransitionError, apply_transition


def _detail_queryset():
    return Application.objects.select_related(
        "applicant", "guardian", "emergency_contact"
    ).prefetch_related(
        "courses", "notes", "notes__author", "activity", "activity__actor"
    )


class ApplicationsView(generics.ListCreateAPIView):
    """
    GET  — admissions-only, paginated/filterable list.
    POST — public registration submission (multipart or JSON).
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ["status"]
    search_fields = [
        "application_number",
        "applicant__email",
        "applicant__first_name",
        "applicant__last_name",
    ]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Application.objects.select_related("applicant").all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAdmissionsStaff()]

    def get_throttles(self):
        if self.request.method == "POST":
            return [ScopedRateThrottle()]
        return []

    throttle_scope = "registration"

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ApplicationSubmissionSerializer
        return ApplicationListSerializer

    @extend_schema(
        request=ApplicationSubmissionSerializer,
        responses={201: ApplicationReceiptSerializer},
    )
    def create(self, request, *args, **kwargs):
        data = request.data
        if hasattr(data, "getlist"):
            payload = {key: data.get(key) for key in data}
            payload["course_ids"] = data.getlist("course_ids")
            if "passport_photo" in request.FILES:
                payload["passport_photo"] = request.FILES["passport_photo"]
        else:
            payload = data

        serializer = ApplicationSubmissionSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        return Response(
            ApplicationReceiptSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )


class ApplicationDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAdmissionsStaff]
    serializer_class = ApplicationDetailSerializer

    def get_queryset(self):
        return _detail_queryset()


class ApplicationMetricsView(APIView):
    """Counts by status for the admissions dashboard."""

    permission_classes = [IsAdmissionsStaff]

    @extend_schema(
        responses=inline_serializer(
            "AdmissionsMetrics",
            {
                "total_applications": serializers.IntegerField(),
                "by_status": serializers.DictField(child=serializers.IntegerField()),
            },
        )
    )
    def get(self, request):
        rows = Application.objects.values("status").annotate(n=Count("id"))
        by_status = {row["status"]: row["n"] for row in rows}
        return Response(
            {
                "total_applications": sum(by_status.values()),
                "by_status": by_status,
            }
        )


class ApplicationNotesView(APIView):
    """Add an admissions note to an application."""

    permission_classes = [IsAdmissionsStaff]

    @extend_schema(
        request=inline_serializer("NoteInput", {"body": serializers.CharField()}),
        responses={201: ApplicationNoteSerializer},
    )
    def post(self, request, pk):
        application = generics.get_object_or_404(Application, pk=pk)
        body = (request.data.get("body") or "").strip()
        if not body:
            raise serializers.ValidationError({"body": ["This field is required."]})
        note = ApplicationNote.objects.create(
            application=application, author=request.user, body=body
        )
        return Response(
            ApplicationNoteSerializer(note).data, status=status.HTTP_201_CREATED
        )


class ApplicationTransitionView(APIView):
    """Apply a status transition (approve/reject/waitlist/review/cancel)."""

    permission_classes = [IsAdmissionsStaff]

    @extend_schema(
        operation_id="applications_transition",
        request=TransitionSerializer,
        responses=ApplicationDetailSerializer,
    )
    def post(self, request, pk, action):
        serializer = TransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data["reason"].strip()

        if action in REASON_REQUIRED and not reason:
            raise serializers.ValidationError(
                {"reason": ["A reason is required for this action."]}
            )
        if action not in ACTIONS:
            raise serializers.ValidationError({"action": ["Unknown action."]})

        application = generics.get_object_or_404(Application, pk=pk)
        try:
            apply_transition(application, action, actor=request.user, reason=reason)
        except TransitionError as exc:
            raise serializers.ValidationError({"status": [str(exc)]}) from exc

        application = _detail_queryset().get(pk=application.pk)
        return Response(ApplicationDetailSerializer(application).data)


class ApplicationConvertView(APIView):
    """Convert an approved application into a student (Phase 5).

    Idempotent and transactional: a repeat or race yields one student. Two
    conflict shapes the frontend understands:
      * 409 ALREADY_CONVERTED — the application already maps to a student
        (details.student carries it).
      * 409 DUPLICATE_STUDENTS — likely duplicates exist; a human can retry
        with {"force": true} (details.duplicates lists the candidates).
    """

    permission_classes = [IsAdmissionsStaff]

    @extend_schema(
        request=inline_serializer(
            "ConvertInput", {"force": serializers.BooleanField(required=False)}
        ),
        responses={201: StudentDetailSerializer},
    )
    def post(self, request, pk):
        from students.services import (
            ConversionError,
            DuplicateWarning,
            convert_application,
        )

        application = generics.get_object_or_404(Application, pk=pk)
        force = bool(request.data.get("force", False))

        try:
            student, created = convert_application(application, force=force)
        except DuplicateWarning as warning:
            return error_response(
                status.HTTP_409_CONFLICT,
                "DUPLICATE_STUDENTS",
                "This applicant may already exist as a student.",
                details={
                    "duplicates": StudentSummarySerializer(
                        warning.candidates, many=True
                    ).data
                },
                request=request,
            )
        except ConversionError as exc:
            raise serializers.ValidationError({"status": [str(exc)]}) from exc

        payload = StudentDetailSerializer(student).data
        if not created:
            return error_response(
                status.HTTP_409_CONFLICT,
                "ALREADY_CONVERTED",
                "This application has already been converted to a student.",
                details={"student": payload},
                request=request,
            )
        return Response(payload, status=status.HTTP_201_CREATED)
