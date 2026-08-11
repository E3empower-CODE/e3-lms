# E3 Empower LMS Database Design

**Status:** Architectural baseline; no migrations exist yet.  
**Database:** PostgreSQL is authoritative in shared and production environments.

## Domain Boundaries

```text
Accounts
  User, role and permission foundations

Admissions
  Applicant → Application → RegistrationCourse
      ├── Guardian
      └── EmergencyContact

Catalog and delivery
  CourseCategory → Course → Class ← Enrollment ← Student
                              ↑
                            Intake
                              ↑
                       TrainingSession

Learning
  Course → CourseModule → Lesson → LearningResource

Coursework
  Class → Assignment → AssignmentSubmission
  Class → Assessment → Question → Choice
                   └→ AssessmentAttempt → StudentAnswer

Attendance
  Class → AttendanceSession → AttendanceRecord ← Student

Finance and completion
  Application/Enrollment → Payment/Allocation
  Completed Enrollment → Certificate

Cross-cutting
  Notification, AuditLog
```

## Required Invariants

- Configure the custom Django user model before the first application migration.
- A Course is permanent catalog data; a Class is one scheduled delivery; Enrollment connects a Student to a Class.
- Application, student, receipt, and certificate numbers are unique at the database level.
- `RegistrationCourse.fee_at_registration` is immutable historical money data.
- Application submission and application-to-student conversion are atomic.
- One application produces at most one student.
- One student is enrolled at most once in the same class.
- Class capacity is checked inside a concurrency-safe transaction.
- One attendance record exists per student and attendance session.
- Payment originals are not deleted or silently rewritten; corrections use explicit void/reversal records.
- Certificate issuance is idempotent per enrollment.
- Referenced historical academic and financial records use protective deletion behavior or deactivation.

## Data Types and Time

- Use `DecimalField` for money; never binary floating point.
- Store timestamps in UTC and display them in the institution timezone.
- Store dates separately when time-of-day is not meaningful.
- Use database constraints for non-negative fees, payments, capacity, scores, and percentages.
- Normalize phone numbers at input boundaries while retaining appropriate display formatting.

## Identifier Generation

Display identifiers follow these patterns:

```text
E3-APP-YYYY-######
E3-STU-YYYY-######
E3-CERT-YYYY-######
```

Generation must be concurrency-safe. Do not use “read the last row and add one.” Use a database-backed counter/sequence or locked yearly counter plus unique constraints and retry on the narrowly defined conflict.

## Indexing Principles

- Index foreign keys, display identifiers, status/date combinations, and documented report filters.
- Use partial indexes for high-value active/pending subsets only after query review.
- Add `select_related`/`prefetch_related` in query services to prevent N+1 access.
- Measure with realistic data and query plans before adding caches or materialized summaries.

## Privacy and Retention

Applicant/student contact details, guardian details, passport photos, academic records, and payment history are sensitive. Access is least-privilege, API serializers use explicit field allowlists, logs avoid PII, and export access is audited. Retention, deletion, and data-subject policies must be approved before production.

## Migration Rules

- Every schema change ships as a reviewed Django migration.
- Migrations must be safe for existing data and include backfill strategy when necessary.
- Destructive migrations require a verified backup and a forward-fix/rollback plan.
- `makemigrations --check --dry-run` and migrations against a clean database are release gates.
