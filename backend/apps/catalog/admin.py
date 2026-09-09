from django.contrib import admin

from .models import Course, CourseCategory


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "active"]
    list_filter = ["active"]
    search_fields = ["name"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "fee", "active"]
    list_filter = ["active", "category"]
    search_fields = ["name"]
    list_select_related = ["category"]
