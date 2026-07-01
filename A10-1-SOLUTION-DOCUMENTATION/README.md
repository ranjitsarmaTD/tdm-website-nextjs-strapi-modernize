<!-- Last updated: 2026-07-01 -->

# TrieDatum Website Modernization — Solution Documentation

**Audience:** Front-End Engineer · CMS Engineer · Content Editor · Deploy Engineer · SEO Engineer · Site Administrator

This is the entry point for the **delivered-solution documentation** of the TrieDatum website
modernization: the migration of the legacy static marketing site (`TDWebsite` — 23 Themeholy
Bootstrap 5 / jQuery HTML pages, a `mail.php` contact handler, no data layer, no build pipeline)
to a **Next.js 14 + Strapi v5 + PostgreSQL** headless-CMS stack (`TDWebsite2`, an npm-workspaces
monorepo of `apps/web` + `apps/cms` + `packages/shared` + `packages/seed` + `infra/`).

It is generated from, and stays consistent with, the upstream source-of-truth bodies of work in
this repository:

| Upstream area | Folder | What it holds |
|---|---|---|
| Requirements | [`A01-2-REQUIREMENTS/`](../A01-2-REQUIREMENTS/) | 27 Epics / 80 Stories + role catalog, glossary, target architecture |
| Test strategy | [`A02-2-TEST-STRATEGY/`](../A02-2-TEST-STRATEGY/) | Master strategy + coverage matrix |
| Solution architecture | `A04-2-SOLUTION-ARCHITECTURE/` (in progress) | Component architecture, ADRs |
| Implementation | `apps/`, `packages/`, `infra/` (target repo) | Code, content seed, deploy assets |

> This documentation **describes the solution as specified and as built to date**. Where an
> Epic/Story is designed but not yet wired into a running environment — the CI/CD pipeline, real
> CAPTCHA, the `bootcamp-program` collection type — it is marked explicitly rather than presented
> as delivered. See §"Verification status" below.

---

## What this solution is, in one paragraph

The legacy site fused content and presentation into hand-duplicated static HTML: the same
header/nav/footer markup copy-pasted across 23 pages, one hard-coded contact form posting to a
PHP mail script, and no mechanism for a non-technical editor to change a word without a code
deploy. The modernization **separates content from presentation** using a headless-CMS
architecture — a **Strapi v5** admin (backed by PostgreSQL) is the sole content authority, and a
**Next.js 14 App Router** front end renders that content as statically-generated, incrementally
revalidated pages behind a CDN. The two apps communicate only through a typed REST contract
(`packages/shared`), and an on-demand webhook keeps rendered pages fresh within seconds of a
publish. See [01 — Architecture Overview](01-architecture-overview.md).

---

## Document index

| # | Document | Audience | Read it when you need to… |
|---|----------|----------|---------------------------|
| 01 | [Architecture Overview](01-architecture-overview.md) | Front-End · CMS Engineer | Understand the container view, rendering strategy, sync contract, tech stack, and infra topology |
| 02 | [Content Model Dictionary](02-content-model-dictionary.md) | CMS Engineer · Front-End · Content Editor | Look up a content type/component field, its type, and where it renders |
| 03 | [Web API Reference](03-web-api-reference.md) | Front-End Engineer | Call `apps/web`'s own API routes, or see how `packages/shared` calls Strapi's REST API |
| 04 | [CMS Reference](04-cms-reference.md) | CMS Engineer · Site Administrator | Understand Strapi conventions: schema authoring, permissions, lifecycle hooks, draft & publish |
| 05 | [Content Operations Runbook](05-runbook-content-operations.md) | Content Editor | Publish/edit content day-to-day and verify it went live |
| 06 | [Deployment Runbook](06-runbook-deployment.md) | Deploy Engineer | Provision, deploy, or redeploy either app on the Hostinger VPS |
| 07 | [Incident & Recovery Runbook](07-runbook-incident-recovery.md) | Deploy Engineer · On-call | Respond to an outage, roll back a bad deploy, or restore from backup |
| 08 | [Troubleshooting Knowledge Base](08-troubleshooting-kb.md) | Support · Deploy Engineer · Content Editor | Diagnose a specific symptom (stale content, webhook 401, PM2 crash loop, hoist error) |
| 09 | [Release Playbook](09-release-playbook.md) | Release Manager · SEO Engineer · Team | Run the legacy→target cutover with go/no-go gates |
| 10 | [Security & Compliance Summary](10-security-compliance.md) | Site Administrator · Compliance · Developer | Review permission hardening, secret handling, and PII posture |
| 11 | [Traceability & Coverage](11-traceability-coverage.md) | QA · Product · Auditor | Trace a requirement/Epic → module → documentation section |

---

