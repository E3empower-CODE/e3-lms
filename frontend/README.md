# E3 Empower LMS — Frontend

React 19 + Vite 8 single-page app (JavaScript only). It implements the E3
Empower LMS interface against the API contract in [`../API.md`](../API.md).
Read [`../CLAUDE.md`](../CLAUDE.md) (golden rules) and
[`FRONTEND_PLAN.md`](./FRONTEND_PLAN.md) (architecture + phase map) before
changing anything, and follow the `e3-design-system` skill for UI.

## Stack

- **React 19 + Vite 8**, JavaScript only (no TypeScript — type contracts are Zod schemas).
- **react-router-dom 7** (data router, lazy route modules).
- **react-hook-form 7 + zod 4** for forms; **axios** for HTTP; **recharts** for charts; **lucide-react** for icons.
- **CSS Modules + design tokens** (`src/styles/tokens.css`) — no CSS-in-JS, no hardcoded colors.
- **oxlint** for linting; **vitest + Testing Library + MSW** for unit/integration; **Playwright** for E2E.

## Setup

```bash
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL, etc.
npm run dev                  # http://localhost:5173
```

Only `VITE_`-prefixed variables reach the browser; never put secrets in env files.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # production build
npm run lint       # oxlint
npm test           # vitest (watch); add -- --run for one pass
npm run test:e2e   # Playwright E2E (starts the dev server automatically)
```

## Project structure

```text
src/
  app/        router, lazy route modules, providers, root redirect
  layouts/    Public / Admin / Student / Instructor shells (sidebar + mobile drawer)
  routes/     ProtectedRoute (auth) and RoleRoute (role → 403) guards, 403/404 pages
  features/   one folder per domain (auth, registration, admissions, students,
              student, instructor, coursework, attendance, finance, certificates,
              reports) — each with its api.js, views, and colocated *.module.css
  components/ shared primitives (Button, Input, Select, Checkbox, Textarea,
              FileInput, Card, Badge, Alert, Spinner, EmptyState, DataState,
              ProgressBar, Modal, Tabs, Pagination, StatCard, ErrorBoundary)
  hooks/      cross-feature hooks (useAsync)
  lib/        apiClient (cookies + CSRF + error envelope), auth, roles,
              pagination, format
  styles/     tokens.css (source of truth), global.css
  test/       vitest setup + MSW mock server/handlers
e2e/          Playwright specs
```

## Conventions (non-negotiable)

- **Server-authoritative** — never compute permissions, scores, balances, or progress on the client; render from server responses.
- **Cookie auth, no token storage** — axios `withCredentials` + Django CSRF; nothing in `localStorage`/`sessionStorage` except a per-viewer assessment draft.
- **`snake_case`** on the wire; no camelCase transforms of API payloads.
- **Four data-states** — every async view handles loading / empty / error / success (use `DataState`).
- **Accessibility + responsive** — WCAG 2.2 AA, mobile-first, ≥44px touch targets.

## Testing

- **Unit** — pure helpers and components (`src/**/*.test.{js,jsx}`).
- **Integration (MSW)** — component tests mock the API with Mock Service Worker
  (`src/test/msw/`), asserting real axios calls, the response envelopes, and the
  four data-states. Unhandled requests fail the test. Example:
  `src/features/student/MyCourses.test.jsx`.
- **E2E (Playwright)** — `e2e/` drives the built app in a real browser. The
  current smoke suite runs without a backend (the app resolves to the public
  shell); the full register→certificate journey is added once the API exists.
  The config points at the environment's pre-installed Chromium — override with
  `PLAYWRIGHT_CHROMIUM_PATH`, or remove `launchOptions.executablePath` to use a
  Playwright-managed browser locally.
