# Source Coverage Matrix

> **Purpose:** prove that **every legacy page, script hook, and data file in `TDWebsite`** maps to at least one Epic/Story in this requirements set. This is the traceability evidence for the migration: for each legacy artifact, the Epic/Story that covers the capability it currently implements in the site being replaced.

## How to read this document

- Every row's Epic/Story ID resolves to the section documents (`01`–`09`); see [`00-overview-and-architecture.md`](00-overview-and-architecture.md) §1 for the file/section index.
- Legacy element/line references are pulled verbatim from each Story's **Source:** footnote in the section documents — no ID below was invented for this matrix.
- **Dead code, orphaned assets, content discrepancies, and scope deferrals** are recorded explicitly as *preserve-or-retire* decisions in the register at the end of this document, rather than silently dropped or silently resolved.
- Legacy file names below were confirmed directly against the `TDWebsite` repository (23 `.html` pages, `mail.php`, `assets/data/footer_content.json`, `assets/js/main.js`, `assets/img/partners/*`).

## Coverage summary

| Category | Count | Coverage |
|---|---|---|
| Static top-level pages (`index`, `about`, `service`, `bootcamp`, `partnership`, `contact`, `triedatum-news`) | 7 | 100% |
| Case-study detail pages (`case-study/case1.html`–`case10.html`) | 10 | 100% |
| News article pages + listing page | 4 + 1 | 100% |
| Testimonial detail pages | 2 | 100% |
| **Total legacy HTML pages** | **23** | **100%** |
| Contact form handler (`mail.php`) | 1 | 100% |
| Footer/contact data file (`assets/data/footer_content.json`) | 1 | 100% |
| Shared JS interaction libraries (`assets/js/main.js`: Swiper, GSAP, CounterUp, Isotope, Tilt, Particles, Magnific Popup) | 7 | 4 of 7 explicitly story-mapped; 3 flagged (see preserve-or-retire register) |

---

## Section A — Global Site Shell, Navigation & Footer

