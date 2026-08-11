# E3 Empower LMS

E3 Empower LMS is a planned learning-management platform for E3 Empower Africa Limited and the E3 Empower Institute of Technology. It connects public registration, admissions, enrollment, learning, attendance, assessment, finance, progress, and certification in one system.

> **Current status:** Phase 1 is in progress. The React/Vite JavaScript starter is scaffolded and builds successfully. Django and the remaining frontend libraries are not installed because dependency downloads timed out; PostgreSQL and Redis are not available locally. See the current audit and task statuses in `PLAN.md` before continuing.

See [PLAN.md](./PLAN.md) for authoritative status and implementation order, [API.md](./API.md) for API conventions, [DATABASE.md](./DATABASE.md) for data boundaries, and [DEPLOYMENT.md](./DEPLOYMENT.md) for the production blueprint.

## Prerequisites

Install these tools before bootstrapping the project:

- Git
- Python 3.12 or newer (Python 3.14.6 was detected during the Phase 1 audit)
- Node.js 20 LTS or newer with npm
- PostgreSQL 16 or newer
- Redis 7 or newer

On Windows, Redis can be run through Docker Desktop or WSL. Docker is optional for local development but recommended for consistent PostgreSQL and Redis services.

## Repository Layout

```text
e3-lms/
├── backend/       # Django REST API (pending dependency installation)
├── frontend/      # React/Vite application (scaffolded)
├── PLAN.md
└── README.md
```

## Bootstrap the Backend

Install [`uv`](https://docs.astral.sh/uv/) first. The repository uses `backend/pyproject.toml` as the Python dependency source of truth and commits `backend/uv.lock`; do not use pip, Poetry, Pipenv, Conda, or a manually managed virtual environment.

From a fresh clone, run:

```powershell
Set-Location backend
uv sync
```

`uv sync` installs the pinned Python dependencies into an ignored `.venv`. There is no activation step; run backend commands through `uv run`. When dependencies change, use `uv add`/`uv remove` and commit the synchronized `pyproject.toml` and `uv.lock` together.

Create additional Django apps only when their implementation phase begins:

```powershell
uv run python manage.py startapp <app_name> apps\<app_name>
```

Create `backend/.env.example` with safe placeholders:

```dotenv
DEBUG=true
SECRET_KEY=replace-me
DB_NAME=e3_lms
DB_USER=e3_lms
DB_PASSWORD=replace-me
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
REDIS_URL=redis://localhost:6379/0
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

Copy it to `.env`, fill in local values, and never commit `.env`.

## Create the PostgreSQL Database

Using `psql` as a PostgreSQL administrator:

```sql
CREATE USER e3_lms WITH PASSWORD 'choose-a-local-password';
CREATE DATABASE e3_lms OWNER e3_lms;
```

Set the same credentials in `backend/.env`. The Django settings must read those variables before migrations are run.

## Bootstrap the Frontend

Return to the repository root, then run:

```powershell
npm create vite@latest frontend -- --template react
Set-Location frontend
npm install
npm install react-router-dom axios react-hook-form zod @hookform/resolvers lucide-react recharts
npm install -D tailwindcss vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright
```

Keep the frontend in JavaScript. Do not convert it to TypeScript.

Create `frontend/.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Copy it to `.env.local` for local development. Only variables prefixed with `VITE_` are exposed to browser code, so never put secrets in frontend environment files.

## Run the Development Stack

After the applications and settings exist, use separate terminals.

PostgreSQL and Redis must be running first. Then start the API:

```powershell
Set-Location backend
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

Start the Celery worker when background tasks are introduced:

```powershell
Set-Location backend
uv run celery -A config worker -l info
```

Celery Beat, when introduced, runs with `uv run celery -A config beat -l info`. Native Windows workers may require a compatible execution pool or running Celery through WSL/containers; select and document that operational choice before relying on it.

Start the frontend:

```powershell
Set-Location frontend
npm run dev
```

Expected local URLs:

- Frontend: `http://localhost:5173`
- Django API: `http://localhost:8000/api/v1/`
- Django admin: `http://localhost:8000/admin/`
- API schema/docs: configure through `drf-spectacular` during Sprint 1

## Test and Quality Commands

Once configured, the standard checks should be:

```powershell
# Backend
Set-Location backend
uv sync
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run python manage.py check
uv run python manage.py makemigrations --check --dry-run

# Frontend
Set-Location ..\frontend
npm test
npm run build
npx playwright test
```

Add lint and formatting scripts during Sprint 1 and run them before every commit.

## Implementation Order

1. Foundation, environment, authentication, roles, and application shells.
2. Courses, public registration, and admissions—the first usable release.
3. Students, classes, and enrollment.
4. Learning content and the student portal.
5. Assignments, assessments, attendance, and progress.
6. Payments, receipts, balances, and finance reports.
7. Certificates, notifications, reports, and production hardening.

Each stage should remain runnable and pass its demo checklist in [PLAN.md](./PLAN.md).

## Production Shape

The intended production stack is:

```text
Browser → Nginx → React static files / Django REST API → PostgreSQL
                                      ↓
                                Redis + Celery
```

Production deployment must use HTTPS, secure cookies where applicable, restricted hosts/origins, persistent media storage, database backups, worker monitoring, and environment-managed secrets. Create a dedicated `DEPLOYMENT.md` once the hosting platform is selected.

## Documentation Roadmap

As implementation progresses, add:

- `API.md` for API conventions and integration examples
- `DATABASE.md` for the schema and data lifecycle
- `DEPLOYMENT.md` for environment-specific deployment and rollback

Do not commit `.env`, credentials, tokens, local databases, uploaded personal data, virtual environments, `node_modules`, build output, or test artifacts.
