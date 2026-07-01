# 01 — Component Architecture

> The authoritative component catalog for `TDWebsite2`. Every `PAGE-*`/`SEC-*`/`API-*`/`CMS-*`/`SVC-*`/`INFRA-*` ID referenced in any Story's **Components:** line across `A01-2-REQUIREMENTS/01`–`09` resolves to exactly one definition below. Cross-checked by grep against all 80 Stories: **57 distinct component IDs, zero orphans** (confirmed in `06-requirements-coverage.md` §3).

Every component is **to be built** against this contract by the Developer agent's builder personas (`next-porter`, `strapi-modeler`, `cms-extender`, `deploy-engineer`, `seo-migrator`, `integration-engineer`); none of it exists yet in a deployed `TDWebsite2`.

---

## 1. Naming & file-path conventions

| Prefix | Kind | Owning app | Path convention |
|--------|------|-----------|------------------|
| `PAGE-*` | Route (Next.js Server Component page) | `apps/web` | `apps/web/app/<route>/page.tsx` (or `[slug]/page.tsx` for detail routes) |
| `SEC-*` | Section/layout component rendered inside a page | `apps/web` | `apps/web/components/{layout,sections/<page>}/<Name>.tsx` |
| `API-*` | Next.js Route Handler | `apps/web` | `apps/web/app/api/<name>/route.ts` |
| `CMS-*` | Strapi content type or single type | `apps/cms` | `apps/cms/src/api/<content-type>/content-types/<content-type>/schema.json` (+ `controllers/`, `routes/`, `services/`) |
| `SVC-*` | Cross-cutting front-end service (no dedicated route) | `apps/web` | `apps/web/lib/<name>.ts` |
| `INFRA-*` | Deployment/ops artifact | `infra` | `infra/<area>/**` |

---

## 2. `PAGE-*` — Route components (`apps/web`)

| ID | Route | File path | Responsibility | Epic(s) |
|----|-------|-----------|-----------------|---------|
| `PAGE-HOME` | `/` | `apps/web/app/page.tsx` | Composes the 8 homepage sections (hero → case studies) from CMS + static data. | EP-04–EP-11 |
| `PAGE-ABOUT` | `/about` | `apps/web/app/about/page.tsx` | Renders "Our Story" narrative and the team leadership grid. | EP-12, EP-13 |
| `PAGE-SERVICES` | `/services` | `apps/web/app/services/page.tsx` | Renders 4 service detail sections plus the shared sidebar nav widget, from the `service` collection. | EP-14 |
| `PAGE-BOOTCAMP` | `/bootcamp` | `apps/web/app/bootcamp/page.tsx` | Self-contained micro-site template (own design system) for the AI Bootcamp landing page; hosts 8 sections plus JSON-LD. | EP-15, EP-16 |
| `PAGE-PARTNERSHIP` | `/partnership` | `apps/web/app/partnership/page.tsx` | Renders alternating partner-card rows and the closing CTA from the `partner` collection. | EP-17 |
| `PAGE-CONTACT` | `/contact` | `apps/web/app/contact/page.tsx` | Renders the lead-capture form and contact info chrome (from `global`). | EP-18, EP-19 |
| `PAGE-NEWS` | `/news` | `apps/web/app/news/page.tsx` | Listing page for the `news-article` collection. | EP-20 |
| `PAGE-NEWS-DETAIL` | `/news/[slug]` | `apps/web/app/news/[slug]/page.tsx` | Detail route for a single news article, flexible body layout. | EP-20 |
| `PAGE-CASE-STUDIES` | `/case-studies` | `apps/web/app/case-studies/page.tsx` | Listing page for the `case-study` collection; owns the `case8` orphan-page disposition. | EP-21 |
| `PAGE-CASE-STUDY-DETAIL` | `/case-studies/[slug]` | `apps/web/app/case-studies/[slug]/page.tsx` | Detail route for a single case study. | EP-21 |
| `PAGE-TESTIMONIAL-DETAIL` | `/testimonials/[slug]` | `apps/web/app/testimonials/[slug]/page.tsx` | Detail route for a single testimonial (both short-quote and long-form body formats); there is no `/testimonials` index route — testimonials are discovered via the homepage carousel and case-study cross-links. | EP-22 |

## 3. `SEC-*` — Section components (`apps/web`)

