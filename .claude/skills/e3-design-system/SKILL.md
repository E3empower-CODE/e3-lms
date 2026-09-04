---
name: e3-design-system
description: The E3 Empower LMS design system — institutional green palette and tokens, CSS-Modules component conventions, React Hook Form + Zod forms, the four required data-states, responsive breakpoints, and WCAG 2.2 AA rules. Use whenever building, reviewing, or styling any frontend UI, component, layout, or form in this repo.
---

# E3 Empower LMS Design System

Apply this whenever you build or modify frontend UI. It encodes the institutional
visual system from `PLAN.md` (UI Direction) and the accessibility/responsiveness
requirements the project treats as acceptance criteria — not polish. Styling is
**CSS Modules + design tokens**; JavaScript only.

## 1. Tokens

All visual values come from `frontend/src/styles/tokens.css` as CSS custom properties.
**Never hardcode hex, spacing, or radii in components** — reference the tokens.

Core palette:

| Token | Value | Use |
| --- | --- | --- |
| `--color-primary` | `#178A52` | primary actions, active nav, brand |
| `--color-primary-dark` | `#0E5C3A` | hover/active, text-on-light needing contrast |
| `--color-primary-soft` | `#EAF6EF` | tinted surfaces, selected rows, badges |
| `--color-on-primary` | `#FFFFFF` | text/icons on a primary fill |
| `--color-bg` | `#F7F9F8` | app background |
| `--color-surface` | `#FFFFFF` | cards, panels, inputs |
| `--color-border` | `#DDE5E0` | dividers, input borders |
| `--color-text` | `#18201C` | body + headings |
| `--color-text-muted` | `#66736C` | secondary text |

Semantic status tokens (`--color-success|warning|error|info` + `*-soft`) exist for
alerts, badges, and validation. Spacing (`--space-*`, 4px base), radii (`--radius-*`,
modest), typography (`--text-*`, `--font-*`), elevation (`--shadow-*`), and layout
(`--sidebar-width`, `--header-height`, `--touch-target`) are all tokenized.

**Contrast:** verify any text/background pair meets **WCAG 2.2 AA** (4.5:1 normal,
3:1 large/UI). `--color-primary` fills use `--color-on-primary` text; for green text
on light surfaces prefer `--color-primary-dark`. Never rely on color alone to convey
state — pair with an icon, label, or shape.

## 2. Component conventions

- **CSS Modules only:** every component ships a colocated `Component.module.css`;
  import as `styles` and reference `className={styles.root}`. No global class soup, no
  inline style objects for anything themeable, no CSS-in-JS.
- **Structure:** small, composable components. Shared primitives (Button, Input, Select,
  Card, Table, Badge, Modal, Drawer, Alert, Spinner, EmptyState) live in
  `src/components/`; feature-specific UI lives under `src/features/<domain>/`.
- **Icons:** `lucide-react`, given an accessible name or `aria-hidden` when decorative.
- **Restraint** (per `PLAN.md`): avoid excessive gradients, glass/blur effects,
  oversized rounded cards, and gratuitous animation. Modest radii, restrained elevation.

## 3. Forms — React Hook Form + Zod

- Define a **Zod schema** per form; wire with `@hookform/resolvers/zod`.
- Field names are **`snake_case`** to match the API payload (`API.md`) — no client-side
  camel/snake translation layer.
- Every input has a programmatically associated `<label>`; errors are rendered with
  `aria-invalid` + `aria-describedby` and announced via a live region.
- Map server errors from the `{ error: { details } }` envelope back onto fields with
  `setError`; show the envelope `message` as a form-level alert.
- Disable submit while pending; never double-submit state-changing requests.

## 4. The four data-states

Every async/data-driven view **must** handle all four explicitly — never render a blank
screen or an unguarded `.map`:

1. **Loading** — skeleton or spinner with an accessible busy label.
2. **Empty** — a purposeful empty state (what it is, how to add the first item).
3. **Error** — human-readable message from the error envelope + a retry affordance.
4. **Success** — the data.

## 5. Responsive & layout

- **Mobile-first.** Author base styles for small screens; layer breakpoints up.
- Validate layouts at **375, 430, 768, 1024, 1280, 1440 px**.
- **Navigation:** persistent desktop **sidebar** (`--sidebar-width`); **drawer** on
  mobile with a focus-trapped, escapable overlay.
- **Dense tables** degrade to stacked cards or horizontal-scroll containers on narrow
  screens — never overflow the viewport.
- Interactive targets are at least `--touch-target` (44px).

## 6. Accessibility — WCAG 2.2 AA (required)

- Full **keyboard** operability; logical tab order; no keyboard traps (except intended,
  escapable modals/drawers).
- **Visible focus** on every interactive element (`--focus-ring`); never remove outlines
  without a replacement.
- Labels/roles on all controls; meaningful `alt` text; decorative images `alt=""`.
- Respect `prefers-reduced-motion` (tokens already zero out `--transition`).
- Announce route changes and async results to assistive tech (live regions / focus moves).
- Meet contrast minimums (see §1).

## 7. Reference

- Tokens: `frontend/src/styles/tokens.css`
- Build plan & architecture: `frontend/FRONTEND_PLAN.md`
- API contract (envelopes, auth, snake_case): `API.md`
- Product/UI direction & roles: `PLAN.md`
