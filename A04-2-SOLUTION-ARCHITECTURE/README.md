# TrieDatum Website Modernization — Solution Architecture

> **Producer:** Solution Architect agent (governance & structural planning role — blueprints only, no production code).
> **Source requirements:** [`../A01-2-REQUIREMENTS/`](../A01-2-REQUIREMENTS/) — 27 Epics / 80 Stories produced by the Analyst agent, covering the migration of the TrieDatum marketing site (`TDWebsite`, 23 static Themeholy HTML pages) to the target stack below.
> **Target platform:** **Next.js 14 (App Router)** front end + **Strapi v5 (TypeScript)** headless CMS + **PostgreSQL**, delivered as an **npm-workspaces monorepo** (`apps/web`, `apps/cms`, `packages/shared`, `packages/seed`, `infra/`) to be built at `TDWebsite2`.
> **Downstream consumers:** the **Developer agent** (persona-mapped to `next-porter` / `strapi-modeler` / `cms-extender` / `deploy-engineer` / `seo-migrator` / `integration-engineer`, implements the components) and the **QA Architect agent** (derives the comprehensive test plan). Both use these documents *together with* the requirements.

---

## What this document set is

A **component-oriented** solution architecture for a from-scratch build. The governing constraint from the engagement (see `A00-1-STARTING-IMPORTANT-PROMPTS/a04-solution-architect-startingprompt.md`):

> The solution must be a set of well-defined functional components — pages/routes, API routes, CMS content types, and a shared typed data-access client — with clean, well-defined interfaces for parameter and data exchange. The content model must cover every Story in the requirements. The architecture must define how the front end fetches content from the CMS, how content changes propagate to the statically generated site (rendering strategy + cache invalidation/revalidation), and how the lead-capture/contact form is handled server-side.

Every component here is specified so the Developer agent's persona-scoped subagents (`next-porter`, `strapi-modeler`, `cms-extender`, `deploy-engineer`, `seo-migrator`, `integration-engineer`, …) can build it against an explicit contract, and so the QA Architect agent can test each contract in isolation.

---

## Reading order

| # | Document | Purpose |
|---|----------|---------|
| 0 | [00-solution-architecture-overview.md](00-solution-architecture-overview.md) | Executive summary, layered architecture (client/CDN → Next.js SSG+ISR → Strapi CMS → PostgreSQL → infra), C4 context/container diagrams, technology stack, non-functional targets, decision log, risks/open questions. **Start here.** |
| 1 | [01-component-architecture.md](01-component-architecture.md) | The authoritative component catalog — **every** `PAGE-*`/`SEC-*`/`API-*`/`CMS-*`/`SVC-*`/`INFRA-*` ID referenced anywhere in the requirements, each with owning app, file-path convention, responsibility, and implemented Epic(s). |
| 2 | [02-data-architecture-and-content-model.md](02-data-architecture-and-content-model.md) | The full Strapi content-type/component schema: 8 content types + 3 shared components, field-level types, relations, ER diagram, permission matrix. |
| 3 | [03-domain-ontology.md](03-domain-ontology.md) | The starting domain ontology — concepts (classes), attributes, object/relationship properties, and business-rule axioms, independent of physical storage. |
| 4 | [04-content-editing-pipeline-and-data-exchange.md](04-content-editing-pipeline-and-data-exchange.md) | The end-to-end publish → revalidate → CDN-serve pipeline in full sequence detail, failure modes, and the timed-ISR fallback contract. |
| 5 | [05-security-and-nfr.md](05-security-and-nfr.md) | Strapi permission hardening, secret handling, performance/availability targets, and PII handling for contact-submission data. |
| 6 | [06-requirements-coverage.md](06-requirements-coverage.md) | **Traceability evidence** — every one of the 27 Epics mapped to the component(s) that implement it. Proves complete coverage; flags gaps. |
| — | [adr/](adr/) | Architecture Decision Records for the six load-bearing decisions. |

---

## The decisions that shape everything (see [adr/](adr/))

| ADR | Decision |
|-----|----------|
| [ADR-001](adr/ADR-001-nextjs-ssg-isr-rendering-strategy.md) | **Next.js 14 App Router, SSG + ISR** as the default rendering strategy for every content-backed route. |
| [ADR-002](adr/ADR-002-strapi-v5-postgresql-headless-cms.md) | **Strapi v5 + PostgreSQL** as the headless CMS and its backing store. |
| [ADR-003](adr/ADR-003-on-demand-revalidation-webhook-with-timed-isr-fallback.md) | **On-demand revalidation webhook** (Strapi lifecycle hook → secret-gated `POST /api/revalidate`) with a **timed ISR fallback** (`revalidate: 3600`) that the site's correctness never depends on. |
| [ADR-004](adr/ADR-004-lift-and-shift-css-strategy.md) | **Lift-and-shift CSS** — reuse the legacy Themeholy/Bootstrap compiled class names verbatim for v1, not a Tailwind/CSS-Modules rewrite. |
| [ADR-005](adr/ADR-005-npm-workspaces-monorepo-with-apps-cms-hoist-exclusion.md) | **npm-workspaces monorepo** with `apps/cms` deliberately **excluded from hoisting** to resolve the `ajv@6` (Next/ESLint) vs `ajv@8` (Strapi) collision. |
| [ADR-006](adr/ADR-006-hostinger-vps-pm2-nginx-cloudflare-hosting-topology.md) | **Single Hostinger VPS**, Nginx reverse proxy + PM2 fork-mode processes + PostgreSQL, fronted by **Cloudflare**. |

---

## Scope & guardrails

- These are **blueprints only** — no production source code. Implementation is delegated to the Developer agent's builder personas.
- This document set describes the architecture **being designed** for a system about to be built. Where the target repository (`TDWebsite2`) is referenced for structural grounding (real route names, real Strapi content-type folder conventions, the already-resolved `ajv` hoist decision recorded in its root `package.json`), it is cited as **precedent for the design**, not as evidence of a finished, already-deployed product — most of `TDWebsite2` (hosting cutover, production secrets, sitemap/robots generation, several Epics) remains to be built against this document set.
- Where an internal API, legacy behavior, or external service is unverifiable from the requirements, it is flagged under **`[RISKS / OPEN QUESTIONS]`** in the relevant document and consolidated in the overview.
- Detailed **security control selection** and **test strategy** are downstream concerns for the Security Reviewer and QA Architect agents respectively — this set defines what they review/test against.