### 3.1 Global shell (Section A)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SEC-HEADER` | `apps/web/components/layout/SiteHeader.tsx` | Shared desktop main navigation, incl. the "Case Studies" dropdown submenu and sticky/absolute scroll behavior; collapses the legacy hand-duplicated per-page markup into one component. | EP-01 |
| `SEC-MOBILE-MENU` | `apps/web/components/layout/MobileMenu.tsx` | Off-canvas mobile navigation, shares the dropdown submenu markup with `SEC-HEADER`. | EP-01 |
| `SEC-FOOTER` | `apps/web/components/layout/SiteFooter.tsx` | Renders address (preserved line breaks), nav links, social icons, and copyright — all sourced from `CMS-GLOBAL`. | EP-02 |
| `SEC-PRELOADER` | `apps/web/components/layout/Preloader.tsx` | Page-load preloader overlay with a guaranteed-clear safeguard (no infinite-spinner failure mode). | EP-03 |
| `SEC-SCROLLTOP` | `apps/web/components/layout/ScrollToTop.tsx` | Scroll-to-top control with an SVG progress-circle indicator. | EP-03 |
| `SEC-ANALYTICS` | `apps/web/components/layout/Analytics.tsx` | Injects the GA4 tag on every route via the root layout. | EP-03 |

### 3.2 Homepage (Section B)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SEC-HERO` | `apps/web/components/sections/home/Hero.tsx` | 6-slide fade hero, per-slide CTA pair, ported GSAP/ScrollTrigger entrance timing. | EP-04 |
| `SEC-ABOUT-TEASER` | `apps/web/components/sections/home/AboutTeaser.tsx` | Static "About TRIEDATUM" teaser, copy kept consistent with `SEC-OUR-STORY`. | EP-05 |
| `SEC-SERVICES` | `apps/web/components/sections/home/Services.tsx` | 4-card services carousel from `CMS-SERVICE`; isolates the "Read Details" expand/collapse interaction in its own client component. | EP-06 |
| `SEC-STATS` | `apps/web/components/sections/home/Stats.tsx` | 4 stat cards with count-up-on-scroll animation and exact preserved values/labels. | EP-07 |
| `SEC-NEWS` | `apps/web/components/sections/home/News.tsx` | Scrolling news-headline ticker (seamless CSS-loop) plus the 4-card "Latest News" grid, both from `CMS-NEWS-ARTICLE`. | EP-08 |
| `SEC-TESTIMONIALS` | `apps/web/components/sections/home/Testimonials.tsx` | 2-card testimonial Swiper from `CMS-TESTIMONIAL`, preserving quote-icon/name/designation formatting. | EP-09 |
| `SEC-PARTNERS` | `apps/web/components/sections/home/Partners.tsx` | Auto-scrolling partner-logo strip from `CMS-PARTNER` (pruning stale records); each logo links to `PAGE-PARTNERSHIP`. Referred to informally as the "home partner strip" in `06-partnership.md`'s diagram — same component, no separate ID. | EP-10 |
| `SEC-CASE-STUDIES` | `apps/web/components/sections/home/CaseStudies.tsx` | Case Studies Swiper from `CMS-CASE-STUDY`; "View All" routes to `PAGE-CASE-STUDIES`. | EP-11 |

### 3.3 About & Team (Section C)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SEC-OUR-STORY` | `apps/web/components/sections/about/OurStory.tsx` | "Our Story" narrative section, static copy. | EP-12 |
| `SEC-TEAM-GRID` | `apps/web/components/sections/about/TeamGrid.tsx` | Leadership grid rendered from `CMS-TEAM-MEMBER`. | EP-13 |

### 3.4 Services (Section D)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SEC-SERVICE-DETAIL` | `apps/web/components/sections/services/ServiceDetail.tsx` | Renders one of the 4 service detail sections with anchor-id parity to the legacy page; carries the "Read a case study" outbound-link preserve/flag decision. | EP-14 |
| `SEC-SERVICE-SIDEBAR-NAV` | `apps/web/components/sections/services/ServiceSidebarNav.tsx` | Shared "Our Services" sidebar nav widget, rendered once and shared by all 4 detail sections. | EP-14 |

