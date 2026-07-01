# TrieDatum Website Modernization — Requirements

Analyst-produced Epics and Stories for modernizing **TrieDatum's marketing website** (repo `TDWebsite` — a static Themeholy Bootstrap 5 + jQuery HTML site: 23 HTML pages, a `mail.php` contact handler, and a SASS source tree, with no data layer, no build pipeline, and no test suite) onto **Next.js 14 (App Router) + Strapi v5 + PostgreSQL** (target repo `TDWebsite2`, an npm-workspaces monorepo: `apps/web` + `apps/cms` + `packages/shared` + `packages/seed` + `infra/` + `docs/`).

These documents are written to be turned into **Jira tickets** in a follow-on session: every Story is in `As a <role> I want <goal> so that <benefit>` form with Gherkin acceptance criteria, story points, priority, labels, components, and a Definition of Done.

## Reading order

1. **[00-overview-and-architecture.md](00-overview-and-architecture.md)** — start here. Roles, domain glossary, target architecture, entity-relationship model, the content-editing pipeline, story conventions, and the section index. Every section document depends on it.
2. The nine **section documents** below (one site area each).
3. **[SOURCE-COVERAGE.md](SOURCE-COVERAGE.md)** — traceability evidence: every legacy page, script hook, and data file → the Epic/Story that covers it.

## Section index

| # | Document | Section | Epics | Stories |
|---|---|---|---|---|
| 01 | [global-shell-navigation-and-footer](01-global-shell-navigation-and-footer.md) | A — Global Site Shell, Navigation & Footer | EP-01 – EP-03 | 11 |
| 02 | [homepage](02-homepage.md) | B — Homepage | EP-04 – EP-11 | 17 |
| 03 | [about-and-team](03-about-and-team.md) | C — About & Team | EP-12 – EP-13 | 3 |
| 04 | [services](04-services.md) | D — Services | EP-14 | 4 |
| 05 | [ai-bootcamp](05-ai-bootcamp.md) | E — AI Bootcamp | EP-15 – EP-16 | 8 |
| 06 | [partnership](06-partnership.md) | F — Partnership | EP-17 | 3 |
| 07 | [contact-and-lead-capture](07-contact-and-lead-capture.md) | G — Contact & Lead Capture | EP-18 – EP-19 | 6 |
| 08 | [news-case-studies-and-testimonials](08-news-case-studies-and-testimonials.md) | H — News, Case Studies & Testimonials | EP-20 – EP-22 | 10 |
| 09 | [cms-seo-and-platform](09-cms-seo-and-platform.md) | I — CMS Platform, SEO, Redirects, Analytics & Hosting | EP-23 – EP-27 | 18 |
| — | [SOURCE-COVERAGE](SOURCE-COVERAGE.md) | Traceability matrix | — | — |
| | | **Total** | **27 Epics** | **80 Stories** |

## Epic map

```
A. Global Site Shell, Navigation & Footer
   EP-01 Global Site Header & Navigation        EP-02 Global Footer & Site Settings (global single type)
   EP-03 Shared Page Chrome (Preloader, Scroll-to-Top, Analytics)
B. Homepage
   EP-04 Homepage Hero Slider                    EP-05 Homepage About Teaser
   EP-06 Homepage Services Carousel (CMS-driven) EP-07 Homepage Stats Counters
   EP-08 Homepage News Marquee & News Grid        EP-09 Homepage Testimonials Carousel
   EP-10 Homepage Partner Logo Strip              EP-11 Homepage Case Studies Carousel
C. About & Team
   EP-12 About "Our Story"                       EP-13 Team Member Directory
D. Services
   EP-14 Services Detail Page & Service Content Type
E. AI Bootcamp
   EP-15 Bootcamp Landing Page & Program Content EP-16 Bootcamp Structured Data (JSON-LD)
F. Partnership
   EP-17 Partnership Page & Partner Content Type
G. Contact & Lead Capture
   EP-18 Contact Form & Submission Handling       EP-19 Contact Page Chrome
H. News, Case Studies & Testimonials
   EP-20 News Article Collection & Detail Route   EP-21 Case Study Collection & Detail Route
   EP-22 Testimonial Collection & Detail Route
I. CMS Platform, SEO, Redirects, Analytics & Hosting
   EP-23 Strapi Content Modeling & Permissions    EP-24 SEO, Metadata, Sitemap & 301 Redirects
   EP-25 Analytics & Structured Data              EP-26 On-Demand ISR / Revalidation Webhook
   EP-27 Hosting, Deployment & CI/CD (Hostinger VPS)
```

