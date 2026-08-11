# E3 Empower LMS

E3 Empower LMS is a planned learning-management platform for E3 Empower Africa Limited and the E3 Empower Institute of Technology. It connects public registration, admissions, enrollment, learning, attendance, assessment, finance, progress, and certification in one system.

> **Current status:** This repository contains the project plan and setup blueprint. The Django and React applications have not been scaffolded yet. Follow the bootstrap steps below when implementation begins.

See [PLAN.md](./PLAN.md) for scope, architecture, business rules, delivery sprints, validation, risks, and MVP exit criteria.

## Prerequisites

Install these tools before bootstrapping the project:

- Git
- Python 3.12 or newer
- Node.js 20 LTS or newer with npm
- PostgreSQL 16 or newer
- Redis 7 or newer

On Windows, Redis can be run through Docker Desktop or WSL. Docker is optional for local development but recommended for consistent PostgreSQL and Redis services.

## Planned Repository Layout

```text
e3-lms/
├── backend/       # Django REST API
├── frontend/      # React/Vite application
├── PLAN.md
└── README.md
```

## Bootstrap the Backend

Run these commands from the repository root in PowerShell:

```powershell
New-Item -ItemType Directory backend
Set-Location backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install django djangorestframework psycopg[binary] django-cors-headers django-filter drf-spectacular pillow celery redis pytest pytest-django
django-admin startproject config .
pip freeze > requirements.txt
```

Create Django apps as they are reached in the implementation plan; do not create empty apps for all future domains at once. Start with accounts, courses, admissions, and audit.

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
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Start the Celery worker when background tasks are introduced:

```powershell
Set-Location backend
.\.venv\Scripts\Activate.ps1
celery -A config worker --loglevel=INFO
```

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
.\.venv\Scripts\Activate.ps1
pytest
python manage.py check
python manage.py makemigrations --check --dry-run

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