### `index.html` (header/nav markup — hand-duplicated verbatim across all ~24 legacy pages)
| Legacy element | Epic/Story |
|---|---|
| `nav.main-menu`, lines ~494–547 | EP-01-S1 |
| `.th-menu-wrapper`, lines 412–468 | EP-01-S2 |
| `ul.sub-menu` Case Studies dropdown (desktop + mobile copies) | EP-01-S3 |
| `header.th-header.header-layout18.header-absolute` (present on every page) | EP-01-S4 |
| `#preloader`/`.preloader`, line 372 | EP-03-S1 |
| `.scroll-top` (present on every page; driven by `circle-progress.js`) | EP-03-S2 |
| inline `gtag` bootstrap snippet (duplicated verbatim in every page's `<head>`) | EP-03-S3 |

### `assets/data/footer_content.json`
| Legacy element | Epic/Story |
|---|---|
| Full field set (addresses, email, phone, links, social, copyright) | EP-02-S1 |
| `usAddress` / `indiaAddress` | EP-02-S2 |
| `links[]` / `social[]` | EP-02-S3 |
| `copyright` field | EP-02-S4 |
| Reused as the data source for contact-page info chrome | EP-19-S1 |

---

## Section B — Homepage (`index.html`, 2,304 lines)

| Legacy element | Epic/Story |
|---|---|
| `div.swiper.th-slider#heroSlide19`, lines 605–977 | EP-04-S1 |
| `.hero-inner .btn-group` per slide, lines 642–657, 704–719, 766–781, 826–841, 884–899, 942–957 | EP-04-S2 |
| `data-ani="slideinup"` / `data-ani-delay` attributes, lines 629–965 | EP-04-S3 |
| `div.space_abt#about-sec`, line 991 | EP-05-S1 |
| cross-reference to `about.html` "Our Story" narrative | EP-05-S2 |
| `#serviceSlider1`, lines 1062–1283 | EP-06-S1 |
| inline `<script>` (`toggleServiceCard`), lines 2293–2301 | EP-06-S2 |
| `div.bg-theme.space-extra` stat cards, lines 1294–1369 | EP-07-S1, EP-07-S2 |
| `.homepage-news-marquee`, lines 561–604 | EP-08-S1 |
| `#triedatum-news-sec`, lines 1377–1658 | EP-08-S2 |
| `#testiSlider9`, lines 1678–1753 | EP-09-S1, EP-09-S2 |
| `.minimal-partner-strip`, lines 1764–1888 | EP-10-S1, EP-10-S2 |
| `#caseStudySlider`, lines 1897–2102 | EP-11-S1 |
| absence of any case-studies listing page (the "View All" button instead links to `case-study/case1.html`) | EP-11-S2 |

---

## Section C — About & Team (`about.html`, 766 lines)

| Legacy element | Epic/Story |
|---|---|
| `section.bg-auto.space` (no `id`) "Our Story" narrative, lines 241–277 | EP-12-S1 |
| `.th-hero-wrapper.hero-18` / `#heroSlide18` — **dead/commented hero block**, lines 196–239 | EP-12-S1 (preserve-or-retire) |
| "Our Leadership" grid, `div.row.gy-40`, lines 330–544 | EP-13-S1, EP-13-S2 |
| `#testiSlider2` — **dead/commented alternate team-bio carousel**, lines 548–625 | EP-13-S2 (preserve-or-retire) |

---

## Section D — Services (`service.html`, 1,074 lines; cross-referenced with `index.html`)

| Legacy element | Epic/Story |
|---|---|
| `service.html` 4 detail sections, lines 280–908 + `index.html` `#serviceSlider1`, lines 1092–1283 (two independently-authored copies unified) | EP-14-S1 |
| 4 anchor-id'd sections (`#dataEng`, `#genAI`, `#advAna`, `#manSer`), lines 280–908; empty placeholder `<li>` spacing hack, lines 311–313 (+ equivalents) | EP-14-S2 |
| `aside.sidebar-area` "Our Services" widget, repeated at lines 341–357, 483–500, 610–627, 843–860 | EP-14-S3 |
| `a.line-btn` "Read a case study" links, lines 419 (`case2.html`), 541 (`case1.html`), 720 (`case7.html`); dead/commented block, lines 862–908, referencing `case6.html` for AI-Enabled Migrations | EP-14-S4 (preserve-or-retire) |

---

## Section E — AI Bootcamp (`bootcamp.html`, 2,602 lines — structural outlier, own inline CSS design system)

| Legacy element | Epic/Story |
|---|---|
| `header.hero` + `.trust-bar`, lines 1324–1392 | EP-15-S1 |
| `.how-section` + `.why-section`, lines 1394–1546 | EP-15-S2 |
| `.audience-section`, lines 1552–1654 | EP-15-S3 |
| `.programs-section#programs`, lines 1656–2130 | EP-15-S4 (no `bootcamp-program` collection type — documented P4 deferral) |
| `table.compare-tbl`, lines 2135–2200 | EP-15-S5 |
| `.reg-section` + `.delivery-section`, lines 2203–2343 | EP-15-S6 |
| `.cta-section`, lines 2349–2380 | EP-15-S7 |
| inline `<script type="application/ld+json">`, lines 2382–2439 (sole structured-data block on the entire legacy site) | EP-16-S1 |

---

## Section F — Partnership (`partnership.html`, 604 lines)

| Legacy element | Epic/Story |
|---|---|
| `div.partner-card-wrapper` blocks (Claude, Timbr, Databricks), lines 362–451 + style block, lines 226–355 | EP-17-S1, EP-17-S2 |
| `.partner-cta-box`, lines 454–465 (style, lines 337–355) | EP-17-S3 |
| `assets/img/partners/Cognition.png` — **orphaned asset**, unreferenced by any rendered partner-card markup | EP-17-S1 (preserve-or-retire) |

---

## Section G — Contact & Lead Capture (`contact.html`, 394 lines; `mail.php`)

| Legacy element | Epic/Story |
|---|---|
| `<form action="mail.php" method="POST" class="contact-form ajax-contact">`, lines 191–249 | EP-18-S1 |
| `.captcha` fake "I'm not a robot" checkbox + inline `onclick`, lines 224–242 | EP-18-S2 |
| `mail.php` — reads `name`/`subject`(as Company)/`email`/`number`/`message`, calls `mail()` | EP-18-S3 |
| `mail.php` — notification-email behavior (hardcoded recipient `contact@triedatum.com`) | EP-18-S4 |
| *(no legacy source — target-side deferral)* | EP-18-S5 |
| info-box markup surrounding the form (US Address / India Address / Email / Call) | EP-19-S1 |

---

## Section H — News, Case Studies & Testimonials

### `news/*.html` (4 articles) + `triedatum-news.html` (listing page)
| Legacy element | Epic/Story |
|---|---|
| `news/5-year-anniversary.html`, `news/new-engineering-office.html`, `news/trevor-cto.html`, `news/triedatum-bootcamp.html` | EP-20-S1 (seed) |
| Same 4 files + `triedatum-news.html` listing; Magnific Popup galleries in the first two | EP-20-S2 (render + lightbox) |
| All 5 legacy URLs (4 articles + listing page) | EP-20-S3 (301 redirects) |
| `triedatum-news.html` 5th hybrid card (links to `partnership.html`, not a news article) | EP-20-S1 (preserve-or-retire) |

### `case-study/case1.html`–`case-study/case10.html` (10 files, no legacy listing page)
| Legacy element | Epic/Story |
|---|---|
| All 10 files, incl. retitling `case1`, `case2`, `case4`, `case5`, `case8` (generic sitewide `<title>`) | EP-21-S1 |
| Absence of any case-studies listing page anywhere in `TDWebsite` | EP-21-S2 |
| All 10 legacy `case-study/caseN.html` URLs | EP-21-S3 (301 redirects) |
| `case-study/case8.html` specifically (orphan: absent from nav dropdown and homepage carousel) | EP-21-S4 (preserve-or-retire) |

### `testimonial/testimonial1.html`, `testimonial/testimonial2.html`
| Legacy element | Epic/Story |
|---|---|
| Both files (essay format + Q&A format) | EP-22-S1 (seed) |
| Dead/commented-out essay paragraph inside `testimonial2.html` (belongs to `testimonial1`'s subject matter) | EP-22-S1 (preserve-or-retire) |
| Both files | EP-22-S2 (detail-route rendering) |
| Both legacy URLs; shared-data-source confirmation with `index.html`'s `#testiSlider9` | EP-22-S3 |

---

## Section I — CMS Platform, SEO, Redirects, Analytics & Hosting

> Most of this section is a **synthesized platform requirement** — the legacy static site has no data layer, permission model, redirect mechanism, sitemap, cache, or deploy pipeline at all, so there is no single legacy file to cite for most of these stories. Rows below cite the closest legacy analog where one exists.

| Legacy element | Epic/Story |
|---|---|
| `assets/data/footer_content.json` (the one legacy "seam" already shaped like structured data) | EP-23-S1 |
| *(no legacy permission model — static HTML is world-readable by definition)* | EP-23-S2, EP-23-S3, EP-23-S4 |
| Generic, duplicated `<title>`/description/keywords string across `index.html`, `about.html`, `service.html`, most `case-study/*.html`, and half of `news/*.html` | EP-24-S1 (preserve-or-retire) |
| All 23 legacy `.html` URLs | EP-24-S2 (301 redirect table) |
| *(neither `sitemap.xml` nor `robots.txt` exists on `TDWebsite` today)* | EP-24-S3 |
| All ~24 legacy pages (zero `og:*` tags, no canonical-URL strategy anywhere) | EP-24-S4 |
| GA4 `gtag` snippet, property `G-HP0RJZ369Q`, present across all legacy pages | EP-25-S1 |
| `bootcamp.html`'s inline JSON-LD block (sole legacy page with structured data; pattern generalized site-wide) | EP-25-S2 |
| *(static HTML has no cache to invalidate)* | EP-26-S1, EP-26-S2, EP-26-S3 |
| *(static site required no application server, database, or deploy pipeline)* | EP-27-S1, EP-27-S2, EP-27-S3, EP-27-S4, EP-27-S5 |

### `assets/js/main.js` shared interaction hooks
| Library | Legacy usage | Epic/Story |
|---|---|---|
| Swiper | Hero (`#heroSlide19`), Services (`#serviceSlider1`), Testimonials (`#testiSlider9`), Case Studies (`#caseStudySlider`) | EP-04-S1, EP-06-S1, EP-09-S1, EP-11-S1 |
| GSAP / ScrollTrigger | Hero entrance animation (`data-ani="slideinup"`) | EP-04-S3 |
| CounterUp | Homepage stat-card count-up-on-scroll | EP-07-S1 |
| Magnific Popup | News-article image lightbox galleries (`5-year-anniversary.html`, `new-engineering-office.html`) | EP-20-S2 |
| Isotope | Filterable-grid init calls present in `main.js` | **not cited by any Story** — see preserve-or-retire register |
| Tilt | `.tilt-active` hover-tilt init present in `main.js` | **not cited by any Story** — see preserve-or-retire register |
| Particles | Particle-background init present in `main.js` | **not cited by any Story** — see preserve-or-retire register |

---

## Preserve-or-retire register

Items the analysis flagged as dead code, orphaned assets, content discrepancies, or deliberate scope deferrals — each needs an explicit content-owner or engineering decision during planning, not a silent resolution by whoever happens to touch the code next.

| Item | Location | Recommended disposition | Story |
|---|---|---|---|
| Disabled hero-slider block (`#heroSlide18`), with its own divergent "Our Story" headline/paragraph | `about.html`, lines 196–239 | Content-owner decision: resurrect (reconcile copy with the live `story-box` narrative) or retire (formally confirm permanently disabled) | EP-12-S1 |
| Disabled alternate team-bio carousel (`#testiSlider2`) with richer bios and a "Raj" vs. "Rajesh" Nadipalli name conflict | `about.html`, lines 548–625 | Content-owner decision: choose canonical bio set (live-grid vs. carousel) and canonical name spelling before seed data is final | EP-13-S2 |
| Dead alternate copy block referencing `case6.html` as AI-Enabled Migrations' case-study link | `service.html`, lines 862–908 | Content-owner decision: add a real case-study link (reviving/replacing the `case6` reference) or intentionally ship unlinked | EP-14-S4 |
| Generic, duplicated SEO metadata ("TrieDatum - Your Trusted Partner in AI & Data") | `index.html`, `about.html`, `service.html`, most `case-study/*.html`, half of `news/*.html` | Implement — author a real, unique `metaTitle`/description for every affected page during migration | EP-24-S1 |
| `case8` orphan (excluded from nav dropdown + homepage carousel on the legacy site; target currently renders all 10) | `case-study/case8.html`; `index.html` carousel + nav dropdown (absent) | Content-owner decision: (a) restore legacy 9-of-10 parity, or (b) intentionally promote case8 to full parity | EP-21-S4 |
| Orphaned partner-logo asset with no corresponding rendered card | `assets/img/partners/Cognition.png` | Content-owner decision: add a 4th `partner` entry, or delete the unused asset | EP-17-S1 |
| 5th "hybrid" news-listing card linking to `partnership.html` (not a real news article) | `triedatum-news.html` | Retire as a news entry; preserve as a promotional link on `partnership.html` or elsewhere | EP-20-S1 |
| Dead commented-out essay paragraph (belongs to `testimonial1`'s subject matter, not `testimonial2`'s) | `testimonial/testimonial2.html` | Retire (dead legacy content; not seeded) | EP-22-S1 |
| CI/CD pipeline designed but not yet wired into an active workflow directory | `infra/github/deploy.yml` (target-side; no legacy equivalent) | Documented gap — activation is a file-copy + secrets-config step, no redesign required; must never be reported as "already automated" | EP-27-S5 |
| Cloudflare Turnstile bot protection deferred; honeypot is the only active control at launch | Target `.env.example` / project status notes (no legacy equivalent — legacy control was a non-functional fake checkbox) | Documented P4 deferral; environment variables provisioned, integration not yet implemented | EP-18-S5 |
| `bootcamp-program` Strapi collection type deliberately not built for v1 (5 program cards remain static page content) | `bootcamp.html`, `.programs-section#programs` (target-side scope decision) | Documented P4 deferral; revisit if a second consumer of program data emerges elsewhere on the site | EP-15-S4 |
| Isotope / Tilt / Particles library init calls present in the shared bundle with no Story in this requirements set citing a live, functioning instance | `assets/js/main.js` | Open item — engineering to verify whether any migrated page genuinely depends on these before porting; retire from the target bundle if unused, or raise a new story if a live use is confirmed | *(unassigned — flagged for triage)* |
