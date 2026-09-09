from django.contrib.auth import login, logout, update_session_auth_hash
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .emails import send_password_reset_email
from .models import User
from .serializers import (
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserSerializer,
)


class HealthView(APIView):
    """Liveness probe. Public."""

    permission_classes = [AllowAny]

    @extend_schema(
        responses=inline_serializer(
            "Health", {"status": serializers.CharField()}
        )
    )
    def get(self, request):
        return Response({"status": "ok"})


class LoginView(APIView):
    """
    Cookie-session login. Anonymous, so no CSRF token is required for this
    first request; a session cookie is issued on success.
    """

    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, responses=UserSerializer)
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    """Clear the session. State-changing, so CSRF-protected by SessionAuth."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None, responses={204: OpenApiResponse(description="Signed out")}
    )
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CurrentUserView(APIView):
    """
    Return the authenticated user, or 401 when anonymous. Public so the CSRF
    cookie is always set on the SPA's bootstrap call (the frontend echoes it on
    later state-changing requests), even when the visitor is not signed in.
    """

    permission_classes = [AllowAny]

    @extend_schema(responses=UserSerializer)
    def get(self, request):
        if not request.user.is_authenticated:
            raise NotAuthenticated()
        return Response(UserSerializer(request.user).data)


class PasswordChangeView(APIView):
    """Change the signed-in user's password; the session stays valid."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PasswordChangeSerializer,
        responses={204: OpenApiResponse(description="Password changed")},
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Keep the current session authenticated after the password rotation.
        update_session_auth_hash(request, user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetView(APIView):
    """
    Request a password-reset email. Public, and deliberately returns the same
    204 whether or not the email matches an account (no enumeration).
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={204: OpenApiResponse(description="Reset email sent if the account exists")},
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            send_password_reset_email(user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetConfirmView(APIView):
    """Set a new password using the emailed uid + token. Public."""

    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={204: OpenApiResponse(description="Password reset")},
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
