# TrieDatum Website Modernization — Test Strategy & Plans

> **Producer:** QA / Test-Architect agent (strategic quality authority — strategy, layering, gates, coverage evidence; **no application or test code**).
> **Inputs:** [`../A01-2-REQUIREMENTS/`](../A01-2-REQUIREMENTS/) (27 Epics / 80 Stories across 9 sections) and the target repo `TDWebsite2` (Next.js 14 App Router + Strapi v5 + PostgreSQL npm-workspaces monorepo: `apps/web`, `apps/cms`, `packages/shared`, `packages/seed`, `infra/`).
> **Downstream consumer:** the engineering agents (`next-porter`/`feature-builder` for `apps/web`, `strapi-modeler`/`cms-extender` for `apps/cms`, `content-migrator` for `packages/seed`, `deploy-engineer` for `infra/`) that build and migrate each component **test-first** against these plans, and the `parity-auditor` agent that signs off visual/functional parity per the Definition of Done.
> **Framing note:** this document set is a **forward test strategy** for a system that has not yet been built or verified — `TDWebsite2` currently has no test runner configured (see `apps/web/package.json`, `apps/cms/package.json`). Every recommendation below specifies tooling and coverage targets to be put in place *as the migration proceeds*, not evidence of tests that already exist or already pass.

## What this folder contains

A complete, layered test strategy for migrating TrieDatum's static Themeholy marketing site (`TDWebsite`: 23 HTML pages, `mail.php`, no data layer, no build pipeline, no test suite) to `TDWebsite2` (Next.js 14 + Strapi v5 + PostgreSQL headless-CMS stack).

## Reading order

1. **[TS-000 — Master Test Strategy](TS-000-master-test-strategy.md)** — start here. The test pyramid adapted to a headless-CMS + SSG/ISR site, test types (including the mandatory visual+functional parity check), risk-based prioritization matching the requirements' P1–P4 scale, environments & test data, CI quality gates, and tooling. Every other document inherits it.
2. **Section test plans** (one per requirements section document, 1:1):
   - [TS-001 — Global Site Shell, Navigation & Footer](TS-001-global-shell-navigation-and-footer.md) (EP-01–EP-03)
   - [TS-002 — Homepage](TS-002-homepage.md) (EP-04–EP-11)
   - [TS-003 — About & Team](TS-003-about-and-team.md) (EP-12–EP-13)
   - [TS-004 — Services](TS-004-services.md) (EP-14)
   - [TS-005 — AI Bootcamp](TS-005-ai-bootcamp.md) (EP-15–EP-16)
   - [TS-006 — Partnership](TS-006-partnership.md) (EP-17)
   - [TS-007 — Contact & Lead Capture](TS-007-contact-and-lead-capture.md) (EP-18–EP-19)
   - [TS-008 — News, Case Studies & Testimonials](TS-008-news-case-studies-and-testimonials.md) (EP-20–EP-22)
   - [TS-009 — CMS Platform, SEO & Hosting](TS-009-cms-seo-and-platform.md) (EP-23–EP-27)
3. **Cross-cutting strategies:**
   - [TS-010 — NFR: Performance & Accessibility](TS-010-nfr-performance-and-accessibility.md)
   - [TS-011 — Security & Privacy](TS-011-security-and-privacy.md)
   - [TS-012 — Content Migration Fidelity](TS-012-content-migration-fidelity.md)
4. **[TS-COVERAGE — Coverage Matrix](TS-COVERAGE-test-coverage-matrix.md)** — evidence that every one of the 27 Epics and 80 Stories maps to ≥1 named plan and test layer, plus the preserve-or-retire / content-owner-decision items each plan must verify as *flagged*, not silently resolved.

## Test layers (legend used throughout)

U = unit · I = integration · C = contract · E = E2E/solution · V = visual/functional parity (desktop+mobile) · A11Y = accessibility · PERF = performance · SEC = security · SEO = SEO/redirect coverage · MIG = content-migration fidelity (seed/ETL correctness).

## Non-negotiables (from TS-000 + the requirements' Definition of Done)

- **Test pyramid enforced** — fix every defect at the lowest layer that expresses it; E2E/Playwright only for genuine multi-system journeys.
- **Visual + functional parity confirmed by `parity-auditor` (desktop + mobile)** is a per-story DoD gate, not an optional nice-to-have — see TS-000 §4.
- **Every legacy URL 301s; every content-backed page has unique SEO metadata** — verified by the redirect-coverage and metadata-uniqueness tests in TS-009/TS-012, gating launch.
- **Public Strapi API is exactly as wide as required and no wider** — `contact-submission` is create-only, no content type ever grants Public `update`/`delete` — verified in TS-011.
- **Preserve-or-retire / content-owner-decision items are never silently resolved by a test** — the test asserts that the decision is *recorded*, not that a particular disposition was chosen (see TS-COVERAGE §6).
- **No test suite exists yet** — this strategy specifies what must be stood up (Vitest/RTL, Strapi's Jest-based conventions, Playwright, Lighthouse CI, axe-core) as migration work proceeds, per TS-000 §7.

## Status & open items

All 13 planned documents in this set are complete. Items requiring a content-owner or architect decision before their tests are *fully* assertable (e.g. the `case8` orphan-page disposition, the Cognition partner-logo discrepancy, the Raj/Rajesh team-bio discrepancy, AI-Enabled Migrations' missing case-study link) are tracked as **flagged, not gaps** in [TS-COVERAGE §6](TS-COVERAGE-test-coverage-matrix.md#6-preserve-or-retire--content-owner-decision-tracking).

---
_Produced by the QA / Test-Architect agent. Strategy documents only — test code is implemented by the engineering agents building each component._
