from drf_spectacular.utils import extend_schema
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .serializers import ApplicationReceiptSerializer, ApplicationSubmissionSerializer


class ApplicationCreateView(APIView):
    """
    Public registration submission. Accepts JSON or multipart (passport photo)
    and creates the whole application graph atomically, assigning a unique
    application number. Throttled to curb abuse.
    """

    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "registration"

    @extend_schema(
        request=ApplicationSubmissionSerializer,
        responses={201: ApplicationReceiptSerializer},
    )
    def post(self, request):
        data = request.data
        if hasattr(data, "getlist"):
            # Multipart/form QueryDict: flatten, but keep course_ids as a list
            # and take the uploaded file from request.FILES.
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
            ApplicationReceiptSerializer(application).data, status=201
        )
