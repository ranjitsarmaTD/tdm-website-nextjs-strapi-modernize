# Implementation Cross-Check — Requirements → Solution Architecture → Implementation

This document traces every Epic to its Solution Architecture component(s) and to what
actually exists in this repository's `apps/`/`packages/` tree, and states honestly
whether each is **fully implemented**, **partially implemented** (with what remains),
or a **gap**. It is a point-in-time audit, reconciled against the *actual* files on
disk — not against a plan's existence alone.

## Legend

| Status | Meaning |
|---|---|
| ✅ **Full** | Implemented, wired into a running app, unit-tested, and verified end-to-end against a live `apps/web`/`apps/cms` instance. |
| 🟡 **Partial** | A representative code skeleton exists under `apps/` or `packages/` with unit tests (`A05-1-UNIT-TESTS`), but is **not** running against a live Strapi/PostgreSQL instance — logic-drafted, not delivery-verified. |
| ⛔ **Gap** | Requirements (`A01-2-REQUIREMENTS`), test strategy (`A02-2-TEST-STRATEGY`) and solution architecture (`A04-2-SOLUTION-ARCHITECTURE`) exist; no implementation exists yet. |

> **What is live today: nothing.** No `npm install` has been run, no Strapi instance
> exists, no PostgreSQL database has been provisioned, and no deploy has happened.
> Every ✅ row would require that to change first — as of this audit, **the ceiling
> for any Epic is 🟡**, and most are ⛔. This mirrors the same honesty principle
> already applied throughout this project to `EP-27-S5` (CI/CD "designed, not yet
> active") and `A06`'s test-results run (0 executed / 5 blocked, no live environment).

## Summary scorecard (by Epic)

| Status | Epics |
|---|---|
| ✅ Full | none — no live environment exists yet to verify anything end-to-end *(0)* |
| 🟡 Partial | EP-01, EP-02, EP-18, EP-23, EP-26 *(5)* |
| ⛔ Gap | EP-03, EP-04, EP-05, EP-06, EP-07, EP-08, EP-09, EP-10, EP-11, EP-12, EP-13, EP-14, EP-15, EP-16, EP-17, EP-19, EP-20, EP-21, EP-22, EP-24, EP-25, EP-27 *(22)* |

**27 Epics total.** Every one has Requirements + Test Strategy + Solution Architecture
coverage (see `A02-2-TEST-STRATEGY/TS-COVERAGE-test-coverage-matrix.md` and
`A04-2-SOLUTION-ARCHITECTURE/06-requirements-coverage.md` — both reconcile 27/27).
This document only adds a fourth column: does *code* exist yet.

## Partial detail

| Epic | What exists | What's missing to reach Full |
|---|---|---|
| EP-01 — Header & Navigation | `apps/web/components/layout/SiteHeader.tsx` + unit tests | Mobile menu component (flagged as a real gap by `A07-1-STANDARDS-SCAN-RESULTS/STD-03`), wiring to the `global` content type via `packages/shared`, live Strapi data |
| EP-02 — Footer as CMS Data | `apps/web/components/layout/SiteFooter.tsx`, `apps/cms/src/api/global/content-types/global/schema.json` + unit tests | A running Strapi instance with a seeded `global` entry; `packages/shared` wiring from stub to real fetch |
| EP-18 — Contact Form Submission | `apps/web/app/api/contact/route.ts` + unit tests | Live Strapi `contact-submission` create endpoint to POST against; rate-limiting (`A08-1-SECURITY-SCAN-RESULTS/SEC-01`) |
| EP-23 — Strapi Content Modeling & Permissions | `global` + `case-study` schemas, `shared.seo`/`shared.link`/`shared.social-link` components + unit tests | The 5 remaining content types (`news-article`, `service`, `team-member`, `partner`, `testimonial`); the Public-role permission matrix itself is specified (`A04-2-SOLUTION-ARCHITECTURE/02-`, `A02-2-TEST-STRATEGY/TS-011`) but not configured in a running Strapi admin |
| EP-26 — On-Demand ISR / Revalidation Webhook | `apps/web/app/api/revalidate/route.ts`, `apps/cms/src/index.ts` lifecycle hook + unit tests | A running pair of `apps/web`/`apps/cms` instances to prove the webhook round-trip end-to-end; the timed-ISR fallback (`revalidate: 3600`) is not yet declared on any real route since no page routes exist yet |

## Gap detail (representative, not exhaustive — see each section's Story list for full detail)

- **Pages (EP-03–EP-17):** about/team, services, bootcamp, partnership, and every homepage section beyond the header/footer shell have full Epic/Story/test-plan/architecture coverage but zero page routes under `apps/web/app/` yet.
- **Content types (EP-20–EP-22):** `news-article`, `team-member`, `partner`, `testimonial` schemas are specified in `A04-2-SOLUTION-ARCHITECTURE/02-data-architecture-and-content-model.md` but not yet created under `apps/cms/src/api/`.
- **SEO/Analytics (EP-24–EP-25):** `generateMetadata` wiring, `sitemap.ts`/`robots.ts`, the 23-URL redirect table, GA4, and JSON-LD are all specified but not implemented.
- **Hosting (EP-27):** Nginx/PM2/PostgreSQL/deploy.sh/backup.sh are fully documented as runbooks (`A10-1-SOLUTION-DOCUMENTATION/06-runbook-deployment.md`) and an ADR (`ADR-006`) but nothing has been provisioned — there is no server, no database, no deploy target.

## Next steps to move Partial → Full

1. `npm install` at the repo root (this will immediately exercise `ADR-005`'s
   `apps/cms` hoist-exclusion for the first time — expect to hit and resolve the
   `ajv@6`/`ajv@8` collision it documents).
2. Provision a local PostgreSQL database per `A10-1-SOLUTION-DOCUMENTATION/06-runbook-deployment.md`.
3. `npm run cms:develop` to boot Strapi and register the two existing content types.
4. Run `A05-1-UNIT-TESTS` for real (`RESULTS.md` currently says "written, not executed" — replace that with a real pass/fail count).
5. Only then attempt `A06-1-SOLUTION-TESTS`' e2e/integration specs, which are currently 100% blocked per `testing-results/run-20260701-090000/summary.json`.
