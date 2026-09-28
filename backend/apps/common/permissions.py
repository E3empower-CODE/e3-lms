from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    """Grant access to authenticated users whose role is in `allowed_roles`.

    Subclass and set `allowed_roles`. Authorization is always enforced here on
    the server; the frontend only hides actions it can't perform.
    """

    allowed_roles = ()

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role in self.allowed_roles
        )


class IsAdmissionsStaff(HasRole):
    """Admissions officers and super admins."""

    allowed_roles = ("super_admin", "admissions")
