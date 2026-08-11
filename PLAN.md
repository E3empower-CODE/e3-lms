# E3 Empower LMS — Development Plan

**Generated:** 2026-08-11  
**Estimated complexity:** High  
**Status:** Planning

## Overview

Build a complete Learning Management System for E3 Empower Africa Limited and the E3 Empower Institute of Technology. The public registration form is the start of one connected student lifecycle:

```text
Registration → Admission → Student creation → Enrollment → Learning
→ Attendance → Assignments → Assessments → Payments → Certification
```

The first release should prove this workflow end to end before advanced analytics, messaging, or integrations are added.

## Technical Direction

### Backend

- Python 3.12+, Django, Django REST Framework
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
├── backend/
│   ├── config/
│   ├── apps/
│   │   ├── accounts/        ├── admissions/
│   │   ├── students/        ├── guardians/
│   │   ├── courses/         ├── enrollments/
│   │   ├── learning/        ├── attendance/
│   │   ├── assignments/     ├── assessments/
│   │   ├── payments/        ├── certificates/
│   │   ├── notifications/   ├── reports/
│   │   └── audit/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             ├── assets/
│   │   ├── components/      ├── layouts/
│   │   ├── pages/           ├── hooks/
│   │   ├── context/         ├── services/
│   │   ├── utils/           └── routes/
│   └── package.json
├── README.md
└── PLAN.md
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

- A **Course** is a permanent offering, such as “Python 3 Beginner.”
- A **Class** is a scheduled delivery, such as “Python Beginner — August 2026 Morning.”
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

### Sprint 1 — Foundation and Identity

**Goal:** A runnable development environment with authenticated, role-aware application shells.

#### Tasks

- Create the Django project and domain app packages under `backend/`.
- Create the Vite React JavaScript app under `frontend/`.
- Add environment templates, PostgreSQL configuration, CORS/CSRF policy, Redis, and Celery configuration.
- Implement the custom user model, roles, reusable permissions, login/logout, refresh/session handling, password reset, and password change.
- Build responsive admin, instructor, and student shells with protected routes.
- Add OpenAPI generation, health endpoints, linting, formatting, and baseline test commands.

**Demo/validation:** Start all local services, open the API schema and frontend, sign in as each seeded role, and verify unauthorized routes return `403`.

### Sprint 2 — Courses, Registration, and Admissions (First usable release)

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

### Sprint 3 — Student, Class, and Enrollment Management

**Goal:** An approved application becomes one student enrolled in a scheduled class.

#### Tasks

- Implement student profiles and unique `E3-STU-YYYY-######` identifiers.
- Convert approved applications idempotently, matching carefully by applicant, verified email, and phone.
- Implement classes with course, instructor, intake, dates, session, capacity, and status.
- Implement enrollment statuses: `ENROLLED`, `ACTIVE`, `COMPLETED`, `DROPPED`, and `SUSPENDED`.
- Add admin screens for students, classes, instructor assignments, and enrollments.
- Provision student login securely without exposing a reusable default password.

**Demo/validation:** Convert one application twice and get only one student, enroll that student in multiple classes, and enforce class capacity and valid transitions.

### Sprint 4 — Learning Content and Student Portal

**Goal:** Instructors publish structured content and students consume it.

#### Tasks

- Add ordered modules, lessons, and learning resources with publish controls.
- Support validated text, PDF, image, video-link, and downloadable-resource content.
- Build course/module authoring for assigned instructors.
- Build student dashboard, “My Courses,” lesson viewer, resource downloads, and completion tracking.
- Add the digital library with category, course, and resource-type filters.
- Calculate progress server-side from defined completion signals.

**Demo/validation:** Publish a module and lesson, confirm only enrolled students can access them, complete a lesson, and observe updated progress.

### Sprint 5 — Assignments and Assessments

**Goal:** Students submit work and instructors assess performance.

#### Tasks

- Implement assignments, attachments, due dates, submissions, comments, grades, feedback, and return workflow.
- Implement quizzes/tests/exams with multiple-choice, true/false, short-answer, and essay questions.
- Store attempt number, score, percentage, pass/fail result, and submission time.
- Add student and instructor workflows for upcoming work, submission, grading, and results.
- Audit grade changes and enforce enrollment/class ownership.

**Demo/validation:** Submit and grade an assignment, complete an assessment, verify attempt limits and scoring, and confirm another student cannot access the records.

### Sprint 6 — Attendance and Progress

**Goal:** Instructors record class attendance and stakeholders see reliable progress.

#### Tasks

- Implement attendance sessions and per-student `PRESENT`, `ABSENT`, `LATE`, and `EXCUSED` records.
- Build a class/date attendance roster optimized for bulk entry.
- Calculate attendance percentage and course progress from lessons, assignments, assessments, and attendance.
- Add student history and instructor/admin summaries.

**Demo/validation:** Record and amend a class roster, prevent duplicate daily records, and verify percentages against known fixtures.

### Sprint 7 — Finance

**Goal:** Finance staff record payments and see authoritative balances.

#### Tasks

- Implement payments, unique receipt numbers, methods, references, dates, recorder, notes, and immutable audit history.
- Support Cash, M-Pesa, Airtel Money, Mixx by Yas/Tigo Pesa, HaloPesa, Bank, and Other.
- Calculate `UNPAID`, `PARTIALLY_PAID`, or `FULLY_PAID` from fee snapshots minus accepted payments.
- Build payment entry, receipt, student balance, outstanding balance, and finance report screens.
- Define reversal/correction behavior instead of destructive payment editing.

**Demo/validation:** Record partial and final payments, verify balance/status updates, produce a receipt, reject over/invalid payments per policy, and inspect the audit trail.

### Sprint 8 — Completion and Certificates

**Goal:** Eligible completed enrollments receive verifiable certificates.

#### Tasks

- Define configurable completion criteria and authorized completion workflow.
- Generate unique `E3-CERT-YYYY-######` identifiers.
- Build branded certificate records and downloadable PDFs through a background task.
- Add certificate access to student and admin portals.

**Demo/validation:** Prevent an ineligible certificate, complete an eligible enrollment, generate one certificate idempotently, and download its PDF.

### Sprint 9 — Notifications and Communication

**Goal:** Users receive reliable lifecycle notifications.

#### Tasks

- Add in-app notifications for registration, approval, payment, class assignment, coursework, and certificate events.
- Add transactional email through Celery with retry and failure visibility.
- Add user preferences and message templates.
- Treat SMS and WhatsApp as later provider integrations behind stable interfaces.

**Demo/validation:** Trigger each supported event, verify recipient/permission rules, and prove retries do not create duplicate messages.

### Sprint 10 — Reports, Analytics, and Production Readiness

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

The release-blocking journey is: register → approve → create student → enroll → record payment → sign in → learn → attend → submit → assess → complete → certify.

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
- **Concurrent numbering:** use database-backed sequences/locking and unique constraints, not “last record + 1.”
- **State corruption:** centralize and test application, enrollment, payment, and certificate transitions.
- **Timezone ambiguity:** store timestamps in UTC and define the institution’s display timezone.
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
