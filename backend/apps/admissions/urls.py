from django.urls import path

from . import views

urlpatterns = [
    path("applications/", views.ApplicationsView.as_view(), name="applications"),
    path(
        "applications/metrics/",
        views.ApplicationMetricsView.as_view(),
        name="application-metrics",
    ),
    path(
        "applications/<int:pk>/",
        views.ApplicationDetailView.as_view(),
        name="application-detail",
    ),
    path(
        "applications/<int:pk>/notes/",
        views.ApplicationNotesView.as_view(),
        name="application-notes",
    ),
    path(
        "applications/<int:pk>/convert/",
        views.ApplicationConvertView.as_view(),
        name="application-convert",
    ),
    path(
        "applications/<int:pk>/<slug:action>/",
        views.ApplicationTransitionView.as_view(),
        name="application-transition",
    ),
]
