# E3 Empower LMS — Frontend Build Plan

**Status:** Foundation plan. The app is currently the Vite starter; this document is the
authoritative build order for the interactive frontend. It **maps onto** `PLAN.md`
phases — it does not invent a parallel roadmap. Read `CLAUDE.md` (golden rules) and the
`e3-design-system` skill before building.

**Stack:** React 19 + Vite 8 (JavaScript only) · react-router-dom 7 · react-hook-form 7 +
zod 4 · axios · recharts · lucide-react · CSS Modules + tokens · vitest +
@testing-library + playwright.

---

## 1. Target folder structure

```text
frontend/src/
  app/
    router.jsx           # route tree (data router), lazy-loaded route modules
    providers.jsx        # AuthProvider, error boundary, toast/live-region host
    App.jsx              # mounts providers + router (replaces the starter demo)
  layouts/
    PublicLayout/        # marketing/registration shell (no auth)
    AdminLayout/         # admissions/registrar/super-admin/finance shell
    StudentLayout/       # student portal shell
    InstructorLayout/    # instructor/mentor shell
  routes/
    ProtectedRoute.jsx   # requires auth; redirects to login
    RoleRoute.jsx        # requires a role set; renders 403 otherwise
  features/<domain>/     # auth, registration, admissions, students, classes,
                         # enrollments, learning, coursework, attendance, finance,
                         # certificates, reports — each: components/, hooks/, api.js, schemas.js
  components/            # shared primitives: Button, Input, Select, Card, Table,
                         # Badge, Modal, Drawer, Alert, Spinner, EmptyState, Pagination
  lib/
    apiClient.js         # axios instance: baseURL, withCredentials, CSRF, error normalize
    queryKeys.js         # (if adopting a server-cache lib) centralized keys
    auth.js              # current-user bootstrap, login/logout, role helpers
    pagination.js        # helpers for the {data, pagination} envelope
    format.js            # money/date/timezone display helpers
  hooks/                 # cross-feature hooks (useMediaQuery, useDebounce, ...)
  styles/
    tokens.css           # design tokens (single source of truth)
    global.css           # reset + base element styles built on tokens
  test/                  # setup (jsdom, testing-library), test utils, msw handlers
  main.jsx               # entry; imports tokens.css + global.css
```

## 2. Architecture decisions

- **Routing** — react-router 7 data router. Route modules are lazy-loaded per feature.
  Guards compose: `ProtectedRoute` (authenticated) wraps `RoleRoute` (allowed roles).
  Route guards are UX only — **authorization is always enforced server-side**.
- **API layer** — one axios instance in `lib/apiClient.js`:
  - `baseURL = import.meta.env.VITE_API_BASE_URL` (`/api/v1`), `withCredentials: true`.
  - Reads the Django CSRF cookie and sets the CSRF header on unsafe methods.
  - Response interceptor normalizes the **error envelope**
    (`{ error: { code, message, details, request_id } }`) into a typed rejection, and
    unwraps the **collection envelope** (`{ data, pagination }`) via `lib/pagination.js`.
    On `401`, clears auth state and routes to login.
  - **No token storage** — cookies only. Never touch `localStorage`/`sessionStorage`
    for credentials.
- **Auth/session model** — cookie-based. On boot, `AuthProvider` calls the current-user
  endpoint; unauthenticated → public routes; authenticated → role-appropriate shell.
  `login`/`logout` hit the auth endpoints (paths finalized in backend Phase 1 per
  `API.md`) and refresh current-user.
- **Server state** — colocate fetching in feature hooks. A small server-cache library may
  be introduced when caching/invalidation needs arise; until then, hooks own
  loading/error/data and expose the four data-states.
- **Forms** — react-hook-form + zod resolver; `snake_case` field names; server field
  errors mapped back via `setError`. (See design-system skill §3.)
- **Charts** — recharts for dashboard/report visualizations, with accessible summaries.
- **Data-states** — every async view renders loading / empty / error / success.
- **Wire format** — `snake_case` in and out; money as server `Decimal` strings rendered
  via `lib/format.js`; timestamps UTC → institution timezone for display.

## 3. API & auth contract (from `API.md`)

- **Base:** `/api/v1/`; plural nouns; trailing slashes; `PATCH` for partial updates;
  workflow transitions are explicit subresource actions.
- **Wire:** `snake_case` fields/params; dates `YYYY-MM-DD`; timestamps ISO 8601 UTC.
- **Auth/CSRF:** Django HTTP-only session cookies; CSRF token on state-changing requests;
  no browser credential storage; `401` = unauthenticated, `403` = unauthorized.
- **Success shapes:** single resource = serialized object; collection =
  `{ data: [...], pagination: { page, page_size, total_items, total_pages } }`
  (default page size 20).
- **Errors:** `{ error: { code, message, details?, request_id } }`.

| Status | Meaning |
| --- | --- |
| 400 | malformed request / invalid query params |
| 401 | authentication required or expired |
| 403 | authenticated but not authorized |
| 404 | resource unavailable to this actor |
| 409 | duplicate / invalid transition / concurrency conflict |
| 415 | unsupported upload media type |
| 422 | semantically invalid fields |
| 429 | throttle exceeded |
| 500 | safe generic failure |

