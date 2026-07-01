# 03 — Domain Ontology

> The conceptual model beneath `02-data-architecture-and-content-model.md`'s physical schema, expressed from a solution-architecture lens: **roles × content entities × pages**. This is not the requirements' role catalog restated — it is the relationship structure the architecture must hold true for `TDWebsite2` once built: who touches which entity, through which surface, and under what constraint.

---

## 1. Concepts (classes)

| Class | Instances | Source |
|-------|-----------|--------|
| **Role** | Site Visitor, Prospective Client, Content Editor, Site Administrator, Front-End Engineer, CMS Engineer, Deploy Engineer, SEO Engineer | `A01-2-REQUIREMENTS/00-overview-and-architecture.md` §2 |
| **Content Entity** | The 8 `CMS-*` content types (`02-data-architecture-and-content-model.md` §1) | Strapi schema |
| **Page** | The 11 `PAGE-*` routes (`01-component-architecture.md` §2) | `apps/web` routing |
| **Pipeline Stage** | Author → Publish → Revalidate → Serve (detailed in `04-content-editing-pipeline-and-data-exchange.md`) | Cross-cutting |

Two roles are **build-time only** and never appear in a runtime object property below: Front-End Engineer and CMS Engineer construct the Page and Content Entity classes themselves but do not instantiate them at runtime; they are included here for completeness since the requirements' Story actors reference them, but §2's relations are scoped to the four **runtime** roles (Site Visitor, Prospective Client, Content Editor, Site Administrator) plus Deploy Engineer/SEO Engineer where their operational relation is runtime-relevant.

---

## 2. Object & relationship properties

| Property | Domain (subject) | Range (object) | Meaning |
|----------|-------------------|------------------|---------|
| `browses` | Site Visitor | Page | Reads any published route anonymously; no authentication concept exists for this role. |
| `evaluates` | Prospective Client | Page, Content Entity (via Page) | A Site Visitor sub-role whose browsing is goal-directed toward a services/bootcamp engagement decision. |
| `submits` | Prospective Client | `contact-submission` | The only entity any anonymous role may **write**, and only via `create` (§2 of doc 02). |
| `authors` | Content Editor | `service`, `news-article`, `case-study`, `team-member`, `partner`, `testimonial`, `global` | Creates/edits/publishes entries in Strapi admin. Never touches `contact-submission` content, only reads it back as a lead. |
| `reviewsLeadsOn` | Content Editor, Site Administrator | `contact-submission` | The only read access to submissions — exclusively via the authenticated Strapi admin panel, never the Public API (doc 05 §1). |
| `administers` | Site Administrator | Role (Strapi Users & Permissions), API token | Manages Strapi users, roles/permissions, and API tokens — a meta-relation over the permission matrix itself, not over content. |
| `renders` | Page | Content Entity | A Page displays one or more Content Entity instances (§3 matrix). |
| `implements` | Page, Section (`SEC-*`) | Epic | Traceability relation, fully expanded in `06-requirements-coverage.md`. |
| `operates` | Deploy Engineer | `INFRA-*` | Runs the hosting topology the other three roles' actions ultimately execute on. |
| `verifies` | SEO Engineer | `SVC-SEO`, `SVC-REDIRECTS` | Confirms zero ranking/traffic loss — an ontological check on Page × legacy-URL identity, not a content relation. |

---

## 3. Roles × Content Entities matrix

| | `global` | `service` | `news-article` | `case-study` | `team-member` | `partner` | `testimonial` | `contact-submission` |
|---|---|---|---|---|---|---|---|---|
| **Site Visitor** | read (via Page) | read | read | read | read | read | read | — |
| **Prospective Client** | read (via Page) | read | read | read | read | read | read | **create** |
| **Content Editor** | author | author | author | author | author | author | author | read (admin only) |
| **Site Administrator** | read/admin | admin | admin | admin | admin | admin | admin | read (admin only) |

No role — including Content Editor and Site Administrator — ever has `update`/`delete` on `contact-submission` through the Public API; admin-panel access is a Strapi-internal authenticated capability, not a Public-role grant, and is out of scope for the permission matrix in doc 02/05 (which governs the *anonymous* surface only).

