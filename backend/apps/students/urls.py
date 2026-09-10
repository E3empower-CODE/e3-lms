from django.urls import path

from . import views

urlpatterns = [
    path("students/", views.StudentsView.as_view(), name="students"),
    path(
        "students/<int:pk>/",
        views.StudentDetailView.as_view(),
        name="student-detail",
    ),
]