- **Filtering/ordering:** allowlisted per endpoint — `?page=&page_size=&search=&ordering=`;
  never rely on default DB ordering.
- **Planned resource areas:** `auth, health, applications, students, guardians,
  course-categories, courses, intakes, classes, enrollments, modules, lessons,
  assignments, assessments, attendance, payments, certificates, reports`. Consume only
  endpoints present in the generated OpenAPI schema.

## 4. Roles → shells (from `PLAN.md` Roles and Access)

| Role | Layout | Reaches |
| --- | --- | --- |
| Super Admin | AdminLayout | everything: admin, settings, roles, reports, audit |
| Admissions / Registrar | AdminLayout | applications, students, classes, enrollments |
| Finance Officer | AdminLayout | payments, receipts, balances, finance reports (no academic result edits) |
| Instructor / Mentor | InstructorLayout | assigned classes: content, attendance, coursework, grading |
| Student | StudentLayout | own profile, courses, lessons, submissions, results, attendance, balances, certificates |

The frontend hides unavailable actions; the API enforces role + object-level authz on
every request.

## 5. Phased roadmap

Each stage stays runnable and passes its `PLAN.md` demo/acceptance checklist.

**P0 — Foundations (maps to `PLAN.md` Phase 1/2).**
Install deps; add `tokens.css` + `global.css`; **replace the starter `App.jsx`/`index.css`**;
build `lib/apiClient.js` (cookies + CSRF + envelope handling), `lib/auth.js` +
`AuthProvider`; router with `ProtectedRoute`/`RoleRoute`; the four shell layouts
(`PublicLayout`, `AdminLayout`, `StudentLayout`, `InstructorLayout`) with sidebar/drawer
nav; shared component primitives; the four-data-state pattern. Add `.env.example`
(`VITE_API_BASE_URL`).
*Acceptance:* each role reaches only its allowed shell; unauthorized routes render 403.

**P1 — Auth / login.** Login, logout, password reset/change flows; current-user bootstrap;
session expiry handling. Screens: login, forgot/reset password.

**P2 — Public registration wizard (`PLAN.md` Phase 3).** Multi-step, mobile-first:
applicant details → **guardian (conditional, required when applicant is under 18)** →
emergency contact → course/schedule selection → declarations → **immutable fee snapshot**
→ confirmation. Persists step state; validates each step with Zod; submits atomically.
*Key components:* Wizard/Stepper, conditional field groups, review/confirm.

**P3 — Admissions dashboard (`PLAN.md` Phase 4).** Metrics cards + charts; filterable
registration list (desktop table ↔ mobile cards); application detail with tabs, notes,
print view, and status-workflow transitions with confirmations.

**P4 — Student creation (`PLAN.md` Phase 5).** Application→student conversion UI, duplicate
review, generated student number display, sensitive-field redaction by role.

**P5 — Student portal (`PLAN.md` Phase 8).** Student shell + dashboard; My Courses; lesson
viewer; resource downloads; progress/completion states; module placeholders that activate
by later phases.

**P6 — Instructor portal (`PLAN.md` Phase 9).** Instructor dashboard; assigned classes and
rosters; lessons/content management; attendance entry; coursework and results links.
*Acceptance:* instructors operate only assigned classes; unassigned mutations get 403.

**P7 — Coursework: assignments & assessments.** Assignment list/detail, multipart
submission upload (type/size guarded); assessment attempts that **never expose protected
answers**; server-authoritative results/grading views.

**P8 — Attendance & progress.** Attendance session UI; student/stakeholder progress views
computed server-side (client never writes progress).

**P9 — Finance / payments.** Payment recording, receipts, authoritative balances, finance
reports. Money rendered from server `Decimal`; corrections via void/reversal, never edits.

**P10 — Certificates & reporting.** Certificate issuance action + role-scoped certificate
reads; reporting dashboards with charts, exports, pagination, and background generation.

## 6. Testing strategy (from `PLAN.md`)

- **Component tests** (vitest + @testing-library + jsdom): forms, conditional guardian
  fields, route guards, tables, the four data-states, and accessibility (roles, labels,
  focus).
- **API-contract checks:** frontend expectations validated against the generated OpenAPI
  schema; mock the API with MSW in tests.
- **End-to-end** (Playwright): the release-blocking journey — register → approve → create
  student → enroll → record payment → sign in → learn → attend → submit → assess →
  complete → certify — plus negative authorization/tampering cases.
- Run `npm run lint` and `npm run build` before every commit; `npm test -- --run` in CI.

## 7. Risk watch-list

- **Cookie/CSRF across origins** — dev (5173) → API (8000) needs `withCredentials`, CORS
  allow-list, and correct CSRF cookie/header wiring; verify early.
- **`snake_case` discipline** — do not introduce a camelCase transform layer; keep field
  names identical to the API.
- **Under-18 guardian branching** — evaluate age at submission from birth date; guardian
  becomes required; retain the snapshot.
- **Immutable fee snapshots** — never recompute historical fees from current course prices
  on the client.
- **Never trust client-side authz** — guards are UX; the server decides. Don't gate on
  client-held role claims for anything security-relevant.
- **Keep it JavaScript** — no TypeScript migration; express contracts with Zod.
- **Uploads & privacy** — passport photos/documents: enforce type/size on the client as a
  courtesy, but treat the server as the authority; never log PII.
