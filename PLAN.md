# E3 Empower LMS â€” Development Plan

**Generated:** 2026-08-11
**Estimated complexity:** High
**Status:** [~] Phase 1 in progress

## Status Legend

- `[ ]` Not Started
- `[~]` In Progress
- `[x]` Completed and verified
- `[!]` Blocked

## Current Project Audit â€” 2026-08-11

### What exists

- [x] Root planning document: `PLAN.md`.
- [x] Root setup blueprint: `README.md`.
- [x] Git repository on `main` with local tooling metadata in `.agents/`, `.claude/`, and `skills-lock.json`.
- [x] Node.js `v24.18.0` is installed.

### What is missing

- [x] `backend/` and `frontend/` application foundations now exist.
- [x] Django and React scaffold source files now exist.
- [x] `backend/pyproject.toml`, `backend/uv.lock`, `frontend/package.json`, and `frontend/package-lock.json` exist; no `requirements.txt` is used.
- [~] Django settings and a baseline backend test now exist; environment templates, PostgreSQL configuration, application migrations, authentication, registration form, and application UI/tests remain pending.
- [x] `API.md`, `DATABASE.md`, and `DEPLOYMENT.md` exist.
- [x] Python 3.14.6 is available outside the restricted shell and is officially compatible with Django 6.0.
- [!] PostgreSQL and Redis command-line services are not currently installed or available on `PATH`.
- [~] npm is available through `npm.cmd`; the PowerShell `npm.ps1` shim is blocked by the local execution policy.

### Reuse, refactoring, and conflicts

- [x] Reuse the business rules, stack, palette, risks, and MVP definition already captured below.
- [x] Keep the public registration form inside the React application and admissions domain; no separate registration application will be created.
- [x] Replace the previous coarse ten-sprint execution model with the status-driven 18-phase roadmap below. The old sprint grouping remains useful as release-level context, not execution status.
- [x] No existing application code requires refactoring.
- [!] PostgreSQL and Redis cannot be run or verified until those local prerequisites are installed or supplied through containers.
- [x] The earlier pip-created ignored environment was migrated to `uv`; `pyproject.toml` and `uv.lock` now contain the complete requested backend dependency set.

## Recorded Architecture Decisions

- [x] Standardize all backend Python setup and commands on `uv`; do not mix pip, Poetry, Pipenv, Conda, or manually managed virtual environments.
- [x] Keep `backend/pyproject.toml` and `backend/uv.lock` authoritative and synchronized; generate `requirements.txt` only for a documented compatibility need.
- [x] Use Djangoâ€™s custom user model before the first application migration.
- [x] Use cookie-based authentication with HTTP-only cookies and CSRF protection by default; do not store authentication tokens in browser storage. Revisit only if deployment constraints require a separate-token design.
- [x] Use PostgreSQL in all shared and production environments. A temporary SQLite test fallback is permitted only for isolated bootstrap tests and must not become deployment configuration.
- [x] Use plural, versioned REST resources under `/api/v1/`, page-number pagination, `django-filter`, stable ordering, and one structured error envelope.
- [x] Use snake_case JSON fields to match DRF conventions consistently across backend and JavaScript clients.
- [x] Build vertical, testable slices and create Django apps only when their phase begins.
- [x] Design mobile-first with semantic tokens, 44px minimum touch targets, accessible state labels, and the E3 green institutional visual system.

## Execution Roadmap

Each checkbox is authoritative. A task becomes `[x]` only when its implementation exists and its stated tests pass.

### Phase 1 â€” Project Foundation

**Status:** [~] In Progress
**Goal:** Establish a runnable, secure Django/React foundation with identity, API conventions, and test harnesses.
**Scope:** Project scaffolding, configuration, custom user, authentication contract, base layouts, health checks, documentation, and baseline tests.
**Dependencies:** Python 3.12+, Node/npm, PostgreSQL, and Redis.

**Backend tasks**

- [x] Use `uv` 0.12.0, declare Python `>=3.12`, pin this checkout to Python 3.14, initialize `backend/`, and lock runtime plus development dependencies.
- [x] Scaffold Django `config` and `apps/accounts` through `uv run`; the initial Django system check passes.
- [ ] Configure DRF, django-filter, drf-spectacular, CORS, Celery, Redis, logging, and environment loading.
- [ ] Create the custom `User` model with role choices before the first application migration.
- [ ] Add reusable role and object-permission foundations.
- [ ] Add cookie login, logout, session/current-user, password-change, and password-reset foundations.
- [ ] Add `/api/v1/health/` and safe global API exception handling.

**Frontend tasks**

- [x] Scaffold a Vite React application using JavaScript only; `npm.cmd run build` passes with Vite 8.2.1.
- [!] Install the remaining specified frontend dependencies; two script-disabled install attempts timed out before changing `package.json`.
- [ ] Configure Tailwind tokens, routing, Axios with CSRF support, and auth context.
- [ ] Build `PublicLayout`, `AdminLayout`, `StudentLayout`, and `InstructorLayout` with protected-route behavior.
- [ ] Build accessible Button, Field, Badge, Alert, Dialog, Toast, and responsive data-view foundations only as first consumers require them.

**Database tasks**

- [!] Configure PostgreSQL connection and run initial migrations; blocked by unavailable PostgreSQL and the incomplete Django dependency installation.
- [ ] Add database health verification and document local/container startup.