### 3.5 AI Bootcamp (Section E)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SEC-BOOTCAMP-HERO` | `apps/web/components/sections/bootcamp/Hero.tsx` | Hero and trust bar. | EP-15 |
| `SEC-BOOTCAMP-TIERS` | `apps/web/components/sections/bootcamp/Tiers.tsx` | Tier explainer and "Why TrieDatum" grid. | EP-15 |
| `SEC-BOOTCAMP-AUDIENCE` | `apps/web/components/sections/bootcamp/Audience.tsx` | Role chips and industry cards. | EP-15 |
| `SEC-BOOTCAMP-PROGRAMS` | `apps/web/components/sections/bootcamp/Programs.tsx` | 5 program cards across 2 tiers (static v1 content — see `CMS-*` note in §6, R2). | EP-15 |
| `SEC-BOOTCAMP-COMPARE` | `apps/web/components/sections/bootcamp/Compare.tsx` | Program comparison table. | EP-15 |
| `SEC-BOOTCAMP-REG` | `apps/web/components/sections/bootcamp/Regulatory.tsx` | Regulatory/standards badges and delivery-model cards. | EP-15 |
| `SEC-BOOTCAMP-CTA` | `apps/web/components/sections/bootcamp/Cta.tsx` | Closing CTA section. | EP-15 |
| `SEC-BOOTCAMP-JSONLD` | `apps/web/components/sections/bootcamp/JsonLd.tsx` | Generates `EducationalOrganization` + `OfferCatalog` JSON-LD from the program data used by `SEC-BOOTCAMP-PROGRAMS`/`SEC-BOOTCAMP-COMPARE`. | EP-16 |

### 3.6 Partnership (Section F)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SEC-PARTNER-CARDS` | `apps/web/components/sections/partnership/PartnerCards.tsx` | Alternating image/content partner-card rows from `CMS-PARTNER`. | EP-17 |
| `SEC-PARTNER-CTA` | `apps/web/components/sections/partnership/PartnerCta.tsx` | Closing "Strategic Partnerships" gradient CTA block. | EP-17 |

### 3.7 Contact & Lead Capture (Section G)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SEC-CONTACT-FORM` | `apps/web/components/sections/contact/ContactForm.tsx` | Legacy-parity form fields, client-side validation, honeypot spam field; posts to `API-CONTACT`. | EP-18 |
| `SEC-CONTACT-INFO` | `apps/web/components/sections/contact/ContactInfo.tsx` | Contact page info chrome (address/phone/hours) sourced from `CMS-GLOBAL`. | EP-19 |

## 4. `API-*` — Route handlers (`apps/web`)

| ID | Path | File path | Responsibility | Epic(s) |
|----|------|-----------|-----------------|---------|
| `API-CONTACT` | `POST /api/contact` | `apps/web/app/api/contact/route.ts` | Validates the payload, enforces the honeypot, writes to `CMS-CONTACT-SUBMISSION` via `packages/shared`, and best-effort-notifies via Resend without losing the submission if the email leg fails. Replaces legacy `mail.php`. | EP-18 |
| `API-REVALIDATE` | `POST /api/revalidate` | `apps/web/app/api/revalidate/route.ts` | Secret-header-gated endpoint invoked by Strapi lifecycle hooks; calls `revalidatePath()` for the affected route(s); falls back gracefully (no error surfaced to Strapi) if invocation fails, relying on the timed ISR window. | EP-26 |

## 5. `CMS-*` — Strapi content types & single types (`apps/cms`)

