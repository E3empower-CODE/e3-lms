# E3 Empower LMS API Contract

**Status:** Foundation contract; endpoints are not implemented yet.  
**Base path:** `/api/v1/`  
**Media type:** `application/json`, except documented multipart upload endpoints.

## Conventions

- Resource URLs use plural nouns and trailing slashes.
- JSON fields and query parameters use `snake_case`, matching Django REST Framework conventions.
- Dates use `YYYY-MM-DD`; timestamps use ISO 8601 in UTC and include an offset.
- Identifiers are opaque to clients. Server-generated application, student, receipt, and certificate numbers are display identifiers, not authorization boundaries.
- Clients use `PATCH` for partial updates. Workflow transitions use explicit subresource actions because they enforce domain rules and produce audit events.
- Collection results are paginated and deterministically ordered.

## Authentication and CSRF

The default design uses Django-backed authentication in secure, HTTP-only cookies. Browser JavaScript must not persist credentials in `localStorage` or `sessionStorage`.

- State-changing requests require the CSRF token expected by Django.
- Axios sends credentials only to the configured API origin.
- `401 Unauthorized` means no valid authentication is present.
- `403 Forbidden` means the authenticated actor lacks permission.
- Login, reset, and public registration endpoints have dedicated throttles.

The exact login/logout/current-user paths will be finalized with Phase 1 tests and documented before implementation.

## Success Shapes

Single resources return their serialized resource directly:

```json
{
  "id": 42,
  "name": "Python 3 Beginner",
  "active": true
}
```

Collections use this envelope:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  }
}
```

Default page size is 20. The server will cap `page_size`; the final maximum is set during Phase 1 performance/security review.

## Error Shape

Every handled API error uses one envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": {
      "email": ["Enter a valid email address."]
    },
    "request_id": "opaque-correlation-id"
  }
}
```

`details` is optional and contains safe, field-oriented recovery information. Production responses never expose exception types, stack traces, SQL, settings, private paths, credentials, or tokens.

| Status | Meaning |
| --- | --- |
| `400` | Malformed request or invalid query parameters |
| `401` | Authentication required or expired |
| `403` | Authenticated but not authorized |
| `404` | Resource unavailable to this actor |
| `409` | Duplicate, invalid state transition, or concurrency conflict |
| `415` | Unsupported content or upload media type |
| `422` | Semantically invalid submitted fields |
| `429` | Request throttle exceeded |
| `500` | Safe generic server failure |

## Filtering and Ordering

List endpoints document their allowlisted filters. General conventions:

```text
?page=1&page_size=20
?search=python
?ordering=-created_at,name
?active=true
```

Unknown filters are rejected or ignored consistently according to the Phase 1 implementation decision; clients must not rely on database-default ordering.

## Planned Resource Areas

```text
/api/v1/auth/
/api/v1/health/
/api/v1/applications/
/api/v1/students/
/api/v1/guardians/
/api/v1/course-categories/
/api/v1/courses/
/api/v1/intakes/
/api/v1/classes/
/api/v1/enrollments/
/api/v1/modules/
/api/v1/lessons/
/api/v1/assignments/
/api/v1/assessments/
/api/v1/attendance/
/api/v1/payments/
/api/v1/certificates/
/api/v1/reports/
```

Only endpoints implemented and covered by the OpenAPI schema are considered available. Later resources must add request, response, filter, permission, and error examples here before frontend integration.

## Contract Quality Gate

- Every endpoint has explicit request and response serializers.
- Every collection is paginated, filtered through an allowlist, and deterministically ordered.
- Every protected endpoint has role and object-level permission tests.
- External input is validated at the serializer/parser boundary.
- The generated OpenAPI schema matches integration tests and frontend usage.