**API tasks**

- [x] Record foundation contracts in `API.md`, including pagination, filters, ordering, error envelope, and authentication/CSRF behavior.
- [ ] Publish OpenAPI schema and interactive documentation.

**Security tasks**

- [~] Add secret/build exclusions in `.gitignore`; safe `.env.example` files and runtime security settings await backend/frontend configuration.
- [ ] Define DRF throttles for anonymous, authenticated, and login traffic without relying on throttling as brute-force protection alone.
- [ ] Verify responses and logs do not disclose secrets, credentials, tokens, PII, or stack traces.

**Testing tasks**

- [ ] Write failing backend tests for health, current-user/authentication, role permission behavior, and safe errors before implementation.
- [ ] Write frontend route/rendering tests before protected-layout implementation.
- [~] Frontend production build/starter lint and backend foundation checks pass; application migrations and frontend tests await implementation.
- [x] Run `uv lock --check`, frozen `uv sync`, Ruff lint/format checks, Django system check, and pytest as the backend foundation gate; all pass on 2026-08-11.
- [ ] Use browser testing for public and protected routes after both servers run.

**Acceptance criteria**

- [ ] A fresh setup follows `README.md` without undocumented steps.
- [ ] Backend and frontend start cleanly; PostgreSQL and Redis connectivity are observable.
- [ ] Health and OpenAPI endpoints work; authenticated and unauthorized responses match `API.md`.
- [ ] Each role reaches only its allowed shell, and protected APIs enforce authorization server-side.
- [ ] All Phase 1 tests and builds pass with no console errors or exposed secrets.

### Phase 2 â€” Course Catalog

**Status:** [ ] Not Started
**Goal:** Deliver an administrable, API-backed catalog before registration.
**Scope:** Categories, courses, seed data, read APIs, admin management, filters, and deactivation.
**Dependencies:** Phase 1.

- **Backend:** [ ] Add category/course models, serializers, services where needed, viewsets, admin, and deactivation rules.
- **Frontend:** [ ] Add catalog services and responsive admin list/create/edit experiences with loading, empty, error, and confirmation states.
- **Database:** [ ] Add unique slugs/codes, fee constraints, indexes, timestamps, and repeatable E3 seed data.
- **API:** [ ] Implement paginated `/course-categories/` and `/courses/` resources with category, active, search, and ordering filters.
- **Security:** [ ] Make public reads field-limited and writes admin-only; audit price and activation changes.
- **Testing:** [ ] Test constraints, permissions, filters, pagination, no-hard-delete behavior, UI states, and API contracts.
- **Acceptance:** [ ] Admins manage courses, public users retrieve active catalog data, and React contains no hard-coded courses or fees.

### Phase 3 â€” Public Registration

**Status:** [ ] Not Started
**Goal:** Accept complete public applications through an accessible multi-step flow.
**Scope:** Applicants, education, guardian, emergency contact, course/schedule selections, declarations, fee snapshots, and confirmation.
**Dependencies:** Phases 1â€“2.

- **Backend:** [ ] Add Applicant, Guardian, EmergencyContact, Application, RegistrationCourse, RegistrationTrainingDay, and TrainingSession with a transactional submission service.
- **Frontend:** [ ] Build `/register` steps, persisted-in-memory draft state, conditional guardian/training fields, review, declaration, submission, and confirmation.
- **Database:** [ ] Add unique application numbers, status constraints, fee snapshots, session seed data, indexes, and relational constraints.
- **API:** [ ] Add public catalog/session reads and one idempotent multipart registration endpoint with explicit request/response schemas.
- **Security:** [ ] Recalculate age/fees server-side; throttle submissions; validate upload content, size, name, and storage; minimize PII exposure.
- **Testing:** [ ] Cover adult/minor rules, tampered fees, transactions, numbering concurrency, duplicates, uploads, all form steps, accessibility, responsive layouts, and submission E2E.
- **Acceptance:** [ ] An unauthenticated applicant submits multiple courses and receives one unique number while every related record and historical fee is correct.

### Phase 4 â€” Admissions Dashboard

**Status:** [ ] Not Started
**Goal:** Let authorized staff review and transition applications safely.
**Scope:** Dashboard metrics, navigation, registration list, application detail, notes, print, and status workflow.
**Dependencies:** Phase 3.

- **Backend:** [ ] Add transition services, review metadata, admin notes, metrics queries, and audit events.
- **Frontend:** [ ] Build responsive admin navigation, dashboard, filterable list, mobile cards, details tabs, confirmations, and print view.
- **Database:** [ ] Index statuses, dates, courses, and reviewer fields; persist immutable activity history.
- **API:** [ ] Add paginated/filterable applications, detail, metrics, and explicit transition actions with stable errors.
- **Security:** [ ] Enforce admissions permissions and allowed transitions on the server; protect photos and PII.
- **Testing:** [ ] Test transition matrix, filters, permissions, metrics, responsive navigation, dialogs, and admin review E2E.
- **Acceptance:** [ ] Admissions staff can find, review, and transition an application while unauthorized roles cannot read or mutate it.

### Phase 5 â€” Student Creation

**Status:** [ ] Not Started
**Goal:** Convert approved applications into unique student identities without losing history.
**Scope:** Student profile, account activation, identifier generation, duplicate review, and audit.
**Dependencies:** Phase 4.

