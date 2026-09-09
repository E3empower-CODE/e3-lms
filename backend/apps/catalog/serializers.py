from rest_framework import serializers

from .models import Course, CourseCategory


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ["id", "name", "active"]
        read_only_fields = fields


class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "name",
            "category",
            "category_name",
            "description",
            "fee",
            "duration_label",
            "active",
        ]
        read_only_fields = fields