| ID | Strapi kind | UID / folder | Responsibility | Epic(s) |
|----|-------------|---------------|-----------------|---------|
| `CMS-GLOBAL` | `singleType` | `apps/cms/src/api/global/content-types/global/` | Footer address/links/social, contact-page info chrome — replaces `footer_content.json`. | EP-02, EP-19, EP-23, EP-26 |
| `CMS-SERVICE` | `collectionType` | `apps/cms/src/api/service/content-types/service/` | The 4 services shown on `PAGE-SERVICES` and the homepage carousel. | EP-06, EP-14, EP-23, EP-24, EP-26 |
| `CMS-NEWS-ARTICLE` | `collectionType` | `apps/cms/src/api/news-article/content-types/news-article/` | News items for the ticker, homepage grid, and `/news` listing/detail. | EP-08, EP-20, EP-23, EP-24, EP-25, EP-26 |
| `CMS-TESTIMONIAL` | `collectionType` | `apps/cms/src/api/testimonial/content-types/testimonial/` | Testimonials for the homepage carousel and `/testimonials/[slug]` detail (both short-quote and long-form formats). | EP-09, EP-22, EP-23, EP-26 |
| `CMS-PARTNER` | `collectionType` | `apps/cms/src/api/partner/content-types/partner/` | Technology partners shown on the homepage strip and `PAGE-PARTNERSHIP`; shared between the two surfaces. | EP-10, EP-17, EP-23, EP-26 |
| `CMS-CASE-STUDY` | `collectionType` | `apps/cms/src/api/case-study/content-types/case-study/` | Case studies for the homepage carousel and `/case-studies` listing/detail, incl. the `case8` orphan and 5 retitled entries. | EP-11, EP-21, EP-23, EP-24, EP-26 |
| `CMS-TEAM-MEMBER` | `collectionType` | `apps/cms/src/api/team-member/content-types/team-member/` | Leadership team entries for the About page grid. | EP-13, EP-23, EP-26 |
| `CMS-CONTACT-SUBMISSION` | `collectionType` (no `draftAndPublish`) | `apps/cms/src/api/contact-submission/content-types/contact-submission/` | Stores lead-capture submissions from `API-CONTACT`; Public role is `create`-only, never `find`/`update`/`delete`. | EP-18, EP-23 |

## 6. `SVC-*` — Cross-cutting front-end services (`apps/web`)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `SVC-SEO` | `apps/web/lib/seo.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts` | Wires the Strapi `shared.seo` component into every route's `generateMetadata`; generates `sitemap.xml`/`robots.txt`; emits canonical URLs, Open Graph tags, and schema.org JSON-LD (news/case-study/service where applicable) from CMS data; preserves GA4 continuity. | EP-24, EP-25 |
| `SVC-REDIRECTS` | `apps/web/next.config.js` (`redirects()`), `apps/web/lib/redirect-map.ts` | The exhaustive 301 redirect table for all 23 legacy URLs. There is no legacy redirect mechanism — this is a net-new component. | EP-24 |

## 7. `INFRA-*` — Deployment & ops (`infra/`)

| ID | File path | Responsibility | Epic(s) |
|----|-----------|-----------------|---------|
| `INFRA-NGINX` | `infra/nginx/*.conf` | Reverse-proxy server blocks + TLS termination in front of the two PM2 processes. | EP-27 |
| `INFRA-PM2` | `infra/pm2/ecosystem.config.js`, `infra/scripts/deploy.sh` | Runs `apps/web` (`:3000`) and `apps/cms` (`:1337`) as PM2 fork-mode processes with `max_memory_restart` caps, preserving the `apps/cms` hoist exclusion; `deploy.sh` drives zero-downtime reloads. | EP-27 |
| `INFRA-POSTGRES` | `infra/postgres/*.sql`, `infra/scripts/backup.sh` | Provisions PostgreSQL for local dev and production; `backup.sh` runs nightly `pg_dump` with 30-day retention. | EP-27 |
| `INFRA-CI` | `infra/github/deploy.yml` | The designed-but-not-yet-activated CI/CD pipeline; activation requires copying into `.github/workflows/` plus SSH secrets provisioning (see overview §10, R4). | EP-27 |

---

## 8. Coverage summary

**57 components total:** 11 `PAGE-*` + 30 `SEC-*` + 2 `API-*` + 8 `CMS-*` + 2 `SVC-*` + 4 `INFRA-*`. Every ID is defined exactly once above and traced to at least one Epic. Full Epic → component reconciliation (the inverse direction, every Epic to its components) is in `06-requirements-coverage.md`.

**Note on `SEC-HOME-PARTNER-STRIP`:** `06-partnership.md`'s architecture diagram labels the homepage partner section `SEC-HOME-PARTNER-STRIP` for readability. Every Story's actual `**Components:**` line uses `SEC-PARTNERS` (defined in §3.2) for that section — there is no separate component behind the diagram label.

**`[RISKS / OPEN QUESTIONS]`:** `SEC-BOOTCAMP-PROGRAMS`/`SEC-BOOTCAMP-COMPARE` render static v1 program data with no backing `CMS-*` content type — a `bootcamp-program` collection type is explicitly deferred (P4, overview §10 R2). If it lands in a fast-follow, this document and `02-data-architecture-and-content-model.md` both need a new `CMS-BOOTCAMP-PROGRAM` entry.
