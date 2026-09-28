import uuid

from rest_framework.response import Response
from rest_framework.views import exception_handler

# Map HTTP status to the API error `code` (see API.md — Error Shape).
CODE_BY_STATUS = {
    400: "VALIDATION_ERROR",
    401: "NOT_AUTHENTICATED",
    403: "PERMISSION_DENIED",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    406: "NOT_ACCEPTABLE",
    409: "CONFLICT",
    415: "UNSUPPORTED_MEDIA_TYPE",
    422: "UNPROCESSABLE_ENTITY",
    429: "THROTTLED",
    500: "SERVER_ERROR",
}

GENERIC_VALIDATION_MESSAGE = "The submitted data is invalid."


def error_response(status, code, message, *, details=None, request=None):
    """Build a Response in the documented error envelope for cases a view needs
    to shape directly (e.g. a domain-specific 409 code the generic handler's
    status→code map would otherwise flatten)."""
    request_id = getattr(request, "request_id", "") or uuid.uuid4().hex
    return Response(
        {
            "error": {
                "code": code,
                "message": message,
                "details": details,
                "request_id": request_id,
            }
        },
        status=status,
    )


def envelope_exception_handler(exc, context):
    """
    Wrap DRF-handled errors in the documented envelope:

        { "error": { "code", "message", "details?", "request_id" } }

    Field-level validation errors are exposed under `details`; unexpected
    (non-DRF) exceptions fall through to Django's handler and are not shaped
    here.
    """
    response = exception_handler(exc, context)
    if response is None:
        return None

    request = context.get("request")
    request_id = getattr(request, "request_id", "") or uuid.uuid4().hex
    status = response.status_code
    code = getattr(exc, "default_code", None)
    code = CODE_BY_STATUS.get(status, (code or "error").upper())

    data = response.data
    details = None
    if isinstance(data, dict) and set(data.keys()) == {"detail"}:
        message = str(data["detail"])
    elif isinstance(data, dict):
        message = GENERIC_VALIDATION_MESSAGE
        details = data
    elif isinstance(data, list):
        message = GENERIC_VALIDATION_MESSAGE
        details = {"non_field_errors": [str(item) for item in data]}
    else:
        message = str(data)

    response.data = {
        "error": {
            "code": code,
            "message": message,
            "details": details,
            "request_id": request_id,
        }
    }
    return response
