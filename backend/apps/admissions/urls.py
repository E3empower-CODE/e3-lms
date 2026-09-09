from django.urls import path

from . import views

urlpatterns = [
    path("applications/", views.ApplicationCreateView.as_view(), name="application-create"),
]
