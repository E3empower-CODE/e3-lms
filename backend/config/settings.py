"""
Django settings for the E3 Empower LMS API.

Values are read from the environment with development-safe defaults (see
`.env.example`). Secrets and per-environment values must come from the
environment in shared and production deployments.
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# App packages live under backend/apps/ and are imported by their short label
# (e.g. "accounts"), so put that directory on the import path.
sys.path.insert(0, str(BASE_DIR / "apps"))


def env(name, default=None):
    return os.environ.get(name, default)


def env_bool(name, default=False):
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name, default=""):
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# --- Core ---

SECRET_KEY = env(
    "SECRET_KEY",
    "django-insecure-dev-only-*cnh9rci6a970-do-not-use-in-production",
)

DEBUG = env_bool("DEBUG", True)

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")


# --- Applications ---

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    # Local
    "accounts",
    "catalog",
    "admissions",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


# --- Database ---
# PostgreSQL when DB_NAME is provided; SQLite otherwise (local/dev, tests).

if env("DB_NAME"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("DB_NAME"),
            "USER": env("DB_USER", ""),
            "PASSWORD": env("DB_PASSWORD", ""),
            "HOST": env("DB_HOST", "localhost"),
            "PORT": env("DB_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }


# --- Authentication ---

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# --- REST framework ---
# Cookie-session auth, authenticated-by-default, and the documented response
# envelopes (collection pagination + error shape).

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "common.authentication.CookieSessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PAGINATION_CLASS": "common.pagination.EnvelopePagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "EXCEPTION_HANDLER": "common.exceptions.envelope_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_RATES": {
        # Public registration submissions (scoped throttle on the view).
        "registration": env("REGISTRATION_THROTTLE_RATE", "30/hour"),
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "E3 Empower LMS API",
    "DESCRIPTION": "Learning-management API for E3 Empower.",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
}


# --- CORS / CSRF / cookies ---
# The SPA sends cookies cross-origin, so credentials are allowed for the
# configured frontend origin only. The CSRF cookie is readable by JS (so the
# SPA can echo it); the session cookie stays HttpOnly.

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "http://localhost:5173")

# Public SPA base URL, used to build links in emails (e.g. password reset).
FRONTEND_URL = env("FRONTEND_URL", "http://localhost:5173")

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = env("SESSION_COOKIE_SAMESITE", "Lax")
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = env("CSRF_COOKIE_SAMESITE", "Lax")

# Enable secure cookies + HTTPS assumptions in production (set behind TLS).
SESSION_COOKIE_SECURE = env_bool("SESSION_COOKIE_SECURE", False)
CSRF_COOKIE_SECURE = env_bool("CSRF_COOKIE_SECURE", False)


# --- Internationalization ---

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Institution display timezone (frontend formats to this).
INSTITUTION_TIME_ZONE = env("INSTITUTION_TIME_ZONE", "Africa/Lagos")


# --- Static files ---

STATIC_URL = "static/"

# Uploaded media (passport photos, documents). Access controls and content
# validation are enforced at the API boundary in later phases.
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --- Email ---
# Django 6.1+ uses MAILERS (EMAIL_BACKEND is deprecated).

MAILERS = {
    "default": {
        "BACKEND": env(
            "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
        ),
    },
}

DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "no-reply@e3empower.local")
