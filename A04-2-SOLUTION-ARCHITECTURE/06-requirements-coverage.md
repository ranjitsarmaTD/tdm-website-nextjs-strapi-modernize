# 06 — Requirements Coverage

> Traceability evidence: every one of the **27 Epics** in `A01-2-REQUIREMENTS/01`–`09` mapped to the component(s) in `01-component-architecture.md` that implement it. This is the coverage matrix `A01-2-REQUIREMENTS/00-overview-and-architecture.md` §1 requires every downstream coverage document to reconcile against (27/27 Epics, 80/80 Stories, 57/57 components).

---

## 1. Epic → component coverage matrix

| Epic | Title | Section | Components implementing it | Coverage |
|------|-------|---------|------------------------------|----------|
| EP-01 | Global Site Header & Navigation | A | `SEC-HEADER`, `SEC-MOBILE-MENU` | Full |
| EP-02 | Global Footer & Site Settings (Strapi `global` single type) | A | `CMS-GLOBAL`, `SEC-FOOTER` | Full |
| EP-03 | Shared Page Chrome (Preloader, Scroll-to-Top, Analytics) | A | `SEC-PRELOADER`, `SEC-SCROLLTOP`, `SEC-ANALYTICS` | Full |
| EP-04 | Homepage Hero Slider | B | `PAGE-HOME`, `SEC-HERO` | Full |
| EP-05 | Homepage About Teaser | B | `PAGE-HOME`, `SEC-ABOUT-TEASER` | Full |
| EP-06 | Homepage Services Carousel (CMS-driven) | B | `PAGE-HOME`, `SEC-SERVICES`, `CMS-SERVICE` | Full |
| EP-07 | Homepage Stats Counters | B | `PAGE-HOME`, `SEC-STATS` | Full |
| EP-08 | Homepage News Marquee & News Grid | B | `PAGE-HOME`, `SEC-NEWS`, `CMS-NEWS-ARTICLE` | Full |
| EP-09 | Homepage Testimonials Carousel | B | `PAGE-HOME`, `SEC-TESTIMONIALS`, `CMS-TESTIMONIAL` | Full |
| EP-10 | Homepage Partner Logo Strip | B | `PAGE-HOME`, `SEC-PARTNERS`, `CMS-PARTNER` | Full |
| EP-11 | Homepage Case Studies Carousel | B | `PAGE-HOME`, `SEC-CASE-STUDIES`, `CMS-CASE-STUDY` | Full |
| EP-12 | About "Our Story" | C | `PAGE-ABOUT`, `SEC-OUR-STORY` | Full |
| EP-13 | Team Member Directory | C | `PAGE-ABOUT`, `SEC-TEAM-GRID`, `CMS-TEAM-MEMBER` | Full |
| EP-14 | Services Detail Page & Service Content Type | D | `PAGE-SERVICES`, `SEC-SERVICE-DETAIL`, `SEC-SERVICE-SIDEBAR-NAV`, `CMS-SERVICE` | Full |
| EP-15 | Bootcamp Landing Page & Program Content | E | `PAGE-BOOTCAMP`, `SEC-BOOTCAMP-HERO`, `SEC-BOOTCAMP-TIERS`, `SEC-BOOTCAMP-AUDIENCE`, `SEC-BOOTCAMP-PROGRAMS`, `SEC-BOOTCAMP-COMPARE`, `SEC-BOOTCAMP-REG`, `SEC-BOOTCAMP-CTA` | Full — content itself is structurally hard-coded, not CMS-driven (see §3, gap G1) |
| EP-16 | Bootcamp Structured Data (JSON-LD) | E | `PAGE-BOOTCAMP`, `SEC-BOOTCAMP-JSONLD` | Full |
| EP-17 | Partnership Page & Partner Content Type | F | `PAGE-PARTNERSHIP`, `SEC-PARTNER-CARDS`, `SEC-PARTNER-CTA`, `CMS-PARTNER` | Full |
| EP-18 | Contact Form & Submission Handling | G | `PAGE-CONTACT`, `SEC-CONTACT-FORM`, `API-CONTACT`, `CMS-CONTACT-SUBMISSION` | Full — Turnstile (EP-18-S5) intentionally deferred, P4, not a coverage gap (see §3) |
| EP-19 | Contact Page Chrome | G | `PAGE-CONTACT`, `SEC-CONTACT-INFO`, `CMS-GLOBAL` | Full |
| EP-20 | News Article Collection & Detail Route | H | `CMS-NEWS-ARTICLE`, `PAGE-NEWS`, `PAGE-NEWS-DETAIL` | Full |
| EP-21 | Case Study Collection & Detail Route | H | `CMS-CASE-STUDY`, `PAGE-CASE-STUDIES`, `PAGE-CASE-STUDY-DETAIL` | Full |
| EP-22 | Testimonial Collection & Detail Route | H | `CMS-TESTIMONIAL`, `PAGE-TESTIMONIAL-DETAIL` | Full |
| EP-23 | Strapi Content Modeling & Permissions | I | `CMS-GLOBAL`, `CMS-CASE-STUDY`, `CMS-NEWS-ARTICLE`, `CMS-SERVICE`, `CMS-TEAM-MEMBER`, `CMS-PARTNER`, `CMS-TESTIMONIAL`, `CMS-CONTACT-SUBMISSION` | Full |
| EP-24 | SEO, Metadata, Sitemap & 301 Redirects | I | `SVC-SEO`, `SVC-REDIRECTS`, `CMS-CASE-STUDY`, `CMS-NEWS-ARTICLE`, `CMS-SERVICE` | Full |
| EP-25 | Analytics & Structured Data | I | `SVC-SEO`, `CMS-NEWS-ARTICLE` | Full — GA4 tag rendering itself is `SEC-ANALYTICS` (EP-03); EP-25 owns continuity/JSON-LD generation, not the tag placement |
| EP-26 | On-Demand ISR / Revalidation Webhook | I | `API-REVALIDATE`, `CMS-GLOBAL`, `CMS-SERVICE`, `CMS-CASE-STUDY`, `CMS-NEWS-ARTICLE`, `CMS-TEAM-MEMBER`, `CMS-PARTNER`, `CMS-TESTIMONIAL` | Full |
| EP-27 | Hosting, Deployment & CI/CD (Hostinger VPS) | I | `INFRA-NGINX`, `INFRA-PM2`, `INFRA-POSTGRES`, `INFRA-CI` | Full — CI/CD is designed, not yet activated (EP-27-S5); this is a stated scope boundary, not a gap (see §3) |

