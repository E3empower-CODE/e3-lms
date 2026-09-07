import pytest
from accounts.models import Role
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


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
