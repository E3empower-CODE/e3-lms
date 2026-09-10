from django.urls import path

from . import views

urlpatterns = [
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("auth/me/", views.CurrentUserView.as_view(), name="current-user"),
    path(
        "auth/password/change/",
        views.PasswordChangeView.as_view(),
        name="password-change",
    ),
    path(
        "auth/password/reset/",
        views.PasswordResetView.as_view(),
        name="password-reset",
    ),
    path(
        "auth/password/reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
]
