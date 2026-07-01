# TS-COVERAGE — Test Coverage Matrix

> **Inherits:** [TS-000 Master Strategy](TS-000-master-test-strategy.md).
> **Requirements source:** [`../A01-2-REQUIREMENTS/`](../A01-2-REQUIREMENTS/) — 27 Epics / 80 Stories across 9 section documents, plus [`SOURCE-COVERAGE.md`](../A01-2-REQUIREMENTS/SOURCE-COVERAGE.md)'s legacy-page traceability and preserve-or-retire register.
> **Purpose:** reconcile every one of the 27 Epics to the test-strategy document(s) (TS-000…TS-012) that cover it, and every flagged preserve-or-retire / content-owner-decision item to the plan that verifies it is *recorded*, not silently resolved. Per-story detail lives in each TS-0XX plan's own "Traceability stub" section — this document rolls those up to the Epic level and calls out anything genuinely uncovered.
> **Framing:** this is a coverage **map**, not a coverage **report** — it shows which planned document asserts on which Epic; it does not claim any test has run, because `TDWebsite2` has no test runner installed yet (TS-000, framing note) and no code exists to test.
> **Honesty rule this document follows:** a cell is marked covered only if a named TS-0XX plan actually contains a scenario for that Epic/Story. Anything without one is listed in §5, not smoothed over.

---

## 1. Epic-level coverage matrix (27/27)

