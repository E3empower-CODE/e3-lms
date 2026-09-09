from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def send_password_reset_email(user):
    """
    Email the user a link to the SPA's reset page, carrying the uid + token the
    confirm endpoint expects. Uses the configured mailer (console in dev).
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    send_mail(
        subject="Reset your E3 Empower LMS password",
        message=(
            "We received a request to reset your password.\n\n"
            f"Use this link to choose a new one:\n{reset_url}\n\n"
            "If you didn't request this, you can ignore this email."
        ),
        from_email=None,
        recipient_list=[user.email],
    )