- **Backend:** [ ] Implement `convert_application_to_student(application, actor)` as an idempotent transactional service.
- **Frontend:** [ ] Add conversion confirmation, conflict resolution, success state, and student profile link.
- **Database:** [ ] Add Student, unique student number, one-to-one application link, optional user link, and collision constraints.
- **API:** [ ] Add conversion action and student detail contract with conflict responses.
- **Security:** [ ] Restrict conversion, avoid reusable default passwords, and redact sensitive identity fields by role.
- **Testing:** [ ] Test approval prerequisite, concurrent conversion, duplicates, rollback, activation, permissions, and audit.
- **Acceptance:** [ ] Repeating or racing conversion produces one student and one audit-backed outcome.

### Phase 6 â€” Intakes, Classes, and Enrollments

**Status:** [ ] Not Started
**Goal:** Schedule course delivery and connect students to classes.
**Scope:** Intake, Class, Enrollment, capacity, instructor assignment, and lifecycle states.
**Dependencies:** Phases 2 and 5.

- **Backend:** [ ] Add models and services for valid class/enrollment transitions and capacity-safe enrollment.
- **Frontend:** [ ] Build intake/class/enrollment admin views and student placement workflows.
- **Database:** [ ] Add date/capacity checks, uniqueness, status constraints, and query indexes.
- **API:** [ ] Add paginated/filterable resources and explicit enrollment transition actions.
- **Security:** [ ] Restrict assignment and enrollment mutations; prevent IDOR across students/classes.
- **Testing:** [ ] Test capacity races, duplicate enrollment, dates, transitions, filters, and permissions.
- **Acceptance:** [ ] An approved student can be enrolled in a specific scheduled class without placing class data on Course.

### Phase 7 â€” Core Learning

**Status:** [ ] Not Started
**Goal:** Let instructors structure and publish enrolled-course content.
**Scope:** Modules, lessons, resources, ordering, publication, and digital library foundations.
**Dependencies:** Phase 6.

- **Backend:** [ ] Add CourseModule, Lesson, LearningResource, ordering, publishing, and access services.
- **Frontend:** [ ] Build instructor authoring and student lesson/resource experiences.
- **Database:** [ ] Add ordering uniqueness, publish indexes, and validated file metadata.
- **API:** [ ] Add nested/filterable content reads and instructor CRUD contracts.
- **Security:** [ ] Enforce assigned-instructor writes and enrolled-student reads; validate every upload and external URL.
- **Testing:** [ ] Test ordering, publication visibility, ownership, uploads, UI states, and enrolled access.
- **Acceptance:** [ ] An assigned instructor publishes a lesson that only eligible students can consume.

### Phase 8 â€” Student Portal

**Status:** [ ] Not Started
**Goal:** Give students a clear, private home for their learning lifecycle.
**Scope:** Dashboard, courses, lessons, assignments, assessments, attendance, results, payments, certificates, and profile navigation.
**Dependencies:** Phase 7, with later modules progressively enabled.

- **Backend:** [ ] Add student-scoped summary/read services.
- **Frontend:** [ ] Build mobile-first student shell, dashboard, course page, progress states, and module placeholders that become active by phase.
- **Database:** [ ] Add only measured summary indexes; avoid duplicate dashboard storage.
- **API:** [ ] Add `/me`-scoped resources so clients never choose arbitrary student IDs.
- **Security:** [ ] Enforce self-only access and prevent cross-student data exposure.
- **Testing:** [ ] Test route guards, ownership, empty/loading/error states, keyboard navigation, and target widths.
- **Acceptance:** [ ] A student sees only their own current courses and available lifecycle information on mobile and desktop.

### Phase 9 â€” Instructor Portal

**Status:** [ ] Not Started
**Goal:** Give instructors operational control over assigned classes only.
**Scope:** Dashboard, classes, rosters, lessons, attendance, coursework, results, and progress links.
**Dependencies:** Phases 6â€“8.

- **Backend:** [ ] Add instructor-scoped queries and reusable assignment permissions.
- **Frontend:** [ ] Build responsive instructor shell, daily overview, class list, roster, and pending-work states.
- **Database:** [ ] Index instructor/class/status/date query paths.
- **API:** [ ] Add instructor summary and assigned-class contracts.
- **Security:** [ ] Enforce object-level class ownership with explicit higher-admin overrides.
- **Testing:** [ ] Test assigned/unassigned access, dashboard queries, route guards, accessibility, and responsiveness.
- **Acceptance:** [ ] Instructors can operate assigned classes and receive `403` for unassigned mutations.

### Phase 10 â€” Attendance

**Status:** [ ] Not Started
**Goal:** Record accurate class attendance and derive attendance percentages.
**Scope:** Attendance sessions, roster entry, amendments, calculations, and audit.
**Dependencies:** Phases 6 and 9.

- **Backend:** [ ] Add session/record services, bulk roster validation, calculation, and change auditing.
- **Frontend:** [ ] Build touch-friendly class/date roster, bulk actions, save feedback, and history views.
- **Database:** [ ] Enforce unique student/session records and indexed class/date lookups.
- **API:** [ ] Add roster reads, idempotent bulk writes, history, and summary contracts.
- **Security:** [ ] Restrict writes to assigned instructors/admins and validate enrollment membership.
- **Testing:** [ ] Test duplicates, amendments, percentages, permissions, concurrency, and mobile roster behavior.
- **Acceptance:** [ ] An instructor records one complete roster and students see accurate self-only history.