**27/27 Epics mapped. Every Epic resolves to at least one component; every component in the matrix above is defined in `01-component-architecture.md`.**

---

## 2. Component-ID reconciliation (inverse direction)

`01-component-architecture.md` §8 confirms the inverse check: **57 distinct component IDs** (`11 PAGE-* + 30 SEC-* + 2 API-* + 8 CMS-* + 2 SVC-* + 4 INFRA-*`) referenced across the 80 Stories' `**Components:**` lines, cross-checked by grepping every file in `A01-2-REQUIREMENTS/`. Every one of the 57 is defined exactly once in doc 01, with an owning app, file-path convention, responsibility, and Epic reference — **zero orphans in either direction**:

- Every component ID that appears in a Story's `**Components:**` line has a definition in doc 01. ✓
- Every component defined in doc 01 traces back to at least one Epic in the table above. ✓

The one naming nuance already resolved in doc 01 §8: `06-partnership.md`'s architecture diagram labels the homepage partner section `SEC-HOME-PARTNER-STRIP` for readability, but every actual Story `**Components:**` line uses `SEC-PARTNERS` — there is no orphaned second component behind that diagram label.

---

## 3. Honest gaps & deferred scope (not coverage failures, but flagged per this document's mandate to flag gaps honestly)

| # | Gap | Epic(s) | Why it is not a coverage failure |
|---|-----|---------|-------------------------------------|
| G1 | No `bootcamp-program` Strapi content type exists. `SEC-BOOTCAMP-PROGRAMS` and `SEC-BOOTCAMP-COMPARE` render structurally hard-coded v1 data with no `CMS-*` backing (doc 01 §8, doc 03 §6 O1). | EP-15 | This is a stated, deliberate P4 deferral in the requirements themselves (`A01-2-REQUIREMENTS/00-overview-and-architecture.md` and overview §10 R2), not an unmapped Epic — EP-15's Stories are fully covered by the `PAGE-BOOTCAMP`/`SEC-BOOTCAMP-*` components as structural templates; the *content model* for programs is the deferred piece, tracked explicitly rather than silently dropped. |
| G2 | Cloudflare Turnstile bot protection is provisioned (env vars only) but not integrated into `API-CONTACT`. | EP-18 (Story EP-18-S5) | EP-18-S5 is itself the Story that documents this as an intentional, P4-labeled deferral — the Epic is fully covered by its Stories; one Story's acceptance criteria are explicitly "environment variables present, integration deferred," which this component catalog satisfies via `API-CONTACT`/`SEC-CONTACT-FORM` as-is. |
| G3 | CI/CD (`infra/github/deploy.yml`) is designed but not yet copied into `.github/workflows/` or activated with SSH secrets. | EP-27 (Story EP-27-S5) | Same pattern as G2 — EP-27-S5's own acceptance criteria are about the pipeline being *designed*, version-controlled, and honestly not described as running (principle P8, overview §2) — `INFRA-CI` satisfies exactly that Story as written. |
| G4 | No monitoring/alerting on `API-REVALIDATE` webhook failure rate, and no PII erasure workflow beyond admin-panel delete for `contact-submission`. | EP-26, EP-23 | Both are explicit out-of-scope carve-outs in their source Stories (EP-26-S3, and no Story requests a right-to-be-forgotten flow) — flagged in `04-content-editing-pipeline-and-data-exchange.md` §7 and `05-security-and-nfr.md` §5 as open questions, not unmet requirements. |

No Epic, Story, or component ID is unaccounted for. G1–G4 are the requirements' own documented deferrals surfacing consistently across this coverage matrix, the component catalog, and the pipeline/security documents — not architecture gaps introduced by this document set.
