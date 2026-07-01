---
defect_id: SEC-07
title: "CI/CD not yet active — no automated dependency/secret scanning runs today"
type: security
severity: MEDIUM
status: Open
component: "INFRA-CI"
epic_story: "EP-27-S5"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "ci-cd", "supply-chain", "known-gap", "secret-scanning"]
affected_files:
  - "A01-2-REQUIREMENTS/09-cms-seo-and-platform.md"
---

# [SEC-07] CI/CD not yet active — no automated dependency/secret scanning runs today

## Description

`A01-2-REQUIREMENTS/09-cms-seo-and-platform.md` (EP-27-S5) already, and honestly, documents that
`infra/github/deploy.yml` (a two-job verify + deploy pipeline) is designed and version-controlled
but **explicitly not yet copied into an active `.github/workflows/` directory** — confirmed at scan
time: no `.github/workflows/` directory exists in this repo. EP-27-S5's own acceptance criteria
correctly flag the risk of anyone claiming "CI/CD is already automated" as a documentation-review
failure.

This defect exists to name the specific **security** consequence of that already-disclosed gap,
which EP-27-S5 itself does not spell out: because no GitHub Action currently runs on any push or
PR, there is today no automated `npm audit`/SCA dependency-vulnerability scan and no secret-scanning
check (e.g. gitleaks/truffleHog-style scanning, or even GitHub's own push-protection if not yet
enabled at the repo/org level) running on this codebase. Every commit to `main` currently lands
without either check.

## Impact

A dependency with a known CVE, or an accidentally-committed secret (API key, database credential,
`STRAPI_REVALIDATE_SECRET`, `RESEND_API_KEY`), could be merged today with no automated gate to catch
it before or after merge — the only backstop is manual review. This compounds SEC-08 (no
`.env.example` yet, raising the odds of a real secret ending up typed somewhere ad hoc) and the
`ajv@6`/`ajv@8` un-hoisted install boundary noted in the dependency audit, which means a future
scanning setup must be scoped per-workspace, not just at the monorepo root, once added.

## Recommendation

1. This does **not** require activating the full `infra/github/deploy.yml` pipeline (which is
   reasonably being staged carefully given it includes SSH deploy credentials). Add a minimal,
   independent scanning-only workflow first — e.g. GitHub's native Dependabot alerts
   (`.github/dependabot.yml`, no secrets required) and secret-scanning/push-protection (a repo
   setting, not a workflow file) — both of which carry none of the deploy-credential risk that may
   be the reason the full pipeline isn't active yet.
2. When `infra/github/deploy.yml`'s verify job is eventually activated, include
   `npm audit --audit-level=high` (or an equivalent SCA step) scoped to each workspace
   (`apps/web`, `apps/cms`) given the un-hoisted `apps/cms` install boundary documented in
   `guidelines-and-findings/dependency-audit.md` §2.1.
3. Track activation of the minimal scanning-only workflow as a near-term, low-risk action distinct
   from — and not blocked on — the full EP-27-S5 CI/CD activation decision.