### Phase 11 â€” Assignments

**Status:** [ ] Not Started
**Goal:** Publish, submit, and grade class assignments.
**Scope:** Assignment lifecycle, attachments, submissions, feedback, grading, and overdue states.
**Dependencies:** Phases 6â€“9.

- **Backend:** [ ] Add Assignment, AssignmentSubmission, publishing, submission, and grading services.
- **Frontend:** [ ] Build instructor authoring/grading and student submission/status experiences.
- **Database:** [ ] Add one-submission policy or version model, score checks, and due-date indexes.
- **API:** [ ] Add role-specific assignment/submission contracts and multipart upload behavior.
- **Security:** [ ] Enforce enrollment/assignment ownership, upload controls, and audited grade changes.
- **Testing:** [ ] Test due dates, enrollment, resubmission policy, scores, permissions, uploads, and E2E grading.
- **Acceptance:** [ ] An enrolled student submits and an assigned instructor grades with a preserved audit trail.

### Phase 12 â€” Assessments

**Status:** [ ] Not Started
**Goal:** Deliver secure quizzes, tests, and exams with backend grading.
**Scope:** Questions, choices, attempts, answers, automatic/manual grading, limits, and results.
**Dependencies:** Phases 6â€“9.

- **Backend:** [ ] Add assessment models and services for attempt lifecycle, scoring, pass/fail, and manual grading.
- **Frontend:** [ ] Build accessible authoring, taking, autosave/recovery, submission, and results experiences.
- **Database:** [ ] Constrain attempt numbers, choices, scores, and unique answer relations.
- **API:** [ ] Separate authoring payloads from student-safe payloads that never expose answers.
- **Security:** [ ] Enforce availability, enrollment, attempt limits, server time, and answer redaction.
- **Testing:** [ ] Test every question type, scoring boundaries, limits, permissions, answer leakage, and submission recovery.
- **Acceptance:** [ ] Students complete allowed attempts without receiving protected answers, and results are server-authoritative.

### Phase 13 â€” Progress

**Status:** [ ] Not Started
**Goal:** Calculate explainable course progress from verified learning activity.
**Scope:** Lesson completion, assignment/assessment contribution, attendance contribution, recalculation, and display.
**Dependencies:** Phases 7 and 10â€“12.

- **Backend:** [ ] Add a deterministic progress service with configurable weights and recalculation events.
- **Frontend:** [ ] Show overall progress and its lesson, assignment, score, and attendance components.
- **Database:** [ ] Store source events; cache derived progress only with clear invalidation/version rules.
- **API:** [ ] Add read-only self/instructor/admin summaries and explainable components.
- **Security:** [ ] Deny student-written progress and enforce role/object scope.
- **Testing:** [ ] Test formulas, missing data, rounding, recalculation, permissions, and visual clarity.
- **Acceptance:** [ ] Known fixtures produce exact percentages and students cannot alter any source or total outside allowed actions.

### Phase 14 â€” Payments

**Status:** [ ] Not Started
**Goal:** Record audit-safe payments and authoritative balances.
**Scope:** Payments, methods, receipts, allocations, balances, statuses, void/reversal flow, and finance UI.
**Dependencies:** Phases 3, 5, and 6.

- **Backend:** [ ] Add payment/allocation services, unique receipts, status calculation, and reversal workflow.
- **Frontend:** [ ] Build finance entry, receipt, balance, history, filters, and corrective-action experiences.
- **Database:** [ ] Use decimal money constraints, immutable originals, reversal links, unique references where applicable, and indexes.
- **API:** [ ] Add finance-only writes and scoped student/admin reads with server-calculated totals.
- **Security:** [ ] Enforce finance permissions, idempotency, audit, PII minimization, and no silent deletion.
- **Testing:** [ ] Test partial/full/overpayment policy, duplicate references, reversals, concurrent writes, permissions, and tampering.
- **Acceptance:** [ ] Fee snapshot minus valid allocations always equals displayed balance across API and UI.

### Phase 15 â€” Certificates

**Status:** [ ] Not Started
**Goal:** Issue one verifiable certificate for each eligible completed enrollment.
**Scope:** Eligibility, issuance, numbering, record access, and later PDF generation.
**Dependencies:** Phases 6 and 13.

- **Backend:** [ ] Add certificate eligibility and idempotent issuance service.
- **Frontend:** [ ] Add admin issuance and student certificate views/download states.
- **Database:** [ ] Add unique certificate number and enrollment constraint.
- **API:** [ ] Add issuance action and role-scoped certificate reads.
- **Security:** [ ] Restrict issuance, protect private details, and design non-sequential public verification tokens if verification is added.
- **Testing:** [ ] Test eligibility, duplicates, concurrency, permissions, audit, and rendering.
- **Acceptance:** [ ] Only eligible enrollments receive one unique, auditable certificate.

### Phase 16 â€” Notifications

**Status:** [ ] Not Started
**Goal:** Deliver reliable in-app lifecycle notifications with extensible asynchronous channels.
**Scope:** Notification records, preferences, templates, Celery delivery, retries, and future adapters.
**Dependencies:** Phase 1 and relevant domain events.