## The stack at a glance

| | `apps/web` | `apps/cms` |
|---|---|---|
| **Role** | Presentation — renders content, owns the public site's routing/SEO/UX | Content authority — the only place editors touch content |
| **Runtime** | Next.js 14 (App Router), Server + Client Components | Strapi v5 (TypeScript) |
| **Data store** | None (stateless; fetches from `apps/cms`) | PostgreSQL (SQLite in local dev only) |
| **Rendering** | SSG + ISR (`generateStaticParams`, `revalidate`) | Admin panel + REST API |
| **Talks to** | Strapi REST via `packages/shared` (read-only token) | PostgreSQL directly; POSTs to `apps/web`'s `/api/revalidate` |
| **Deployed as** | PM2 process `web`, behind Nginx on the apex/`www` domain | PM2 process `cms`, behind Nginx on `cms.` subdomain, IP-allowlisted admin |

---

## Verification status (as of this documentation pass)

- All 10 site routes render end-to-end from Strapi content (no hard-coded page bodies remain in
  `apps/web/app/`); legacy `.html` URLs 301 to their new routes.
- Contact form is live end-to-end: submit → `POST /api/contact` → Strapi `contact-submission`
  (public `create`-only) → optional Resend notification email.
- On-demand ISR revalidation is live: a Strapi lifecycle hook POSTs to `apps/web`'s secret-gated
  `/api/revalidate` on every create/update/delete of an editorial content type.
- **Not yet delivered / explicitly deferred** (do not report these as complete — see
  [11 — Traceability](11-traceability-coverage.md)):
  - Production deployment to the Hostinger VPS (target infra is documented and ready; the cutover
    itself is the next milestone — see [09 — Release Playbook](09-release-playbook.md)).
  - The CI/CD pipeline definition exists (`infra/github/deploy.yml`) but is **not yet** activated
    as a live `.github/workflows/` pipeline (`EP-27-S5`).
  - Cloudflare Turnstile on the contact form — a honeypot field is the only spam control today
    (`EP-18-S5`, deferred P4).
  - A dedicated `bootcamp-program` collection type — `/bootcamp` currently ships as one static,
    CMS-independent page (`EP-15-S4`, deferred).
  - Production secret rotation: `STRAPI_REVALIDATE_SECRET`, `APP_KEYS`, JWT secrets, and a scoped
    `STRAPI_API_TOKEN` must be minted for the production environment before go-live — see
    [10 — Security & Compliance](10-security-compliance.md).

---

## Conventions used in this documentation

- **Terminology** follows the project glossary: *Content type*, *Component*, *Global single
  type*, *Draft & publish*, *On-demand revalidation*, *Parity*, *Preserve-or-retire item* — see
  [`A01-2-REQUIREMENTS/00-overview-and-architecture.md §3`](../A01-2-REQUIREMENTS/00-overview-and-architecture.md).
- **Component IDs** use the requirements' fixed prefixes: `PAGE-*` (Next.js routes), `SEC-*`
  (section/layout components), `API-*` (`apps/web` API routes), `CMS-*` (Strapi content types),
  `SVC-*` (shared services/packages), `INFRA-*` (deployment/ops assets).
- **Epic/Story references** (e.g. `EP-18-S1`) link a documented behavior back to its requirement.
- Every document carries a freshness header (`<!-- Last updated: YYYY-MM-DD -->`) and an audience
  declaration.
- Work that is designed but not yet running in an environment is flagged **"designed, not yet
  activated"** or **"deferred (Pn)"** — never presented as delivered.

---

## Open items carried from requirements/architecture (status: unresolved)

These are known scope decisions and risks, **not** documentation gaps — they are owned outside
this documentation set and are surfaced here so no reader mistakes them for settled:

| # | Item | Owner |
|---|------|-------|
| O1 | `case8` case study has no homepage-carousel card on the legacy site (legacy showed 9 of 10); the CMS-driven carousel currently shows all 10 — needs a content-owner decision on a `featured` flag (`EP-21-S4`) | Content Editor + Front-End Engineer |
| O2 | Generic, duplicated SEO metadata on several legacy pages is a real content gap being fixed during migration, not preserved (`EP-24-S1`) | SEO Engineer |
| O3 | `about.html`'s disabled hero-slider block and disabled alternate team-bio carousel (with a name discrepancy) require a content-owner disposition (`EP-12-S1`, `EP-13-S2`) | Content Editor |
| O4 | Acceptance of the CI/CD pipeline's current "designed, not activated" state until a follow-on session enables it (`EP-27-S5`) | Deploy Engineer |
| O5 | Real CAPTCHA (Cloudflare Turnstile) vs. honeypot-only spam control on the contact form (`EP-18-S5`) | Site Administrator |
