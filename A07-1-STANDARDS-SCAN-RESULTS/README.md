# STANDARDS-SCAN-RESULTS

All **coding-standards / code-quality** scanning output for the **TrieDatum website modernization**
(`tdm-website-nextjs-strapi-modernize`, target repo `TDWebsite2`), produced by the **Standards
Checker / Enforcer agent** (#7) of the TrieDatum Agentic SDLC.

This directory is the single home for standards artifacts on this project. **General, durable
guidance & findings** live separately from **per-run defect records**, so a defect can always be
traced to the exact scanning run that produced it.

```
A07-1-STANDARDS-SCAN-RESULTS/
├── README.md                              ← (this file) structure, scope, how to read
├── guidelines-and-findings/               ← durable reports, methodology, guidance
│   ├── standards-profile-and-methodology.md   ← rule profile, tooling, how a scan runs
│   ├── audit-20260701-full-scaffold.md        ← narrative audit of this run (START HERE)
│   └── architecture-and-drift-review.md       ← A04-2 solution architecture vs. actual apps/ code
└── standards-defects/                     ← individual defects, grouped by scan run
    ├── run-20260701-100000/                    ← this run's findings
    │   ├── README.md                           ← run summary + defect index
    │   ├── defects-manifest.json                ← machine-readable manifest (bulk upload)
    │   ├── defects-import.csv                   ← CSV for tracker bulk import
    │   └── STD-0N-*.md                          ← one tracker-ready defect per finding
    └── run-20260701-100000-fixes/               ← disposition of each defect from this run
        ├── README.md
        └── STD-0N-fix.md                        ← honest fixed-vs-documented-only record
```

## What was scanned

At the time of this run, the target monorepo (`TDWebsite2`) is a **very early code skeleton**, not a
finished application:

- `apps/web/` — `package.json` (Next.js 14.2, React 18, TS 5.4, Vitest), `components/layout/SiteHeader.tsx`,
  `components/layout/SiteFooter.tsx`, `app/api/contact/route.ts`, `app/api/revalidate/route.ts`.
- `apps/cms/` — `package.json` (Strapi 5.0.0, `pg`, Jest), `src/index.ts` (lifecycle bootstrap),
  `src/api/case-study/content-types/case-study/schema.json`, `src/api/global/content-types/global/schema.json`,
  `src/components/shared/{link,seo,social-link}.json`.
- No root-level workspace `package.json`, `tsconfig.json`, ESLint config, or `next.config.js` exist yet
  anywhere in the repo.
- `A04-2-SOLUTION-ARCHITECTURE/` has only document `00` + `README.md` written; documents `01`–`06` and
  `adr/*.md` are not yet authored (the `adr/` directory is empty).

This scan therefore evaluates **what exists** against the coding-standards profile the target stack
implies (TS strict, Next.js App Router conventions, Strapi schema conventions, accessibility basics),
and flags **drift/incompleteness honestly** rather than inventing a false "clean bill of health."

## Scope of this agent — what IS and ISN'T here

The Standards Enforcer checks **coding quality, style, structure, documentation, dependency hygiene,
naming, architecture conformance, and approved/forbidden patterns**. It is explicitly **not** a
security scanner.

| In scope (here) | Out of scope (elsewhere) |
|---|---|
| Component size, prop typing, accessibility attributes, naming, config hygiene | Security vulnerabilities, secret handling → `A08-1-SECURITY-SCAN-RESULTS/` |
| Missing/absent tooling config (tsconfig, ESLint, README) | Failing tests / business-logic correctness → Bug Fixing agent |
| Doc-vs-code drift (solution architecture vs. `apps/`) | System design decisions themselves → Solution Architect (`A04-2`) |

> **CRITICAL severity is reserved exclusively for security findings** and is therefore never used by
> this agent.

## Operating mode for this run — DETECT-ONLY (no PR gate)

This scan ran **outside** a CI/PR pipeline, against a project this agent does not have write access
to modify (`apps/`, `packages/`, and the other `A0N-*` folders are out of scope for this task — see
`guidelines-and-findings/audit-20260701-full-scaffold.md` §1). Its job is to **identify and register**
defects; correction happens later, in a separate Bug-Fixing/developer pass. Nothing in this folder
edits `apps/` or `packages/` source.

## Latest run

| | |
|---|---|
| **Run** | `run-20260701-100000` (2026-07-01 10:00:00 local) |
| **Findings** | 9 — 0 Critical · 1 High · 5 Medium · 3 Low |
| **Headline** | The skeleton is small and internally consistent where it exists (clear WHY-comments, epic traceability, honest env-var no-op fallbacks), but it is missing nearly all of the **project-level tooling scaffolding** (no `tsconfig.json`, no ESLint config, no root workspace manifest) that the coding-standards profile requires, plus a handful of accessibility and hardcoded-value gaps in the two UI components that do exist. |
| **Advisory call** | **CONDITIONAL** — no blocking security-class or architecture-violation defects, but the missing `tsconfig.json` (STD-01) should land before any further `apps/web` code is written, since `npm run typecheck` cannot yet enforce TS strict mode. |
| **Start here** | [`guidelines-and-findings/audit-20260701-full-scaffold.md`](guidelines-and-findings/audit-20260701-full-scaffold.md) |

## How to read this directory

1. **Start** with the narrative audit — [`audit-20260701-full-scaffold.md`](guidelines-and-findings/audit-20260701-full-scaffold.md).
2. For **how** the scan was performed (rule profile, methodology), read
   [`standards-profile-and-methodology.md`](guidelines-and-findings/standards-profile-and-methodology.md).
3. For **architecture & drift** against `A04-2-SOLUTION-ARCHITECTURE`, read
   [`architecture-and-drift-review.md`](guidelines-and-findings/architecture-and-drift-review.md).
4. To **act on** a defect, open the matching `STD-NN-*.md` in
   [`standards-defects/run-20260701-100000/`](standards-defects/run-20260701-100000/), and its
   disposition in [`standards-defects/run-20260701-100000-fixes/`](standards-defects/run-20260701-100000-fixes/).

## Uploading defects to a tracker

Defect files are **generated, not pushed**. Use `defects-import.csv` (CSV import) or
`defects-manifest.json` (drive a tracker API) when the team explicitly requests an upload and names
the destination.