- **Backend:** [ ] Add notification/outbox services, Celery tasks, retries, and delivery state.
- **Frontend:** [ ] Add notification center, unread state, preferences, and accessible announcements.
- **Database:** [ ] Add idempotency keys, recipient/status indexes, and retention support.
- **API:** [ ] Add self-only list/read/mark-read/preferences contracts.
- **Security:** [ ] Prevent recipient leakage and exclude secrets/sensitive details from messages.
- **Testing:** [ ] Test event mapping, retries, idempotency, preferences, ownership, and UI states.
- **Acceptance:** [ ] Supported events create one correct notification and retry safely without duplicates.

### Phase 17 â€” Reporting

**Status:** [ ] Not Started
**Goal:** Provide filterable admissions, academic, and finance insights without compromising data.
**Scope:** Dashboard/report queries, charts, exports, pagination, and background generation.
**Dependencies:** Source domain phases.

- **Backend:** [ ] Add query services for admissions, enrollment, attendance, results, completion, progress, fees, collections, and balances.
- **Frontend:** [ ] Build responsive filter bars, summaries, charts, tables/cards, exports, and empty/error states.
- **Database:** [ ] Add measured indexes/materialization only after query plans justify them.
- **API:** [ ] Add paginated report contracts, bounded date ranges, stable aggregations, and async export status.
- **Security:** [ ] Enforce report-level permissions, row scope, export controls, and formula-injection-safe CSV output.
- **Testing:** [ ] Test known aggregates, filters, timezone boundaries, permissions, large datasets, charts, and exports.
- **Acceptance:** [ ] Authorized users reproduce verified totals while unauthorized users cannot infer restricted data.

### Phase 18 â€” Audit Logging and Production Readiness

**Status:** [ ] Not Started
**Goal:** Complete tamper-resistant audit coverage and prepare a recoverable production release.
**Scope:** AuditLog, observability, performance, hardening, deployment, backup/restore, and critical E2E certification.
**Dependencies:** All prior MVP phases.

- **Backend:** [ ] Finalize immutable audit capture, structured logs, health/readiness, measured query optimization, and worker observability.
- **Frontend:** [ ] Build authorized audit viewer and complete accessibility/responsive/performance hardening.
- **Database:** [ ] Add audit indexes/retention, backup automation, restore rehearsal, and migration rollback guidance.
- **API:** [ ] Add read-only audited access, finalize schema compatibility, and document every shipped contract.
- **Security:** [ ] Run threat review, dependency audits, permission matrix tests, header/cookie checks, secret scan, upload abuse tests, and production-setting checks.
- **Testing:** [ ] Run all unit/integration/component/E2E suites and automate the applicant-to-certificate critical path with Playwright.
- **Acceptance:** [ ] Production-like deployment passes security, accessibility, responsive, recovery, performance, and end-to-end release gates.

## Phase Checkpoint Rules

- [x] Before a phase: mark it `[~]`, confirm dependencies, and state the implementation slice.
- [x] During a phase: use test-first behavior changes and update architecture/contracts before divergent code.
- [x] After a phase: run focused and full checks, perform five-axis review, simplify only proven complexity, verify acceptance, then mark `[x]`.
- [x] If blocked: mark the exact item `[!]`, retain truthful phase status, and record the evidence.

## Overview

Build a complete Learning Management System for E3 Empower Africa Limited and the E3 Empower Institute of Technology. The public registration form is the start of one connected student lifecycle:

```text
Registration â†’ Admission â†’ Student creation â†’ Enrollment â†’ Learning
â†’ Attendance â†’ Assignments â†’ Assessments â†’ Payments â†’ Certification
```

The first release should prove this workflow end to end before advanced analytics, messaging, or integrations are added.

## Technical Direction

### Backend

- Python 3.12+, Django, Django REST Framework
- `uv` is the required Python environment and dependency manager.
- `backend/pyproject.toml` is the dependency source of truth; `backend/uv.lock` must remain synchronized and version-controlled.
- Backend onboarding begins with `uv sync`; run Django, Celery, tests, and Ruff through `uv run`.
- PostgreSQL for persistent data
- Redis and Celery for background work
- `django-filter`, Pillow, and `drf-spectacular`
- Versioned REST API under `/api/v1/`
- Secure session authentication or short-lived JWT access tokens with refresh-token rotation
- `pytest` and `pytest-django`

### Frontend

- React with JavaScript (no TypeScript) and Vite
- React Router, Axios, Tailwind CSS, and shadcn/ui where useful
- React Hook Form with Zod or Yup
- Lucide React icons and Recharts
- Vitest, React Testing Library, and Playwright

### Target structure

