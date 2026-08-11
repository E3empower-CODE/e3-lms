# E3 Empower LMS Deployment

**Status:** Production architecture blueprint; hosting provider is not selected.

## Intended Architecture

```text
Browser
  → HTTPS / Nginx
      ├→ React static build
      └→ Gunicorn → Django REST API → PostgreSQL
                         ↓
                       Redis
                         ↓
                       Celery
```

## Environments

- **Local:** developer-run Django/Vite with local or containerized PostgreSQL and Redis.
- **Test/CI:** isolated database, deterministic settings, no external messages, and reproducible frozen dependencies.
- **Staging:** production-like services and sanitized data.
- **Production:** versioned immutable artifacts, managed secrets, HTTPS, persistent media, backups, monitoring, and controlled rollout.

## Required Configuration

Backend secrets and environment-specific values include:

```dotenv
DEBUG=false
SECRET_KEY=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
ALLOWED_HOSTS=
CORS_ALLOWED_ORIGINS=
CSRF_TRUSTED_ORIGINS=
REDIS_URL=
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

Frontend builds receive only public configuration such as `VITE_API_BASE_URL`. Secrets never enter Vite variables or built JavaScript.

## Production Security Baseline

- Redirect HTTP to HTTPS and enable HSTS after the domain is confirmed.
- Use secure, HTTP-only, appropriately `SameSite` authentication cookies.
- Restrict allowed hosts, CORS origins, CSRF trusted origins, and proxy headers explicitly.
- Serve user uploads from non-executable storage with authorization where records are private.
- Run Django with `DEBUG=false`; return generic errors and retain safe correlation IDs.
- Use least-privilege database and service credentials with rotation procedures.
- Apply request/body/upload limits at both Nginx and Django boundaries.

## Release Procedure

1. Build versioned backend and frontend artifacts from a reviewed commit.
2. Run backend tests/checks/migrations, frontend tests/build, dependency audits, and critical Playwright flows.
3. Back up PostgreSQL and verify migration compatibility.
4. Deploy to staging and run smoke, security-header, worker, media, and readiness checks.
5. Apply migrations with the documented compatibility window.
6. Roll out application instances, then Celery workers if task contracts changed.
7. Verify health, authentication, registration, logs, queues, and key metrics.

## Backup and Recovery

- Schedule encrypted PostgreSQL backups with retention appropriate to institutional policy.
- Store backups separately from the primary database credentials and failure domain.
- Back up or replicate private media consistently with database records.
- Rehearse restoration into a clean environment and record recovery time/result.
- Never claim backups are working based only on job success; restoration is the proof.

## Rollback

- Retain the previous known-good application artifacts.
- Roll back application instances when schema compatibility allows.
- Prefer a tested forward-fix over reversing a migration that would destroy new data.
- Pause incompatible Celery workers/tasks during deployment and make tasks idempotent.
- Document the exact rollback command set after a hosting platform is selected.

## Open Deployment Decisions

- Hosting provider and region
- Production domain and institution timezone
- PostgreSQL/Redis management model
- Object storage and private-media delivery
- Email/SMS/WhatsApp providers
- Monitoring, alerting, and incident ownership
- Recovery-point and recovery-time objectives