## Critical path (suggested delivery order)

`EP-23` (Strapi content modeling & permissions — the platform every other Epic reads from) → `EP-01`–`EP-03` (global header/nav, footer, page chrome) → the P1 homepage sections (`EP-04` hero, `EP-06` services carousel, `EP-07` stats, `EP-08` news, `EP-11` case studies) → `EP-13` (team directory) → `EP-14` (services detail page) → `EP-15` (bootcamp landing) → `EP-18` (contact form & submission handling — the site's single highest-value conversion surface) → `EP-24`/`EP-25` (SEO metadata, redirects, sitemap, analytics continuity) → `EP-27` (hosting, deployment, backups) → P2/P3 fast-follow (`EP-05`, `EP-09`, `EP-10`, `EP-12`, `EP-16`, `EP-17`, `EP-19`–`EP-22`, `EP-26`) → explicitly deferred P4 work (Cloudflare Turnstile in `EP-18-S5`, the `bootcamp-program` collection-type deferral noted in `EP-15-S4`, and CI/CD pipeline activation in `EP-27-S5`). Every Story carries its own Priority (P1–P4); this is the section-level sequencing, not a substitute for per-story prioritization during sprint planning.

## Using these for Jira generation (follow-on session)

- Each **Epic** becomes a Jira Epic; the `EP-nn` ID is the stable external reference.
- Each **Story** (`EP-nn-Sn`) becomes a Story under its Epic, with the Title, Description, Acceptance Criteria, Story Points, Priority, Labels, Components, and Epic Link already populated.
- `SOURCE-COVERAGE.md` provides the legacy-page traceability to attach to each ticket and to verify scope completeness before sprint planning begins.
- Every section document ends with the same Definition of Done checklist (see `00-overview-and-architecture.md` §7) — carry it into the Jira issue template rather than re-authoring it per ticket.

## Coverage & open decisions

- **Coverage:** all 23 legacy `TDWebsite` HTML pages, `mail.php`, `assets/data/footer_content.json`, and the shared `assets/js/main.js` interaction hooks are mapped to at least one Epic/Story; see `SOURCE-COVERAGE.md` for the full traceability matrix.
- **Preserve-or-retire register:** dead/commented-out legacy code, content discrepancies, and scope deferrals surfaced during analysis are tracked in `SOURCE-COVERAGE.md`'s preserve-or-retire register and require an explicit content-owner or engineering decision before launch sign-off, including:
  - `case8.html`'s orphan status — excluded from both the nav dropdown and the homepage carousel on the legacy site, reachable only by direct URL (`EP-21-S4`).
  - Generic, duplicated SEO metadata ("TrieDatum - Your Trusted Partner in AI & Data" reused verbatim across `index.html`, `about.html`, `service.html`, most `case-study/*.html`, and half of `news/*.html`) — a real content defect to fix during migration (`EP-24-S1`).
  - `about.html`'s disabled hero-slider block (`#heroSlide18`) and disabled alternate team-bio carousel (`#testiSlider2`, which also carries a "Raj" vs. "Rajesh" Nadipalli name discrepancy) — both dead code requiring a content-owner disposition rather than silent omission (`EP-12-S1`, `EP-13-S2`).
  - `service.html`'s disabled alternate copy block referencing a `case6.html` case-study link for AI-Enabled Migrations, left unlinked in the live page (`EP-14-S4`).
  - The CI/CD pipeline at `infra/github/deploy.yml` — fully designed and version-controlled, but explicitly **not yet** copied into an active `.github/workflows/` directory; this must never be reported as "already automated" (`EP-27-S5`).
- **Source of analysis:** the legacy `TDWebsite` repository was reviewed page-by-page; this requirements set reflects observed behavior. Where legacy pages carried gaps the static site never had a mechanism to fill — no redirect handling, no sitemap/robots.txt, no CI/CD, no durable contact-form persistence — the Stories call these out as modernization improvements to be built, not as documentation of capabilities that already exist in `TDWebsite2`.

---
_Generated by the Analyst agent. Domain roles, glossary, and conventions are defined in [00-overview-and-architecture.md](00-overview-and-architecture.md)._
