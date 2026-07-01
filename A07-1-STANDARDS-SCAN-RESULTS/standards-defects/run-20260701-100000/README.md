# Standards Defects — Scan Run `run-20260701-100000`

**Scan initiated:** 2026-07-01 10:00:00 (local)
**Target:** `tdm-website-nextjs-strapi-modernize` @ `apps/web/`, `apps/cms/` (the full code skeleton
that exists at time of scan)
**Detected by:** Standards Checker / Enforcer agent (#7)
**Mode:** DETECT-ONLY — defects are **registered for later correction**, not auto-fixed. This agent's
run was scoped to `A07-1-STANDARDS-SCAN-RESULTS/` only; it did not and could not modify `apps/` or
`packages/` source.

## Contents

| File | Purpose |
|------|---------|
| `defects-manifest.json` | Machine-readable manifest of all defects (tooling / bulk upload) |
| `defects-import.csv` | Flat CSV for spreadsheet or defect-tracker bulk import |
| `STD-01 … STD-09 *.md` | One self-contained, Bug-Fixing-agent-ready defect per file |
| `README.md` | This file |

## Defect index

| ID | Severity | Title | Primary file |
|----|----------|-------|--------------|
| [STD-01](STD-01-missing-tsconfig-strict-mode.md) | **High** | No `tsconfig.json` in `apps/web` or `apps/cms` — TS strict mode unenforceable | `apps/web/`, `apps/cms/` |
| [STD-02](STD-02-missing-workspace-root-manifest.md) | Medium | No root `package.json`/`workspaces` manifest | repo root |
| [STD-03](STD-03-dangling-mobilemenu-reference.md) | Medium | `SiteHeader.tsx` references a non-existent `MobileMenu.tsx` | `apps/web/components/layout/SiteHeader.tsx` |
| [STD-04](STD-04-dropdown-missing-aria-and-keyboard-support.md) | Medium | Case-studies dropdown has no ARIA/keyboard affordance | `apps/web/components/layout/SiteHeader.tsx` |
| [STD-05](STD-05-hardcoded-notification-recipient.md) | Low | Hardcoded contact-notification recipient email | `apps/web/app/api/contact/route.ts` |
| [STD-06](STD-06-missing-eslint-config.md) | Medium | No committed ESLint config despite a `lint` script | `apps/web/package.json` |
| [STD-07](STD-07-missing-package-readmes.md) | Low | No package-level `README.md` in `apps/web`/`apps/cms` | `apps/web/`, `apps/cms/` |
| [STD-08](STD-08-strapi-schema-missing-length-constraints.md) | Low | Strapi schemas lack `maxLength` on string/text fields | `apps/cms/src/api/case-study/content-types/case-study/schema.json` |
| [STD-09](STD-09-missing-env-example.md) | Medium | No committed `.env.example` | `apps/web/`, `apps/cms/` |

**Totals:** 9 — 0 Critical · 1 High · 5 Medium · 3 Low.

## Severity → action (advisory; detect-only)

| Severity | Required action (normal PR gate) | This run |
|----------|----------------------------------|----------|
| Critical | Block release immediately | none |
| High | Fix before merge / before more code is written against it | 1 (STD-01) |
| Medium | Fix before this area ships past skeleton stage | 5 (STD-02, STD-03, STD-04, STD-06, STD-09) |
| Low | Fix opportunistically, same PR if convenient | 3 (STD-05, STD-07, STD-08) |

> **Advisory call:** **CONDITIONAL** — no Critical/High-security or architecture-violation findings.
> Close STD-01 before more TypeScript is added to `apps/web`/`apps/cms`; the rest can land alongside
> the next feature PR that touches the same area.

## Defect file format

Every `STD-NN-*.md` opens with a **YAML frontmatter block** (`defect_id`, `severity`, `priority`,
`category`, `component`, `affected_files`, `assignee`, `labels`, `epic_link`), followed by: summary,
severity rationale, exact location/evidence, why it matters, recommendation, acceptance criteria.

## How to upload to a defect tracker

Frontmatter keys map directly onto common trackers (Jira, GitHub Issues, Azure Boards): **Title** ←
`title` · **Description** ← markdown body · **Severity/Priority** ← `severity`/`priority` ·
**Labels/Components** ← `labels`/`component`. Use `defects-import.csv` for CSV import or
`defects-manifest.json` to drive a tracker API. Nothing here has been pushed to any tracker — request
that explicitly and name the destination.