```text
e3-lms/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ config/
â”‚   â”œâ”€â”€ apps/
â”‚   â”‚   â”œâ”€â”€ accounts/        â”œâ”€â”€ admissions/
â”‚   â”‚   â”œâ”€â”€ students/        â”œâ”€â”€ guardians/
â”‚   â”‚   â”œâ”€â”€ courses/         â”œâ”€â”€ enrollments/
â”‚   â”‚   â”œâ”€â”€ learning/        â”œâ”€â”€ attendance/
â”‚   â”‚   â”œâ”€â”€ assignments/     â”œâ”€â”€ assessments/
â”‚   â”‚   â”œâ”€â”€ payments/        â”œâ”€â”€ certificates/
â”‚   â”‚   â”œâ”€â”€ notifications/   â”œâ”€â”€ reports/
â”‚   â”‚   â””â”€â”€ audit/
â”‚   â”œâ”€â”€ manage.py
â”‚   â”œâ”€â”€ pyproject.toml
â”‚   â””â”€â”€ uv.lock
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ api/             â”œâ”€â”€ assets/
â”‚   â”‚   â”œâ”€â”€ components/      â”œâ”€â”€ layouts/
â”‚   â”‚   â”œâ”€â”€ pages/           â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ context/         â”œâ”€â”€ services/
â”‚   â”‚   â”œâ”€â”€ utils/           â””â”€â”€ routes/
â”‚   â””â”€â”€ package.json
â”œâ”€â”€ README.md
â””â”€â”€ PLAN.md
```

## Roles and Access

- **Super Admin:** unrestricted administration, settings, roles, reports, and audit logs.
- **Admissions Officer:** review applications, change admission status, create students, and assign intakes/courses.
- **Administrator:** manage students, courses, classes, instructors, enrollments, attendance, and reports.
- **Finance Officer:** record payments, issue receipts, and view balances/reports; cannot alter academic results.
- **Instructor/Mentor:** manage assigned classes, content, attendance, assignments, assessments, grading, and notes.
- **Student:** access their own profile, courses, learning content, submissions, results, attendance, balances, and certificates.
- **Parent/Guardian (future):** read-only access to an eligible minor's progress, attendance, enrollment, and payment status.

The frontend may hide unavailable actions, but the API must enforce role and object-level authorization for every request.

## Core Domain and Business Rules

### Principal models

```text
User, Role, Applicant, Guardian, EmergencyContact, Application
CourseCategory, Course, Intake, TrainingSession, Class, Student, Enrollment
CourseModule, Lesson, LearningResource
Assignment, AssignmentSubmission
Assessment, Question, Answer, AssessmentAttempt
AttendanceSession, AttendanceRecord
Payment, Certificate, Notification, AuditLog
```

### Important distinctions

- A **Course** is a permanent offering, such as â€œPython 3 Beginner.â€
- A **Class** is a scheduled delivery, such as â€œPython Beginner â€” August 2026 Morning.â€
- An **Enrollment** connects one student to one class.

### Invariants

1. Applicants register without an account.
2. Applicants under 18 must provide guardian details.
3. Courses, schedules, availability, and prices come from the backend.
4. The backend recalculates all fees and balances; client totals are never authoritative.
5. Each selected course stores `fee_at_registration` so later price changes do not alter history.
6. Application, student, receipt, and certificate numbers are unique and generated server-side.
7. Only approved applicants normally become students, and creation must be idempotent.
8. Students may enroll in multiple courses over time.
9. Course and other referenced historical records are deactivated, not hard-deleted.
10. Financial, grade, admission, completion, and certificate changes are audited.
11. Multi-model workflows use database transactions.
12. Tokens, secrets, private paths, and stack traces must never be logged or returned.

## Public Registration Scope

Create a responsive multi-step form at `/register`:

1. **Applicant:** name, birth date, calculated age, gender, nationality, contact details, address, and passport photo.
2. **Education:** level, institution, current level, previous computer training, and conditional description.
3. **Guardian:** relationship and contact details; required when the applicant is under 18.
4. **Emergency contact:** name, relationship, phones, and email.
5. **Courses and schedule:** dynamically loaded categories/courses, multiple selections, preferred date/session, duration, fee snapshots, and server-calculated total.
6. **Additional details:** computer/laptop access, reason for joining, and referral source.
7. **Review and declaration:** full summary and required truthfulness confirmation.

On submission, validate availability and prices, persist all related records atomically, create an audit event, assign `E3-APP-YYYY-######`, and return a success page. New applications begin as `PENDING` and may move through `UNDER_REVIEW`, `APPROVED`, `WAITLISTED`, `REJECTED`, or `CANCELLED` under explicit transition rules.

## Delivery Sprints

### Sprint 1 â€” Foundation and Identity

**Goal:** A runnable development environment with authenticated, role-aware application shells.

#### Tasks

- Create the Django project and domain app packages under `backend/`.
- Create the Vite React JavaScript app under `frontend/`.
- Add environment templates, PostgreSQL configuration, CORS/CSRF policy, Redis, and Celery configuration.
- Implement the custom user model, roles, reusable permissions, login/logout, refresh/session handling, password reset, and password change.
- Build responsive admin, instructor, and student shells with protected routes.
- Add OpenAPI generation, health endpoints, linting, formatting, and baseline test commands.

**Demo/validation:** Start all local services, open the API schema and frontend, sign in as each seeded role, and verify unauthorized routes return `403`.

### Sprint 2 â€” Courses, Registration, and Admissions (First usable release)

**Goal:** A public applicant can register and admissions staff can review the application.

#### Tasks

