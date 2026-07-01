# Architecture & Drift Review — 2026-07-01

Compares `A04-2-SOLUTION-ARCHITECTURE/` (the design) against the actual `apps/web`/`apps/cms` code
skeleton (the build), as of this scan run. This is a **standards-scan-level** drift check — layering,
naming, and doc-vs-code consistency — not a re-litigation of the architecture's own decisions.

## 1. State of `A04-2-SOLUTION-ARCHITECTURE` at time of scan

Only two of the eight planned documents exist:

- `00-solution-architecture-overview.md` — executive summary, C4 context/container diagrams, tech
  stack, non-functional targets, decision log (ADR-001…006), risks/open questions. Complete and
  detailed.
- `README.md` — reading order, decision-log index, scope/guardrails.

**Not yet written:** `01-component-architecture.md` (the `PAGE-*`/`SEC-*`/`API-*`/`CMS-*`/`SVC-*`/`INFRA-*`
component catalog), `02-data-architecture-and-content-model.md`, `03-domain-ontology.md`,
`04-content-editing-pipeline-and-data-exchange.md`, `05-security-and-nfr.md`,
`06-requirements-coverage.md`. The `adr/` directory referenced throughout `00` and `README.md` (six
ADR files, ADR-001 through ADR-006) is **present as an empty directory** — none of the six ADR files
it's supposed to contain have been written yet.

Noted honestly, not treated as a defect owned by this scan: authoring `A04-2` documents 01–06 and the
`adr/*.md` files is Solution Architect work, tracked wherever that agent's own run log tracks it, not a
Standards-Enforcer finding. It is recorded here only so this review's drift comparison states its own
limits — the fuller catalogs (component IDs, full content-model field list, security/NFR design) that
`00` promises are not yet available to check the code skeleton against.

## 2. What *can* be checked now, and the result

### 2.1 Rendering strategy (ADR-001: SSG + ISR)

`00-solution-architecture-overview.md` §5 mandates every content-backed route declare
`revalidate: 3600` as a timed fallback. **Not yet checkable** — no `app/**/page.tsx` route exists in
the skeleton yet, only the two API routes and two layout components. No drift; nothing to compare.

### 2.2 Data-exchange plane (`packages/shared` as the only seam, ADR-independent P2)

The overview mandates `apps/web` never queries Strapi/Postgres directly and always crosses through
`packages/shared`. `apps/web/app/api/contact/route.ts` and `apps/web/app/api/revalidate/route.ts` are
the only two `apps/web` files that touch the network today, and neither imports `packages/shared` —
`contact/route.ts` calls `fetch(`${strapiUrl}/api/contact-submissions`)` directly, and
`revalidate/route.ts` calls `revalidatePath()` locally with no Strapi call at all (correct direction,
Strapi → this route, not this route → Strapi).

**Drift note (not yet a defect):** `packages/shared` does not exist yet in the repo, so `contact/route.ts`
reaching `fetch()` directly is the only option available right now, not a violation of P2 — there is
nothing to route through yet. Flagging this here so it is **not forgotten**: once `packages/shared` is
scaffolded, `contact/route.ts`'s direct `fetch` call to `/api/contact-submissions` should be migrated
to go through it, or the P2 boundary rule becomes silently unenforceable in the one file that most
needs it (the sole write path to Strapi from `apps/web`).

### 2.3 npm-workspaces monorepo (ADR-005)

The overview states `apps/cms` is deliberately excluded from workspace hoisting to avoid an `ajv@6`
vs `ajv@8` collision, and cites "the already-resolved `ajv` hoist decision recorded in its root
`package.json`" as structural grounding. **No root `package.json` exists in this repo** — confirmed by
directory listing at scan time. This is the one point where the architecture doc's own framing
("cited as precedent for the design... most of TDWebsite2... remains to be built against this document
set" — `A04-2-SOLUTION-ARCHITECTURE/README.md` §"Scope & guardrails") and the actual repo state could
mislead a future reader into assuming the workspace root already exists. Logged as STD-02 in this
run — a standards/hygiene gap (missing manifest), not a design defect.

### 2.4 Component naming convention (`PAGE-*`/`SEC-*`/`API-*`/`CMS-*`)

`00`'s C4 diagram labels the two existing routes `API-CONTACT` and `API-REVALIDATE`. Neither
`route.ts` file's code or comments carries that component ID anywhere (they cite Epic/Story IDs
instead — `EP-18-S1..S4`, `EP-26-S1`). This is consistent *within itself* (every file uses Epic/Story
IDs, not component IDs, since `01-component-architecture.md` — the document that would formally mint
those IDs — doesn't exist yet). No drift to log; component-ID annotation should be revisited once
document 01 exists and Story-to-component-ID mapping is unambiguous.

### 2.5 Content model (case-study schema vs. requirements ER preview)

`A01-2-REQUIREMENTS/00-overview-and-architecture.md` §5's ER preview lists `CASE_STUDY` with `title`,
`slug`, `summary`, `client`, `industry`, `body`, `image`, `order`, `featured` — matching
`apps/cms/src/api/case-study/content-types/case-study/schema.json` field-for-field, plus a `seo`
component relation the ER preview doesn't show explicitly (consistent with the ER diagram's own
`CASE_STUDY ||--|| SEO : seo` relationship line). **No drift** — the one schema file that exists lines
up exactly with the one ER model that exists.

## 3. Summary

| Area | Status |
|---|---|
| Rendering strategy vs. code | Not yet checkable — no page routes exist |
| `packages/shared` seam vs. code | Not yet violated, but not yet enforceable either — watch when `packages/shared` lands |
| Workspace root manifest vs. `00`'s framing | Drift — doc's grounding language assumes a root `package.json` that doesn't exist (STD-02) |
| Component-ID annotation vs. code comments | Consistent (both use Epic/Story IDs; component catalog doc not yet written) |
| Case-study content model vs. ER preview | Consistent, field-for-field |

No fabricated "zero drift" claim: two real gaps are recorded above (§2.2's forward-looking
`packages/shared` note, §2.3/STD-02's missing root manifest), and four of the six planned `A04-2`
documents plus all six ADR files remain unwritten as of this scan.
