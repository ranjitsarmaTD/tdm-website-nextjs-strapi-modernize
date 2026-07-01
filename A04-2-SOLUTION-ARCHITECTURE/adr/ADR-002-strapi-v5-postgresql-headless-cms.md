# ADR-002 — Strapi v5 (TypeScript) + PostgreSQL as the headless CMS and its backing store

**Status:** Accepted

---

## Context

The legacy site has no CMS at all — every repeating structure (services, case studies, news, testimonials, partners, team) is hand-duplicated static markup, and the only centralized data is a footer JSON file fetched client-side. EP-23 requires a real content-modeling capability: 8 content types + 3 shared components (`02-data-architecture-and-content-model.md`), a `Public`-role permission matrix restricting anonymous access to exactly `find`/`findOne` on published editorial entries plus `create`-only on `contact-submission`, `draftAndPublish` workflow support, and lifecycle hooks that can notify the front end on every create/update/delete (feeding ADR-003). Content Editors are non-technical and need an admin UI, not direct database access.

## Decision

`apps/cms` is a **Strapi v5 (TypeScript)** headless CMS, backed by **PostgreSQL** in both local development and production. Content-type schemas live under `apps/cms/src/api/**`; shared field groups (`shared.link`, `shared.social-link`, `shared.seo`) live under `apps/cms/src/components/shared/**`. `apps/web` never queries PostgreSQL or imports Strapi internals directly — `packages/shared`, a typed REST client, is the only crossing point (architecture principle P2).

## Consequences

- **Positive:** Strapi's built-in admin UI gives Content Editors a working editorial surface without any custom admin panel being built — a capability the legacy site had zero equivalent of.
- **Positive:** `draftAndPublish`, the `Public`-role permission model, and `db.lifecycles.subscribe` lifecycle hooks are native Strapi v5 features that map directly onto EP-23's and EP-26's requirements without bespoke infrastructure.
- **Positive:** PostgreSQL is a mature, well-understood relational store appropriate for Strapi's schema-driven content model and for `contact-submission`'s simple tabular PII data (doc 05 §4); it is the database Strapi itself recommends for production.
- **Negative:** Strapi v5's toolchain pulls in `ajv@8` as a transitive dependency, which collides with Next.js/ESLint's `ajv@6` in a single npm-workspaces install — this is a real cost of the choice, addressed (not avoided) by ADR-005's deliberate hoist exclusion.
- **Negative:** Introducing a database and a second Node.js process where none existed before adds operational surface area (provisioning, backups, PM2 process management) that the legacy static-file deployment never had — accepted as the necessary cost of centralized content management (EP-23's stated goal), and scoped down to a single VPS (ADR-006) rather than over-built.
- **Neutral:** Media fields (`image`, `badge`, etc.) are modeled as plain string URLs in v1 rather than Strapi Media Library relations — a scoped-down v1 decision (doc 02 §6, R1), not a limitation of Strapi/PostgreSQL themselves.

## Alternatives considered

| Alternative | Why not chosen |
|---|---|
| A different headless CMS (Contentful, Sanity, Payload) | Would work functionally, but introduces a hosted third-party dependency or a different self-hosting story inconsistent with the single-VPS, self-hosted topology already decided for the front end (ADR-006); Strapi's open-source, self-hostable Node.js model fits the existing toolchain and the team's Node-first stack most directly. |
| MySQL/MariaDB instead of PostgreSQL | PostgreSQL is Strapi's most mature, best-supported production database target; no requirement in this migration favors MySQL's characteristics over PostgreSQL's, so there is no reason to deviate from Strapi's recommended path. |
| SQLite (Strapi's default for quick local starts) | Adequate for a prototype, but not for a production deployment expected to hold real editorial and PII (`contact-submission`) data with concurrent admin writes and nightly backup requirements (EP-27-S3/S4) — PostgreSQL is the appropriate production-grade choice from the start, used in dev too for parity. |
| A hand-rolled admin CRUD app instead of a CMS | Would require building draft/publish workflow, role/permission management, and an admin UI from scratch — reinventing exactly what Strapi already provides, for no requirement-driven benefit. |