- Add course categories, courses, intakes, and manageable training sessions.
- Build public read endpoints for active courses and available sessions.
- Implement applicant, guardian, emergency-contact, application, selected-course, and immutable fee-snapshot models.
- Build the seven-step registration wizard, validation, uploads, review screen, and confirmation page.
- Implement transactional submission, authoritative fee calculation, application numbering, duplicate request protection, and audit logging.
- Build the registrations table and application detail tabs: Overview, Courses, Payments, and Activity.
- Implement controlled admission status transitions and staff-only approve, waitlist, reject, cancel, and print actions.

**Demo/validation:** Submit adult and minor applications, reject missing guardian data, tamper with a client price and confirm the server ignores it, then review and approve an application.

### Sprint 3 â€” Student, Class, and Enrollment Management

**Goal:** An approved application becomes one student enrolled in a scheduled class.

#### Tasks

- Implement student profiles and unique `E3-STU-YYYY-######` identifiers.
- Convert approved applications idempotently, matching carefully by applicant, verified email, and phone.
- Implement classes with course, instructor, intake, dates, session, capacity, and status.
- Implement enrollment statuses: `ENROLLED`, `ACTIVE`, `COMPLETED`, `DROPPED`, and `SUSPENDED`.
- Add admin screens for students, classes, instructor assignments, and enrollments.
- Provision student login securely without exposing a reusable default password.

**Demo/validation:** Convert one application twice and get only one student, enroll that student in multiple classes, and enforce class capacity and valid transitions.

### Sprint 4 â€” Learning Content and Student Portal

**Goal:** Instructors publish structured content and students consume it.

#### Tasks

- Add ordered modules, lessons, and learning resources with publish controls.
- Support validated text, PDF, image, video-link, and downloadable-resource content.
- Build course/module authoring for assigned instructors.
- Build student dashboard, â€œMy Courses,â€ lesson viewer, resource downloads, and completion tracking.
- Add the digital library with category, course, and resource-type filters.
- Calculate progress server-side from defined completion signals.

**Demo/validation:** Publish a module and lesson, confirm only enrolled students can access them, complete a lesson, and observe updated progress.

### Sprint 5 â€” Assignments and Assessments

**Goal:** Students submit work and instructors assess performance.

#### Tasks

- Implement assignments, attachments, due dates, submissions, comments, grades, feedback, and return workflow.
- Implement quizzes/tests/exams with multiple-choice, true/false, short-answer, and essay questions.
- Store attempt number, score, percentage, pass/fail result, and submission time.
- Add student and instructor workflows for upcoming work, submission, grading, and results.
- Audit grade changes and enforce enrollment/class ownership.

**Demo/validation:** Submit and grade an assignment, complete an assessment, verify attempt limits and scoring, and confirm another student cannot access the records.

### Sprint 6 â€” Attendance and Progress

**Goal:** Instructors record class attendance and stakeholders see reliable progress.

#### Tasks

- Implement attendance sessions and per-student `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED` records.
- Build a class/date attendance roster optimized for bulk entry.
- Calculate attendance percentage and course progress from lessons, assignments, assessments, and attendance.
- Add student history and instructor/admin summaries.

**Demo/validation:** Record and amend a class roster, prevent duplicate daily records, and verify percentages against known fixtures.

### Sprint 7 â€” Finance

**Goal:** Finance staff record payments and see authoritative balances.

#### Tasks

- Implement payments, unique receipt numbers, methods, references, dates, recorder, notes, and immutable audit history.
- Support Cash, M-Pesa, Airtel Money, Mixx by Yas/Tigo Pesa, HaloPesa, Bank, and Other.
- Calculate `UNPAID`, `PARTIALLY_PAID`, or `FULLY_PAID` from fee snapshots minus accepted payments.
- Build payment entry, receipt, student balance, outstanding balance, and finance report screens.
- Define reversal/correction behavior instead of destructive payment editing.

**Demo/validation:** Record partial and final payments, verify balance/status updates, produce a receipt, reject over/invalid payments per policy, and inspect the audit trail.

### Sprint 8 â€” Completion and Certificates

**Goal:** Eligible completed enrollments receive verifiable certificates.

#### Tasks

- Define configurable completion criteria and authorized completion workflow.
- Generate unique `E3-CERT-YYYY-######` identifiers.
- Build branded certificate records and downloadable PDFs through a background task.
- Add certificate access to student and admin portals.

**Demo/validation:** Prevent an ineligible certificate, complete an eligible enrollment, generate one certificate idempotently, and download its PDF.

### Sprint 9 â€” Notifications and Communication

**Goal:** Users receive reliable lifecycle notifications.

#### Tasks

- Add in-app notifications for registration, approval, payment, class assignment, coursework, and certificate events.
- Add transactional email through Celery with retry and failure visibility.
- Add user preferences and message templates.
- Treat SMS and WhatsApp as later provider integrations behind stable interfaces.

**Demo/validation:** Trigger each supported event, verify recipient/permission rules, and prove retries do not create duplicate messages.

### Sprint 10 â€” Reports, Analytics, and Production Readiness

**Goal:** The system is measurable, secure, recoverable, and deployable.

#### Tasks

- Add admissions, enrollment, completion, attendance, assessment, fee, collection, balance, and progress reports.
- Add dashboard cards and charts for registrations, enrollment, payments, and application status.
- Optimize queries with indexes, pagination, `select_related`, `prefetch_related`, and measured caching.
- Add rate limiting, upload MIME/size checks, secure-cookie/HTTPS settings, structured logs, error monitoring, and backup/restore procedures.
- Build production images/configuration for Nginx, Gunicorn, Django, PostgreSQL, Redis, Celery, and the React static build.
- Run accessibility, responsive, security, performance, migration, and disaster-recovery checks.

