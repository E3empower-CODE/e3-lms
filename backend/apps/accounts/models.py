from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class Role(models.TextChoices):
    """Application roles. Codes match the frontend `ROLES` (snake_case)."""

    SUPER_ADMIN = "super_admin", "Super Admin"
    ADMISSIONS = "admissions", "Admissions"
    FINANCE = "finance", "Finance Officer"
    INSTRUCTOR = "instructor", "Instructor"
    STUDENT = "student", "Student"


class UserManager(BaseUserManager):
    """User manager that uses email as the unique identifier (no username)."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", Role.STUDENT)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.SUPER_ADMIN)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user keyed by email, carrying an application role. Authorization is
    role- and object-level and enforced on every request; this model is the
    role foundation the rest of the domain builds on.
    """

    # Drop the username field; email is the login identifier.
    username = None
    email = models.EmailField("email address", unique=True)
    role = models.CharField(
        max_length=32, choices=Role.choices, default=Role.STUDENT
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        ordering = ["email"]

    def __str__(self):
        return self.email

    @property
    def name(self):
        """Display name from first/last, falling back to the email local part."""
        full = self.get_full_name().strip()
        return full or self.email.split("@")[0]
