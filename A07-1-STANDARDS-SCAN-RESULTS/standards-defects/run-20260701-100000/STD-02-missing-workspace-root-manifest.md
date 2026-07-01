---
defect_id: STD-02
title: "No root package.json / npm-workspaces manifest for the monorepo"
type: standards
severity: Medium
priority: P2
status: Open
rule_ids: ["HYG-03"]
category: "project hygiene / monorepo structure"
component: "repo root"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Deploy Engineer / Front-End Engineer"
labels: ["standards", "monorepo", "workspaces", "medium"]
affected_files:
  - "package.json (repo root — does not exist yet)"
epic_link: "EP-27 — CMS Platform, SEO, Redirects, Analytics & Hosting"
fix_within: "before packages/shared or packages/seed are scaffolded"
related: ["STD-01"]
---

# [STD-02] No root `package.json` / npm-workspaces manifest

## 1. Summary
`A04-2-SOLUTION-ARCHITECTURE/00-solution-architecture-overview.md` §6 and ADR-005 specify an
**npm-workspaces monorepo** (`apps/web`, `apps/cms`, `packages/shared`, `packages/seed`) with
`apps/cms` deliberately excluded from hoisting to avoid an `ajv@6`/`ajv@8` collision. A directory
search at the repo root finds no `package.json` at all — only `apps/web/package.json` and
`apps/cms/package.json` exist, each currently standalone.

## 2. Severity & rule mapping
**Severity: Medium.** Not launch-blocking at skeleton stage (each package still runs its own scripts
independently), but every day this is deferred, it gets more likely that `apps/web` and `apps/cms`
grow independent lockfiles/dependency trees that are harder to reconcile once `packages/shared` needs
to be consumed by both.

## 3. Exact locations & evidence
- Repo root: no `package.json` present (confirmed by directory listing).
- `A04-2-SOLUTION-ARCHITECTURE/README.md` "Scope & guardrails" describes "the already-resolved `ajv`
  hoist decision recorded in its root `package.json`" as **precedent for the design** — this sentence
  should not be read as evidence the root manifest already exists; see
  `guidelines-and-findings/architecture-and-drift-review.md` §2.3 for the full drift note.

## 4. Why it matters
`packages/shared` (the one typed seam ADR-independent principle P2 requires between `apps/web` and
`apps/cms`) has nowhere to be declared as a workspace member yet. `apps/web/app/api/contact/route.ts`
currently calls `fetch()` directly against the Strapi REST API precisely because there is no shared
package to import — see the related drift note in `architecture-and-drift-review.md` §2.2.

## 5. Recommendation
Add a root `package.json`:
```json
{
  "name": "tdwebsite2",
  "private": true,
  "workspaces": ["apps/web", "packages/*"],
  "scripts": {
    "dev:web": "npm run dev -w apps/web",
    "build:web": "npm run build -w apps/web"
  }
}
```
Per ADR-005, `apps/cms` stays **outside** the `workspaces` array (its own standalone `package.json`
and lockfile) to keep Strapi's `ajv@8` from colliding with `ajv@6` pulled in by Next/ESLint.

## 6. Acceptance criteria
- [ ] Root `package.json` exists with `"workspaces": ["apps/web", "packages/*"]` (or equivalent).
- [ ] `apps/cms` is confirmed to remain un-hoisted (own lockfile, not listed in `workspaces`).
- [ ] `npm install` from repo root succeeds and does not attempt to hoist `apps/cms`'s dependencies.

## 7. References
- ADR-005 (`A04-2-SOLUTION-ARCHITECTURE/adr/` — not yet authored; decision summarized in `00` §6/§9).
- `guidelines-and-findings/architecture-and-drift-review.md` §2.3.
