# CLAUDE.md — E3 Empower LMS

Operating guide for AI sessions in this repo. Read this first, then defer to the
authoritative planning docs: **`PLAN.md`** (status + implementation order),
**`API.md`** (API contract), **`DATABASE.md`** (data model + invariants),
**`DEPLOYMENT.md`** (production shape).

## Stack

- **Backend** — Django REST framework, managed with **`uv`** (`backend/pyproject.toml`
  + `uv.lock`; never pip/Poetry/Conda). PostgreSQL is authoritative; Celery + Redis
  for background work. Apps live under `backend/apps/`; project config in
  `backend/config/`.
- **Frontend** — **React 19 + Vite 8, JavaScript only**. Router: react-router-dom 7.
  Forms: react-hook-form 7 + zod 4. HTTP: axios. Charts: recharts. Icons: lucide-react.
  Styling: **CSS Modules + design tokens** (`frontend/src/styles/tokens.css`).

The frontend build plan lives in **`frontend/FRONTEND_PLAN.md`** — consult it before
building UI. Design system rules are in the **`e3-design-system`** skill.

## Golden rules

These are non-negotiable and sourced from the planning docs. Do not deviate without
updating the docs first.

1. **Server-authoritative.** The frontend may hide unavailable actions, but the API
   enforces role and object-level authorization on **every** request (`PLAN.md` Roles
   and Access). Never trust client state for permissions, scores, balances, progress,
   or fees — render from server responses.
2. **JavaScript only.** Never convert the frontend to TypeScript (`README.md`). Type
   contracts are expressed with Zod schemas, not TS.
3. **Cookie auth, no token storage.** Authentication uses Django HTTP-only session
   cookies (`API.md` Authentication and CSRF). **Never** persist credentials or tokens
   in `localStorage`/`sessionStorage`. Axios uses `withCredentials`; state-changing
   requests send the Django CSRF token. `401` = not authenticated, `403` = not authorized.
4. **`snake_case` everywhere on the wire.** All JSON fields and query params are
   `snake_case`, matching DRF (`API.md` Conventions). Do not camelCase API payloads or
   silently transform them.
5. **Money and time.** Money is server-side `Decimal` (never float); fee snapshots are
   immutable historical data. Timestamps are UTC, displayed in the institution timezone.
6. **Response envelopes.** Collections return `{ "data": [...], "pagination": {...} }`;
   errors return `{ "error": { "code", "message", "details?", "request_id" } }`. Single
   resources return the serialized object directly. Build the API layer around these.
7. **Accessibility + responsiveness are requirements, not polish.** WCAG 2.2 AA;
   mobile-first; validate at 375/430/768/1024/1280/1440 px; ≥44px touch targets.

## Commands

Frontend (from `frontend/`):

```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # production build
npm run lint     # oxlint
npm test         # vitest (add -- --run for a single non-watch pass)
npm run test:e2e # playwright (once e2e specs exist)
```

Backend (from `backend/`, requires uv + PostgreSQL locally; not available in web sessions):

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
uv run pytest
uv run ruff check . && uv run ruff format --check .
uv run python manage.py makemigrations --check --dry-run
```

## Design tokens

The E3 institutional palette (from `PLAN.md` UI Direction) is defined once as CSS custom
properties in **`frontend/src/styles/tokens.css`** and consumed via CSS Modules. Core
values: primary `#178A52`, dark green `#0E5C3A`, soft green `#EAF6EF`, background
`#F7F9F8`, text `#18201C`, muted `#66736C`, border `#DDE5E0`. See the `e3-design-system`
skill for the full token set, states, and usage rules.

## Tooling notes

- **MCP** is intentionally session-level (GitHub and Figma are provided by the harness);
  there is **no committed project `.mcp.json`** and none is needed.
- **Session hook.** `.claude/hooks/session-start.sh` installs frontend deps and test
  tooling in web sessions so lint/build/tests run out of the box (registered in
  `.claude/settings.json`).
- Keep `.env`/secrets out of git; only `.env.example` files are committed. Only
  `VITE_`-prefixed vars reach browser code — never put secrets there.
