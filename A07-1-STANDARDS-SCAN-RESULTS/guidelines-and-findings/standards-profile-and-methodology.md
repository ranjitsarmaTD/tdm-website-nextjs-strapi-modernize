# Standards Profile & Scan Methodology

> Defines **what "good" means** for this stack (the rule profile) and **how a scan is run** against
> `TDWebsite2`. Written against the target architecture in `A04-2-SOLUTION-ARCHITECTURE/00-solution-architecture-overview.md`
> and the requirements conventions in `A01-2-REQUIREMENTS/00-overview-and-architecture.md`.

## 1. Stack-specific coding-standards profile

### 1.1 TypeScript (both `apps/web` and `apps/cms`)

| Rule | Requirement | Rationale |
|---|---|---|
| TS-01 | `strict: true` in every package's `tsconfig.json` (`noImplicitAny`, `strictNullChecks`, etc. all on) | Both apps ship `typescript: ^5.4.0` as a dependency; strict mode is the floor for a from-scratch TS project. |
| TS-02 | No `any` except at an explicitly-commented untyped third-party boundary | Matches the sibling `Claude Workspace` builder-platform convention this org uses elsewhere; keeps the `packages/shared` typed-client contract meaningful. |
| TS-03 | Exported component props and API route request/response shapes are named `interface`s, not inline object types | `SiteHeaderProps`, `SiteFooterProps`, `ContactPayload`, `RevalidateBody` already follow this — the standard to hold the rest of the codebase to. |
| TS-04 | File/component size: soft ceiling ~300 lines for a single component, hard flag past ~500 | Marketing-site components are small by nature; a component approaching this size is a sign it should split into a section + sub-components. |

### 1.2 Next.js 14 App Router conventions (`apps/web`)

| Rule | Requirement |
|---|---|
| NEXT-01 | Server Components by default; `"use client"` only on components that need browser APIs or interactivity (matches ADR-001's SSG+ISR intent). |
| NEXT-02 | Every content-backed route declares `revalidate` (timed ISR fallback) — never relies solely on the on-demand webhook (ADR-003). |
| NEXT-03 | API routes validate request bodies server-side and never trust client-side-only validation (contact route already does this). |
| NEXT-04 | Secrets/config read via `process.env.*` with an explicit fallback or a documented "unconfigured = no-op" contract — never hardcoded (both API routes mostly follow this; see STD-05). |
| NEXT-05 | A committed `next.config.js` exists once any route needs `redirects()`, `images`, or other config — required for the 23-legacy-URL 301 requirement (EP-24). |

### 1.3 Strapi v5 schema conventions (`apps/cms`)

| Rule | Requirement |
|---|---|
| CMS-01 | Every collection type declares `draftAndPublish` explicitly (not left to the Strapi default) so editorial workflow intent is visible in the schema file itself. |
| CMS-02 | String/text fields that map to UI copy declare reasonable `maxLength`/`minLength` constraints, not just a bare `type: "string"` — prevents unbounded content breaking lift-and-shift layout (ADR-004). |
| CMS-03 | Shared field groups live under `src/components/<namespace>/*.json` and are referenced by `component` name, never duplicated inline across content types. |
| CMS-04 | Lifecycle hooks (`src/index.ts`) fail soft — a failed webhook call must never throw out of the hook and block the underlying Strapi write. |

### 1.4 Accessibility basics (applies to any rendered markup in `apps/web`)

| Rule | Requirement |
|---|---|
| A11Y-01 | Any element that reveals a submenu/dropdown on interaction exposes `aria-haspopup`/`aria-expanded` and is operable via keyboard (not hover/click-only on a bare `<a>` or `<li>`). |
| A11Y-02 | Every `<nav>` has an `aria-label` distinguishing it from other navs on the page (already followed in `SiteHeader`/`SiteFooter`). |
| A11Y-03 | Images (once real `<img>`/`next/image` usage lands, replacing the current `image: string` placeholders) carry meaningful `alt` text, CMS-editable where the image is CMS-sourced. |

### 1.5 Project hygiene

| Rule | Requirement |
|---|---|
| HYG-01 | Every publishable package (`apps/web`, `apps/cms`, future `packages/shared`, `packages/seed`) has its own `README.md` describing purpose, scripts, and required env vars. |
| HYG-02 | Every env var referenced in code (`STRAPI_URL`, `STRAPI_REVALIDATE_SECRET`, `RESEND_API_KEY`, `NEXT_WEB_URL`, `APP_KEYS`, DB credentials) is enumerated in a committed `.env.example` at the owning package. |
| HYG-03 | Root-level workspace manifest (`package.json` with `"workspaces"`) exists and matches ADR-005's `apps/cms` hoist-exclusion decision once workspaces are wired up. |

## 2. Severity model

| Severity | Meaning | Example from this stack |
|---|---|---|
| Critical | Reserved for security findings — never used by this agent | — |
| High | Blocks correct enforcement of a rule this profile depends on, or will actively mislead the next contributor | Missing `tsconfig.json` — `npm run typecheck` has nothing to enforce strict mode against |
| Medium | Real defect, should be fixed before the affected area ships past skeleton stage | Missing accessibility wiring on the case-studies dropdown |
| Low | Style/hygiene nit, fix opportunistically | Missing package `README.md` |
| Info | Noted for awareness, no action required | — |

## 3. Scan methodology (this run)

1. **Inventory** — enumerate every file under `apps/web` and `apps/cms` (11 files at time of scan) plus the sibling `A04-2-SOLUTION-ARCHITECTURE` docs, to know what exists before judging it.
2. **Static read-through** — read every source/schema file in full (not sampled); check each against §1's rule tables.
3. **Config-presence check** — search for `tsconfig*`, `.eslintrc*`, `next.config*`, `README*` under `apps/` (all absent at scan time — see STD-01, STD-06, STD-07).
4. **Cross-reference check** — verify that names referenced in comments/imports (e.g. `MobileMenu.tsx`) actually exist as files (found one dangling reference — STD-03).
5. **Drift check** — compare `A04-2-SOLUTION-ARCHITECTURE` (docs 00/README only, at time of scan) against the actual `apps/` skeleton; see `architecture-and-drift-review.md`.
6. **Write-up** — one `STD-NN-*.md` per distinct, independently-fixable finding, with exact file/line evidence, a concrete recommendation, and an owning Epic/Story where the requirements set already names one.

This run did **not** execute `tsc`/`eslint`/`strapi` CLI tooling directly (no `tsconfig.json`/ESLint
config exists yet to run them against — that absence is itself STD-01/STD-06); findings are from
direct source reading against the profile above.
