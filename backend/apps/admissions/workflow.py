"""
Application status workflow. The allowed transitions mirror the frontend's
status model; the server is authoritative and records an audit event for every
change. `reject` and `cancel` require a reason.
"""

from django.db import transaction

from .models import ApplicationActivity, ApplicationStatus

S = ApplicationStatus

# action -> target status
ACTIONS = {
    "review": S.UNDER_REVIEW,
    "approve": S.APPROVED,
    "waitlist": S.WAITLISTED,
    "reject": S.REJECTED,
    "cancel": S.CANCELLED,
}

REASON_REQUIRED = {"reject", "cancel"}

# current status -> allowed actions
ALLOWED = {
    S.PENDING: {"review", "approve", "waitlist", "reject", "cancel"},
    S.UNDER_REVIEW: {"approve", "waitlist", "reject", "cancel"},
    S.WAITLISTED: {"approve", "reject", "cancel"},
    S.APPROVED: {"cancel"},
    S.REJECTED: set(),
    S.CANCELLED: set(),
}


class TransitionError(Exception):
    """Raised when a transition is not allowed from the current status."""


@transaction.atomic
def apply_transition(application, action, *, actor, reason=""):
    """Move an application to a new status, validating the matrix and logging
    the change. Returns the updated application."""
    if action not in ACTIONS:
        raise TransitionError(f"Unknown action '{action}'.")
    if action not in ALLOWED.get(application.status, set()):
        raise TransitionError(
            f"Cannot '{action}' an application that is {application.status}."
        )

    previous = application.status
    application.status = ACTIONS[action]
    application.save(update_fields=["status", "updated_at"])

    label = ACTIONS[action].label
    description = f"{previous} → {application.status}"
    if reason:
        description = f"{description} — {reason}"
    ApplicationActivity.objects.create(
        application=application,
        actor=actor,
        action=action,
        description=f"{label}: {description}",
    )
    return application