---

## 4. Roles × Pages matrix

| Page | Site Visitor / Prospective Client | Content Editor (indirect, via entities rendered) |
|------|-----------------------------------|----------------------------------------------------|
| `PAGE-HOME` | browses | `service`, `news-article`, `case-study`, `testimonial`, `partner` |
| `PAGE-ABOUT` | browses | `team-member` |
| `PAGE-SERVICES` | evaluates | `service` |
| `PAGE-BOOTCAMP` | evaluates | — (structurally hard-coded v1; no backing content entity, R2) |
| `PAGE-PARTNERSHIP` | browses | `partner` |
| `PAGE-CONTACT` | submits (via `SEC-CONTACT-FORM` → `API-CONTACT`) | `global` (contact-info chrome only) |
| `PAGE-NEWS`, `PAGE-NEWS-DETAIL` | browses | `news-article` |
| `PAGE-CASE-STUDIES`, `PAGE-CASE-STUDY-DETAIL` | evaluates | `case-study` |
| `PAGE-TESTIMONIAL-DETAIL` | evaluates | `testimonial` |

Every Page in the left column also indirectly renders `global` for the shared header/footer chrome (`SEC-HEADER`, `SEC-FOOTER`) — omitted from the per-row cells above to avoid repeating it on all 11 rows.

---

## 5. Business-rule axioms

These axioms hold independent of physical storage (they constrain the ontology, not just the Strapi schema) and are enforced at the levels named:

1. **A1 — Write minimality.** The only entity any unauthenticated role may create is `contact-submission`; no unauthenticated role may ever update or delete any entity. *(Enforced: Strapi Public-role permission matrix, doc 02 §4/§5, doc 05 §1.)*
2. **A2 — Content ownership is centralized.** Every Content Entity has exactly one authoring role (Content Editor) and zero or more reading roles; there is no entity a Site Visitor can author, directly or indirectly. *(Enforced: Strapi admin authentication; the Public API grants no write path except A1's single exception.)*
3. **A3 — Every Page renders from a bounded entity set.** No Page other than `PAGE-BOOTCAMP` (deferred, R2) is free-form/CMS-driven layout; each Page's entity set is exactly the row in §4, not "any content type an editor chooses to place there." *(Enforced: `apps/web` route templates are hard-coded structure with CMS-driven repeating regions — architecture principle P3, overview §2.)*
4. **A4 — Shared entities have exactly one canonical source.** `partner` is rendered by two Pages (`PAGE-HOME` via `SEC-PARTNERS` and `PAGE-PARTNERSHIP` via `SEC-PARTNER-CARDS`) from one collection — never duplicated data. The same discipline applies to `testimonial` (homepage carousel + `PAGE-TESTIMONIAL-DETAIL`) and `case-study`/`news-article` (homepage carousels/grids + listing/detail pages). *(Enforced: `packages/shared` is the only data-access seam — architecture principle P2.)*
5. **A5 — Freshness is an entity-level guarantee, not a page-level one.** When a Content Editor authors any entity, every Page that renders it becomes eligible for revalidation (doc 04) — the ontology has no notion of a Page that silently serves stale data indefinitely. *(Enforced: lifecycle hooks fan out per-entity to affected Pages; timed ISR fallback as the unconditional backstop.)*
6. **A6 — Identity is preserved across the migration.** Every legacy URL maps to exactly one target Page (or an explicit 301), and the SEO Engineer's `verifies` relation exists specifically to check this axiom holds for all 23 legacy URLs. *(Enforced: `SVC-REDIRECTS`, EP-24-S2.)*

---

## 6. `[RISKS / OPEN QUESTIONS]`

| # | Item | Impact |
|---|------|--------|
| O1 | `PAGE-BOOTCAMP` is the one Page with no Content-Entity relation in §4 — it is an ontological outlier (axiom A3's stated exception) as long as `bootcamp-program` remains deferred (R2, doc 01 §8). | If a `bootcamp-program` entity is introduced, this document's §3/§4 matrices and axiom A3 need a corresponding update alongside doc 01/02. |