**Demo/validation:** Run the production-like stack, complete the critical journey, inspect dashboards, restore a backup in a clean environment, and pass the release checklist.

## API Areas

```text
/api/v1/auth/          /api/v1/applications/  /api/v1/students/
/api/v1/guardians/     /api/v1/courses/       /api/v1/categories/
/api/v1/classes/       /api/v1/enrollments/   /api/v1/modules/
/api/v1/lessons/       /api/v1/assignments/   /api/v1/assessments/
/api/v1/attendance/    /api/v1/payments/      /api/v1/certificates/
/api/v1/reports/
```

Use serializers for input validation, services for complex workflows, thin views where practical, database constraints for invariants, pagination for collections, and an OpenAPI contract for frontend integration.

## UI Direction

- Modern, professional, institutional, responsive, and accessible.
- Palette: primary `#178A52`, dark green `#0E5C3A`, soft green `#EAF6EF`, background `#F7F9F8`, text `#18201C`, muted text `#66736C`, border `#DDE5E0`.
- Avoid excessive gradients, glass effects, oversized rounded cards, and unnecessary animation.
- Validate layouts at 375, 430, 768, 1024, 1280, and 1440 px.
- Use a persistent desktop sidebar and mobile drawer; adapt dense tables to cards or horizontal scrolling where appropriate.
- Meet WCAG 2.2 AA for keyboard access, focus visibility, labels, contrast, errors, and reduced motion.

## Testing Strategy

- **Backend unit tests:** models, validators, permissions, numbering, prices, balances, and progress calculations.
- **Backend integration tests:** registration, admission conversion, enrollment, payment, grading, attendance, and certificate transactions.
- **Frontend component tests:** forms, conditional guardian fields, route guards, tables, loading/empty/error states, and accessibility.
- **API contract tests:** frontend expectations against the generated OpenAPI schema.
- **End-to-end tests:** the complete applicant-to-certificate path plus negative authorization and tampering cases.
- **Operational tests:** migrations, backup/restore, worker retries, production static/media delivery, and rollback.

The release-blocking journey is: register â†’ approve â†’ create student â†’ enroll â†’ record payment â†’ sign in â†’ learn â†’ attend â†’ submit â†’ assess â†’ complete â†’ certify.

## Security and Data Protection

- Keep secrets in environment variables and commit only `.env.example` files.
- Validate and scan untrusted uploads; limit type, extension, and size; store them outside executable paths.
- Apply least privilege and object-level access checks on the server.
- Protect authentication endpoints with rate limits and secure reset flows.
- Use CSRF protection when cookie authentication is used; explicitly allow trusted CORS origins.
- Avoid logging tokens and sensitive personal data; define retention and access policies.
- Preserve immutable audit evidence for sensitive operations.

## Performance and Operations

- Index identifiers, foreign keys, statuses, dates, and common report filters.
- Prevent N+1 queries and paginate large tables.
- Use Celery for email, reports, certificates, and bulk communication.
- Add Redis caching only after measurement and define invalidation rules.
- Provide health/readiness checks, structured logging, monitoring, alerting, database backups, and tested restoration.

## Risks and Gotchas

- **Identity collisions:** email/phone matching alone can merge different people; require review when signals conflict.
- **Age changes:** store birth date and evaluate the under-18 rule at submission time; retain the guardian snapshot.
- **Price drift:** use immutable fee snapshots and never recompute old applications from current course prices.
- **Concurrent numbering:** use database-backed sequences/locking and unique constraints, not â€œlast record + 1.â€
- **State corruption:** centralize and test application, enrollment, payment, and certificate transitions.
- **Timezone ambiguity:** store timestamps in UTC and define the institutionâ€™s display timezone.
- **Uploads and privacy:** passport photos and student documents require strict access, retention, and deletion policies.
- **Notification duplication:** make background tasks idempotent and record delivery attempts.
- **Scope pressure:** defer guardian portal, SMS, WhatsApp, and advanced analytics until the core journey is reliable.

## Decisions to Confirm Before Implementation

- Deployment host, production domain, and institution timezone.
- Authentication choice (secure cookies vs JWT) and student account activation method.
- Currency/rounding rules, overpayment/refund policy, and receipt cancellation process.
- Exact progress and completion formulas.
- File-storage provider, upload limits, and data-retention policy.
- Certificate template, signatories, and public verification requirements.
- SMS/WhatsApp providers and consent requirements.

## Rollback Plan

- Deliver each sprint in atomic commits and use feature flags for incomplete user-facing modules.
- Require reversible database migrations; back up before destructive schema changes.
- Deploy versioned backend/frontend artifacts and retain the previous known-good release.
- Roll back application artifacts first; use tested forward-fix migrations when a schema downgrade risks data loss.
- Make background tasks safe to retry and pause workers during incompatible deployments.

## MVP Exit Criteria

The MVP is complete when public registration, course administration, admissions approval, student creation, enrollment, student login, lessons, attendance, assignments, basic assessments, payments, and student progress work together in the release-blocking end-to-end test. Advanced communications, analytics, and guardian access are not MVP blockers.
