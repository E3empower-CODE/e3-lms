from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.authentication import SessionAuthentication


class CookieSessionAuthentication(SessionAuthentication):
    """
    Cookie-session auth that advertises an auth header, so DRF returns 401 for
    anonymous requests instead of downgrading to 403. This lets the SPA reliably
    distinguish unauthenticated (401 → sign in) from unauthorized (403).

    CSRF is still enforced for session-authenticated, state-changing requests.
    """

    def authenticate_header(self, request):
        return "Session"


class CookieSessionScheme(OpenApiAuthenticationExtension):
    """Document the session cookie in the generated OpenAPI schema."""

    target_class = "common.authentication.CookieSessionAuthentication"
    name = "cookieAuth"

    def get_security_definition(self, auto_schema):
        return {"type": "apiKey", "in": "cookie", "name": "sessionid"}
