# TS-012 — Cross-Cutting Strategy: Content-Migration Fidelity

> **Inherits:** [TS-000 Master Strategy](TS-000-master-test-strategy.md) §4 ("Content-fidelity/CMS-drift," "Redirect-coverage," "SEO-metadata-uniqueness," "Idempotency," "Preserve-or-retire" test types), §6.2 (legacy-HTML-fixture test-data principles).
> **Requirements source:** [`09-cms-seo-and-platform.md`](../A01-2-REQUIREMENTS/09-cms-seo-and-platform.md) EP-24-S1 (SEO-metadata uniqueness) and EP-24-S2 (301-redirect table); `packages/seed`'s idempotency obligation, stated once in EP-20-S1/EP-21-S1/EP-22-S1's own AC and generalized here into one reusable harness.
> **Why this plan exists as its own document:** this migration's dominant risk is regression from a known-good legacy baseline (TS-000 §4.3), and three of that risk's sharpest edges — a re-run seed script silently duplicating content, a page shipping the legacy site's generic duplicated SEO string, and a legacy URL 404ing instead of 301ing — are each **platform-wide invariants** that must be asserted exactly once, centrally, rather than re-derived per content type or per page (TS-000 §9's explicit "no two pages share a `metaTitle`"-style example).
> **Risk tier:** Tier 1 (TS-000 §5 places "SEO/redirects EP-24" at 0.9/0.85 on the heat map — near-top blast-radius and launch-priority).

---

## 1. Seed/ETL idempotency — one reusable harness, not one test per content type

