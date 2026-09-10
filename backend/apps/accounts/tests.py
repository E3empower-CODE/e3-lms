import pytest
from accounts.models import Role
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

User = get_user_model()

STRONG_PASSWORD = "Zx9-vector-lime"


def reset_link_parts(user):
    return (
        urlsafe_base64_encode(force_bytes(user.pk)),
        default_token_generator.make_token(user),
    )


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def student(db):
    return User.objects.create_user(
        email="ada@example.com", password="s3cret-pass", first_name="Ada"
    )


def test_health_is_public(client):
    resp = client.get("/api/v1/health/")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_user_manager_defaults_and_superuser(db):
    student = User.objects.create_user(email="s@example.com", password="x")
    assert student.role == Role.STUDENT
    assert student.is_staff is False

    admin = User.objects.create_superuser(email="boss@example.com", password="x")
    assert admin.role == Role.SUPER_ADMIN
    assert admin.is_staff and admin.is_superuser


def test_me_is_401_and_sets_csrf_cookie_when_anonymous(client):
    resp = client.get("/api/v1/auth/me/")
    assert resp.status_code == 401
    # Documented error envelope.
    assert resp.json()["error"]["code"] == "NOT_AUTHENTICATED"
    # CSRF cookie is issued even when anonymous, so the SPA can echo it later.
    assert "csrftoken" in resp.cookies


def test_login_me_logout_flow(client, student):
    login = client.post(
        "/api/v1/auth/login/",
        {"email": "ada@example.com", "password": "s3cret-pass"},
        format="json",
    )
    assert login.status_code == 200
    body = login.json()
    assert body["email"] == "ada@example.com"
    assert body["role"] == Role.STUDENT
    assert body["name"] == "Ada"

    me = client.get("/api/v1/auth/me/")
    assert me.status_code == 200
    assert me.json()["email"] == "ada@example.com"

    logout = client.post("/api/v1/auth/logout/")
    assert logout.status_code == 204

    assert client.get("/api/v1/auth/me/").status_code == 401


def test_login_rejects_bad_credentials(client, student):
    resp = client.post(
        "/api/v1/auth/login/",
        {"email": "ada@example.com", "password": "wrong"},
        format="json",
    )
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


def test_logout_requires_authentication(client):
    resp = client.post("/api/v1/auth/logout/")
    assert resp.status_code == 401


# --- Password change ---


def login_student(client):
    resp = client.post(
        "/api/v1/auth/login/",
        {"email": "ada@example.com", "password": "s3cret-pass"},
        format="json",
    )
    assert resp.status_code == 200


def test_password_change_flow(client, student):
    login_student(client)
    resp = client.post(
        "/api/v1/auth/password/change/",
        {"current_password": "s3cret-pass", "new_password": STRONG_PASSWORD},
        format="json",
    )
    assert resp.status_code == 204
    # Session is preserved after the change.
    assert client.get("/api/v1/auth/me/").status_code == 200

    student.refresh_from_db()
    assert student.check_password(STRONG_PASSWORD)


def test_password_change_rejects_wrong_current(client, student):
    login_student(client)
    resp = client.post(
        "/api/v1/auth/password/change/",
        {"current_password": "nope", "new_password": STRONG_PASSWORD},
        format="json",
    )
    assert resp.status_code == 400
    assert "current_password" in resp.json()["error"]["details"]


def test_password_change_rejects_weak_new(client, student):
    login_student(client)
    resp = client.post(
        "/api/v1/auth/password/change/",
        {"current_password": "s3cret-pass", "new_password": "12345"},
        format="json",
    )
    assert resp.status_code == 400
    assert "new_password" in resp.json()["error"]["details"]


def test_password_change_requires_authentication(client):
    resp = client.post(
        "/api/v1/auth/password/change/",
        {"current_password": "x", "new_password": STRONG_PASSWORD},
        format="json",
    )
    assert resp.status_code == 401


# --- Password reset ---


def test_password_reset_is_generic_and_emails_known_user(client, student, settings):
    settings.MAILERS = {
        "default": {"BACKEND": "django.core.mail.backends.locmem.EmailBackend"}
    }
    mail.outbox = []

    # Unknown email: still 204, no email (no enumeration).
    resp = client.post(
        "/api/v1/auth/password/reset/",
        {"email": "nobody@example.com"},
        format="json",
    )
    assert resp.status_code == 204
    assert len(mail.outbox) == 0

    # Known email: 204 and an email is sent.
    resp = client.post(
        "/api/v1/auth/password/reset/",
        {"email": "ada@example.com"},
        format="json",
    )
    assert resp.status_code == 204
    assert len(mail.outbox) == 1
    assert "ada@example.com" in mail.outbox[0].to


def test_password_reset_confirm_flow(client, student):
    uid, token = reset_link_parts(student)
    resp = client.post(
        "/api/v1/auth/password/reset/confirm/",
        {"uid": uid, "token": token, "new_password": STRONG_PASSWORD},
        format="json",
    )
    assert resp.status_code == 204
    student.refresh_from_db()
    assert student.check_password(STRONG_PASSWORD)


def test_password_reset_confirm_rejects_bad_token(client, student):
    uid, _ = reset_link_parts(student)
    resp = client.post(
        "/api/v1/auth/password/reset/confirm/",
        {"uid": uid, "token": "bad-token", "new_password": STRONG_PASSWORD},
        format="json",
    )
    assert resp.status_code == 400


def test_password_reset_confirm_rejects_weak_password(client, student):
    uid, token = reset_link_parts(student)
    resp = client.post(
        "/api/v1/auth/password/reset/confirm/",
        {"uid": uid, "token": token, "new_password": "12345"},
        format="json",
    )
    assert resp.status_code == 400