| Epic | Title | Stories | Primary plan | Also asserted in | Risk tier (TS-000 §5) |
|---|---|---|---|---|---|
| EP-01 | Global Site Header & Navigation | 4 | TS-001 | TS-010 (a11y: dropdown keyboard nav, aria-expanded) | Tier 1 |
| EP-02 | Global Footer & Site Settings (`global` single type) | 4 | TS-001 | TS-012 (§1 idempotency harness), TS-010 (a11y: icon/link labels) | Tier 1 |
| EP-03 | Shared Page Chrome (Preloader, Scroll-to-Top, Analytics) | 3 | TS-001 | TS-009 (§3 EP-25-S1 GA4 continuity, cross-ref) | Tier 1 (GA4) / Tier 2 (preloader, scroll-top) |
| EP-04 | Homepage Hero Slider | 3 | TS-002 | TS-010 (§2 LCP budget, §3 reduced-motion) | Tier 1 |
| EP-05 | Homepage About Teaser | 2 | TS-002 | — | Tier 2 |
| EP-06 | Homepage Services Carousel (CMS-driven) | 2 | TS-002 | TS-010 (a11y: `aria-expanded` on `ServiceExpandButton`) | Tier 1 |
| EP-07 | Homepage Stats Counters | 2 | TS-002 | TS-010 (§3 reduced-motion on CounterUp) | Tier 2 |
| EP-08 | Homepage News Marquee & News Grid | 2 | TS-002 | — | Tier 2 |
| EP-09 | Homepage Testimonials Carousel | 2 | TS-002 | TS-008 (§3 EP-22-S3 shared-data-source-with-detail-page check) | Tier 2 |
| EP-10 | Homepage Partner Logo Strip | 2 | TS-002 | TS-010 (a11y: accessible names on logo links) | Tier 2 |
| EP-11 | Homepage Case Studies Carousel | 2 | TS-002 | TS-008 (§3 EP-21-S2/S4 listing-page + case8 cross-refs) | Tier 1 |
| EP-12 | About "Our Story" | 1 | TS-003 | — | Tier 2 |
| EP-13 | Team Member Directory | 2 | TS-003 | — | Tier 2 |
| EP-14 | Services Detail Page & Service Content Type | 4 | TS-004 | — | Tier 1 |
| EP-15 | Bootcamp Landing Page & Program Content | 7 | TS-005 | TS-010 (Tier-C performance budget for the bootcamp micro-site) | Tier 2 (S4 = Tier 4, documented P4 deferral) |
| EP-16 | Bootcamp Structured Data (JSON-LD) | 1 | TS-005 | TS-009 (§3 EP-25-S2 JSON-LD-generation pattern, cross-ref) | Tier 2 |
| EP-17 | Partnership Page & Partner Content Type | 3 | TS-006 | TS-010 (a11y: logo-link accessible names) | Tier 2 |
| EP-18 | Contact Form & Submission Handling | 5 | TS-007 | TS-011 (§3 security slice: honeypot enforcement, injection safety), TS-010 (§3 form a11y, no-JS baseline) | Tier 1 (S5 = Tier 4, documented P4 deferral) |
| EP-19 | Contact Page Chrome | 1 | TS-007 | — | Tier 2 |
| EP-20 | News Article Collection & Detail Route | 3 | TS-008 | TS-012 (§1 idempotency, §2 redirect sweep) | Tier 2 (S3 = Tier 1) |
| EP-21 | Case Study Collection & Detail Route | 4 | TS-008 | TS-012 (§1 idempotency, §2 redirect sweep + pending-slug edge, §3 SEO uniqueness for retitled entries) | Tier 2 (S3 = Tier 1) |
| EP-22 | Testimonial Collection & Detail Route | 3 | TS-008 | TS-012 (§1 idempotency, §2 redirect sweep) | Tier 3 |
| EP-23 | Strapi Content Modeling & Permissions | 4 | TS-009 | TS-011 (§1–§2 exhaustive Public-role permission matrix — owns S2/S3's deep assertions) | Tier 1 |
| EP-24 | SEO, Metadata, Sitemap & 301 Redirects | 4 | TS-009 | TS-012 (§2 exhaustive 23-URL redirect sweep, §3 SEO-uniqueness pairwise sweep — owns S1/S2's deep assertions) | Tier 1 |
| EP-25 | Analytics & Structured Data | 2 | TS-009 | — | Tier 1 (S1) / Tier 2 (S2) |
| EP-26 | On-Demand ISR / Revalidation Webhook | 3 | TS-009 | TS-011 (§3 secret-gating adversarial scenarios — owns S1's security depth) | Tier 2 |
| EP-27 | Hosting, Deployment & CI/CD (Hostinger VPS) | 5 | TS-009 | — | Tier 1 (S3 = Tier 3, designed-not-active CI) |

**27/27 Epics have a named primary plan. No Epic is uncovered.**

## 2. Story-count reconciliation (ties to the requirements' own 80-story total)

| Plan | Epics | Stories | Cumulative |
|---|---|---|---|
| TS-001 | EP-01–EP-03 | 11 | 11 |
| TS-002 | EP-04–EP-11 | 17 | 28 |
| TS-003 | EP-12–EP-13 | 3 | 31 |
| TS-004 | EP-14 | 4 | 35 |
| TS-005 | EP-15–EP-16 | 8 | 43 |
| TS-006 | EP-17 | 3 | 46 |
| TS-007 | EP-18–EP-19 | 6 | 52 |
| TS-008 | EP-20–EP-22 | 10 | 62 |
| TS-009 | EP-23–EP-27 | 18 | 80 |

**80/80 Stories accounted for across the 9 section plans** — matches `00-overview-and-architecture.md` §1's stated total. Per-story test-layer detail is in each plan's own §"Traceability stub" (TS-001 §7, TS-002–TS-007's final sections, TS-008 §6, TS-009 §5) — not re-enumerated here to avoid the duplicate-assertion pattern TS-000 §9 warns against.

## 3. Cross-cutting plan reach (which Epics each of TS-010/011/012 touches)

| Cross-cutting plan | Epics it adds depth to | What it adds beyond the primary plan |
|---|---|---|
| **TS-010** (NFR: performance & accessibility) | EP-01, EP-02, EP-04, EP-06, EP-07, EP-10, EP-15, EP-17, EP-18, EP-20 (site-wide budgets apply to all, these are the ones with explicit AC-level a11y/perf hooks) | Lighthouse/Core Web Vitals budgets per page-weight tier; WCAG 2.1 AA / axe-core / keyboard / reduced-motion checks not otherwise enumerated in the per-section plans |
| **TS-011** (security & privacy) | EP-18 (S2/S3), EP-23 (S2/S3), EP-26 (S1) | The exhaustive Public-role permission cross-product, adversarial contact-form/injection scenarios, and revalidate-secret-gating edge cases — asserted once here rather than per content type |
| **TS-012** (content-migration fidelity) | EP-20 (S1), EP-21 (S1/S3), EP-22 (S1), EP-24 (S1/S2) | The single reusable seed-idempotency harness, the pairwise SEO-metaTitle-uniqueness sweep, and the exhaustive 23-URL redirect-coverage sweep — each a platform-wide invariant asserted once rather than per collection/page |

## 4. Priority-tier cross-check against TS-000 §5

The Epic-level `Risk tier` column in §1 above is copied verbatim from TS-000 §5's quadrant chart and Tier 1–4 lists — this matrix does not introduce a second, potentially-drifting risk classification. Where a plan's own header states a split tier per-story (e.g. TS-001's "EP-03 = Tier 1 (GA4), Tier 2 (preloader/scroll-top)"), that split is preserved in §1 rather than collapsed to one number.

## 5. Known coverage gaps — flagged honestly, not forced to 100%

| Gap | Why it's a genuine gap | Status |
|---|---|---|
| Isotope / Tilt / Particles library init calls (`assets/js/main.js`) | `SOURCE-COVERAGE.md`'s own register lists these as **"not cited by any Story"** — no Epic/Story in the requirements set owns porting or retiring them, so no TS-0XX plan can test them either. | **Uncovered by design of the requirements set, not an oversight of this test strategy.** Flagged for triage per `SOURCE-COVERAGE.md`'s own recommendation: engineering must confirm whether any migrated page genuinely depends on these before porting; if a live use is confirmed, a new Story (and a corresponding test-plan update) is needed. |
| Core Web Vitals **field data** (as opposed to lab/Lighthouse-CI data) | The site does not exist in production yet — there is no real-user traffic to sample. | Not a gap in this strategy's design; TS-010 §4 explicitly documents this as "pending post-launch collection," not silently assumed equivalent to lab data. |
| Rate-limiting on `POST /api/contact` / `POST /api/revalidate` | No Epic/Story in the requirements set specifies a rate-limit requirement. | TS-011 §4 flags this as an open item for the engineering agents to raise as a follow-on story if abuse is observed — this test strategy does not invent a requirement the analyst-authored requirements set doesn't contain. |
| CI pipeline's **actual automated execution** (EP-27-S5) | The requirements' own AC scopes this Epic to "designed, version-controlled, not yet activated" — there is deliberately no active pipeline to test end-to-end yet. | Covered at the scope the Epic itself defines (doc-presence + YAML-validity, TS-009 §3) — not a gap, but explicitly **not** a functional CI-run test, and must not be reported as one. |
| `bootcamp-program` Strapi collection type (EP-15-S4) | Deliberately deferred (P4) — no collection type exists to test. | Covered at the scope the Epic itself defines (doc-presence: deferral is documented and discoverable, TS-005) — not a functional gap. |
| Cloudflare Turnstile (EP-18-S5) | Deliberately deferred (P4) — no integration exists to test. | Same pattern — doc-presence coverage only (TS-007 §3), by design. |

**No Epic is missing a primary plan. The items above are either (a) explicitly out of the requirements set's own scope and therefore correctly untestable, or (b) pending real-world data this test strategy cannot fabricate pre-launch. Neither is treated as if it were resolved.**

## 6. Preserve-or-retire / content-owner-decision tracking

Every item in `SOURCE-COVERAGE.md`'s preserve-or-retire register, and the test plan that verifies it is **recorded as a flag**, not silently resolved by whichever disposition ships first:

| Item | Location | Owning story | Verified as flagged by |
|---|---|---|---|
| Disabled hero-slider block (`#heroSlide18`) with a divergent "Our Story" narrative | `about.html`, lines 196–239 | EP-12-S1 | TS-003 |
| Disabled alternate team-bio carousel (`#testiSlider2`); "Raj" vs. "Rajesh" Nadipalli name conflict | `about.html`, lines 548–625 | EP-13-S2 | TS-003 |
| Dead alternate copy block referencing `case6.html` as AI-Enabled Migrations' case-study link | `service.html`, lines 862–908 | EP-14-S4 | TS-004 |
| Generic, duplicated SEO metadata across 5+ pages | `index.html`, `about.html`, `service.html`, most `case-study/*.html`, half of `news/*.html` | EP-24-S1 | TS-012 §3, TS-009 §3 |
| `case8` orphan (excluded from legacy nav dropdown + homepage carousel; target currently renders all 10) | `case-study/case8.html`; `index.html` carousel + nav dropdown | EP-21-S4 | TS-008 §5, cross-ref TS-001 §3 EP-01-S3 note, TS-012 §4 |
| Orphaned partner-logo asset with no rendered card | `assets/img/partners/Cognition.png` | EP-17-S1 | TS-006 |
| 5th "hybrid" news-listing card linking to `partnership.html` (not a real news article) | `triedatum-news.html` | EP-20-S1 | TS-008 §5 |
| Dead commented-out essay paragraph belonging to `testimonial1`'s subject matter | `testimonial/testimonial2.html` | EP-22-S1 | TS-008 §5 |
| CI/CD pipeline designed but not wired into an active workflow directory | `infra/github/deploy.yml` | EP-27-S5 | TS-009 §3, §5 above |
| Cloudflare Turnstile deferred; honeypot is the only active control at launch | target `.env.example` / project status notes | EP-18-S5 | TS-007 §3, TS-011 §4 |
| `bootcamp-program` collection type deliberately not built for v1 | `bootcamp.html` `.programs-section#programs` | EP-15-S4 | TS-005, §5 above |
| Isotope / Tilt / Particles init calls with no citing Story | `assets/js/main.js` | *(unassigned — flagged for triage)* | **Not coverable by any TS-0XX plan until a Story exists** — see §5 above |

**Every preserve-or-retire item except the last has an owning Story and a plan that asserts the flag is recorded. The last (Isotope/Tilt/Particles) is honestly reported as untestable until the requirements set itself assigns it a Story — this matrix does not manufacture false coverage to reach 12/12.**

---

_This completes the planned `A02-2-TEST-STRATEGY` set: TS-000 (master strategy), TS-001–TS-009 (per-section plans, 1:1 with the requirements' 9 sections), TS-010–TS-012 (cross-cutting NFR/security/migration-fidelity strategies), and this coverage matrix. All are forward test strategies for `TDWebsite2`, a system not yet built — see TS-000's and README's framing notes._