`packages/seed` runs once per content type (`global`, `case-study`, `news-article`, `service`, `team-member`, `partner`, `testimonial`) but the idempotency obligation is identical across all seven: **re-running the script against an already-seeded instance must never create a duplicate entry**, matched instead by slug (or, for `global`, by the singleType's inherent single-entry constraint).

| Scenario | Layer | Assertion |
|---|---|---|
| Happy — first run creates exactly N entries | MIG | Running the seed script once against a fresh Strapi+Postgres instance creates exactly the expected count per type (4 `news-article`, 10 `case-study`, 2 `testimonial`, etc. — cross-ref TS-008 §3's per-collection counts). |
| Happy — second run against the same instance is a no-op on count | MIG | Running the same script a second time produces **zero** new entries; existing entries are matched by slug and updated in place if source content changed, never duplicated. |
| Failure — a manual admin edit made between seed runs is not silently clobbered without an explicit `--force` | MIG | If a Content Editor has hand-edited a seeded entry's field in the Strapi admin panel, a subsequent unforced seed re-run does not silently overwrite that edit; the script logs a skip/conflict rather than blindly upserting (cross-ref TS-001 §3 EP-02-S1, which applies this same principle to `global`). |
| Edge — running the script 0 / 1 / 2 times consecutively always yields the correct entry count for that step | MIG | A single parametrized test runs the script N times (0, 1, 2) and asserts count == expected-count for N≥1 and count == 0 for N=0, closing off any off-by-one duplication path. |
| Edge — idempotency holds across all seven content types via one shared test harness | MIG | The harness parametrizes over `{global, case-study, news-article, service, team-member, partner, testimonial}` rather than being hand-copied seven times — a defect in the idempotency *logic itself* (not just one type's fixture) is caught once and fixes propagate to all seven. |

## 2. 301-redirect completeness — all 23 legacy URLs, one exhaustive sweep

| # | Legacy URL | Target route | Source section |
|---|---|---|---|
| 1 | `/index.html` | `/` | Section B (homepage) |
| 2 | `/about.html` | `/about` | Section C |
| 3 | `/service.html` | `/services` | Section D |
| 4 | `/bootcamp.html` | `/bootcamp` | Section E |
| 5 | `/partnership.html` | `/partnership` | Section F |
| 6 | `/contact.html` | `/contact` | Section G |
| 7 | `/triedatum-news.html` | `/news` | Section H (EP-20-S3) |
| 8 | `/news/5-year-anniversary.html` | `/news/5-year-anniversary` | Section H (EP-20-S3) |
| 9 | `/news/new-engineering-office.html` | `/news/new-engineering-office` | Section H (EP-20-S3) |
| 10 | `/news/trevor-cto.html` | `/news/trevor-cto` | Section H (EP-20-S3) |
| 11 | `/news/triedatum-bootcamp.html` | `/news/triedatum-bootcamp` | Section H (EP-20-S3) |
| 12–21 | `/case-study/case1.html` … `/case-study/case10.html` (10 URLs) | `/case-studies/[final-authored-slug]` — **5 of the 10 slugs (case1, case2, case4, case5, case8) are not final until their real titles are authored per EP-21-S1** | Section H (EP-21-S3) |
| 22 | `/testimonial/testimonial1.html` | `/testimonials/rob-wdowik` | Section H (EP-22-S3) |
| 23 | `/testimonial/testimonial2.html` | `/testimonials/kristy-burns` | Section H (EP-22-S3) |

| Scenario | Layer | Assertion |
|---|---|---|
| Happy — all 23 URLs 301, none 404, none 302 | SEO | A single CI script requests all 23 legacy paths against the built `next.config.js` redirect map (or against staging pre-launch) and asserts every one responds exactly 301 with a `Location` header resolving to a live route — a 302 is treated as a failure (SEO-equity loss), not "close enough." |
| Failure — any one of the 23 is missing from the map | SEO | The sweep is exhaustive by construction (iterates the fixed 23-URL list above, not a dynamically-discovered set) so an accidentally-omitted entry surfaces as a named failing URL, not a silently-passing incomplete run. |
| Edge — the 5 not-yet-finalized case-study slugs (rows 12–21, partial) | SEO | Until `EP-21-S1`'s 5 retitled entries have final slugs, this sweep either (a) fails loudly naming "pending slug" for those 5 rows specifically, or (b) accepts a temporary redirect to `/case-studies` for exactly those 5 — **never** a permanent 301 baked in before the slug is final (mirrors EP-21-S3's own AC, asserted here as part of the platform-wide sweep rather than re-derived). |
| Edge — near-duplicate path variants are not silently missed | SEO | Case-insensitive/trailing-slash variants of each of the 23 URLs (if the legacy site's server ever served them) are spot-checked, since a redirect map keyed on exact string match could otherwise leave a near-duplicate path unmapped. |

## 3. SEO-metadata uniqueness — pairwise sweep across all content-backed pages

The legacy site reused **"TrieDatum - Your Trusted Partner in AI & Data"** verbatim as `<title>`/description/keywords across `index.html`, `about.html`, `service.html`, most `case-study/*.html`, and roughly half of `news/*.html`. EP-24-S1 requires every one of those pages to carry a real, unique value post-migration.

| Scenario | Layer | Assertion |
|---|---|---|
| Happy — every content-backed route has a non-empty, unique `metaTitle` | MIG | A build-time script collects every route's resolved `metaTitle` (static pages + every published `case-study`/`news-article`/`service` entry) and asserts the full set has zero duplicates — one pairwise-comparison assertion covering the whole site, not one test per page. |
| Failure — any page's `metaTitle` equals the legacy generic string verbatim | MIG | The same script separately checks the full set against the literal string `"TrieDatum - Your Trusted Partner in AI & Data"` and fails if any page still carries it — this is the direct regression test for the specific defect EP-24-S1 names. |
| Edge — a case-study entry seeded with the legacy generic title as a placeholder (pending Content-Editor retitling) is excluded from the "must be unique and non-generic" gate only while still in **draft** | MIG | The 5 generically-titled case studies (EP-21-S1) are permitted to exist in Strapi in draft state carrying the placeholder title during migration, but the uniqueness/non-generic gate applies at **publish** time — a draft entry failing the check is expected and does not fail the build; a **published** entry failing it does. |
| Edge — two independently-authored real titles accidentally collide | MIG | If a Content Editor authors two genuinely different pages with the same new title (not the legacy generic string, but still a duplicate of each other), the uniqueness sweep still fails the build — "not the generic string" and "not a duplicate of any other page" are two independently-checked conditions, not one. |

## 4. Preserve-or-retire items this plan verifies as flagged (not resolved)

Per TS-000 §4/§9, each of the following is asserted as **recorded and safely defaulted**, never as "the correct disposition was chosen" — full detail and ownership in [TS-COVERAGE §6](TS-COVERAGE-test-coverage-matrix.md#6-preserve-or-retire--content-owner-decision-tracking):

| Item | This plan's obligation |
|---|---|
| Generic, duplicated SEO metadata (5+ pages) | §3 above is the direct test; disposition is "implement" (not a content-owner decision) per `SOURCE-COVERAGE.md`'s register — every affected page must be fixed, not merely flagged. |
| `case8` orphan-page decision | Not owned by this plan (owned by TS-008 §5/EP-21-S4) — but this plan's redirect sweep (§2, row range 12–21) still requires `case8.html` to 301 to a working destination regardless of which disposition is chosen, since a redirect is needed either way. |
| 5 case-study slugs pending final titles | §2's "pending slug" edge scenario is this plan's direct obligation — the redirect sweep must never bake in a permanent 301 to a non-final slug. |

## 5. Traceability stub (rolls up to TS-COVERAGE)

| Story | Covered by |
|---|---|
| EP-20-S1, EP-21-S1, EP-22-S1 (seed idempotency) | shared idempotency harness (§1) |
| EP-24-S1 (SEO uniqueness) | pairwise metaTitle sweep + generic-string regression check (§3) |
| EP-24-S2 (redirect table) | exhaustive 23-URL sweep (§2) |
| EP-21-S3 (case-study redirects, slug-tolerant) | pending-slug edge scenario (§2) |
| EP-21-S4 (case8, cross-ref TS-008 §5) | redirect destination still required regardless of disposition (§4) |
