from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from .models import Course, CourseCategory
from .serializers import CourseCategorySerializer, CourseSerializer


class CourseCategoryListView(ListAPIView):
    """Public list of course categories."""

    permission_classes = [AllowAny]
    serializer_class = CourseCategorySerializer
    queryset = CourseCategory.objects.all()
    filterset_fields = ["active"]
    search_fields = ["name"]


class CourseListView(ListAPIView):
    """Public catalog list. Registration reads this to offer course choices."""

    permission_classes = [AllowAny]
    serializer_class = CourseSerializer
    queryset = Course.objects.select_related("category").all()
    filterset_fields = ["active", "category"]
    search_fields = ["name", "category__name"]
    ordering_fields = ["name", "fee"]
