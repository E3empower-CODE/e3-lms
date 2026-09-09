from django.urls import path

from . import views

urlpatterns = [
    path("courses/", views.CourseListView.as_view(), name="course-list"),
    path(
        "course-categories/",
        views.CourseCategoryListView.as_view(),
        name="course-category-list",
    ),
]
