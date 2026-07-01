<!-- Last updated: 2026-07-01 -->

# 11 — Traceability & Coverage

**Audience:** QA · Product · Auditor
**Source:** [`A01-2-REQUIREMENTS/`](../A01-2-REQUIREMENTS/) (9 sections, 27 Epics)

Every requirement section and Epic, mapped to where it's documented in this solution
documentation set. Use this to answer "where do I read about EP-XX?" or, in the other direction,
"does this documentation actually cover every Epic?" — the answer, per the table below, is yes,
with the specific open items called out rather than glossed over.

## Contents

1. [Section → documentation map](#1-section--documentation-map)
2. [Epic → documentation map](#2-epic--documentation-map)
3. [Coverage gaps and their disposition](#3-coverage-gaps-and-their-disposition)
4. [Open items carried forward](#open-items-carried-forward)

---

## 1. Section → documentation map

| # | Requirements section | Epics | Primary A10 coverage |
|---|---|---|---|
| A | [Global Shell, Navigation & Footer](../A01-2-REQUIREMENTS/01-global-shell-navigation-and-footer.md) | EP-01, EP-02, EP-03 | [01 §4](01-architecture-overview.md#4-components-by-layer) (`SEC-HEADER`/`SEC-FOOTER`/`SEC-MOBILEMENU`), [02 §3](02-content-model-dictionary.md#3-single-types) (`CMS-GLOBAL`) |
| B | [Homepage](../A01-2-REQUIREMENTS/02-homepage.md) | EP-04 – EP-11 | [01 §4](01-architecture-overview.md#4-components-by-layer) (`PAGE-HOME` and its section components), [02 §2](02-content-model-dictionary.md#2-collection-types) |
| C | [About & Team](../A01-2-REQUIREMENTS/03-about-and-team.md) | EP-12, EP-13 | [01 §4](01-architecture-overview.md#4-components-by-layer) (`PAGE-ABOUT`), [02 §2](02-content-model-dictionary.md#cms-team-member--team-member) (`CMS-TEAM-MEMBER`) |
| D | [Services](../A01-2-REQUIREMENTS/04-services.md) | EP-14 | [01 §4](01-architecture-overview.md#4-components-by-layer) (`PAGE-SERVICES`), [02 §2](02-content-model-dictionary.md#cms-service--service) (`CMS-SERVICE`) |
| E | [AI Bootcamp](../A01-2-REQUIREMENTS/05-ai-bootcamp.md) | EP-15, EP-16 | [01 §4](01-architecture-overview.md#4-components-by-layer) (`PAGE-BOOTCAMP`), [02 §3](02-content-model-dictionary.md#3-single-types) (`CMS-BOOTCAMP-PAGE`) — see [§3](#3-coverage-gaps-and-their-disposition) |
| F | [Partnership](../A01-2-REQUIREMENTS/06-partnership.md) | EP-17 | [01 §4](01-architecture-overview.md#4-components-by-layer) (`PAGE-PARTNERSHIP`), [02 §2](02-content-model-dictionary.md#cms-partner--partner) (`CMS-PARTNER`) |
| G | [Contact & Lead Capture](../A01-2-REQUIREMENTS/07-contact-and-lead-capture.md) | EP-18, EP-19 | [03 §1](03-web-api-reference.md#1-post-apicontact) (`API-CONTACT`), [02 §2](02-content-model-dictionary.md#cms-contact-submission--contact-submission) (`CMS-CONTACT-SUBMISSION`), [10 §3](10-security-compliance.md#pii-in-contact-submissions) |
| H | [News, Case Studies & Testimonials](../A01-2-REQUIREMENTS/08-news-case-studies-and-testimonials.md) | EP-20, EP-21, EP-22 | [01 §4](01-architecture-overview.md#4-components-by-layer), [02 §2](02-content-model-dictionary.md#2-collection-types) — see [§3](#3-coverage-gaps-and-their-disposition) for `EP-21-S4` |
| I | [CMS Platform, SEO & Hosting](../A01-2-REQUIREMENTS/09-cms-seo-and-platform.md) | EP-23 – EP-27 | [04](04-cms-reference.md), [06](06-runbook-deployment.md), [07](07-runbook-incident-recovery.md), [09](09-release-playbook.md), [10](10-security-compliance.md) |

---

## 2. Epic → documentation map

| Epic | Title | Primary A10 doc(s) |
|---|---|---|
| EP-01 | Global Site Header & Navigation | [01 §4](01-architecture-overview.md#4-components-by-layer) |
| EP-02 | Global Footer & Site Settings | [01 §4](01-architecture-overview.md#4-components-by-layer), [02 §3](02-content-model-dictionary.md#3-single-types) |
| EP-03 | Shared Page Chrome (Preloader, Scroll-to-Top, Analytics) | [01 §4](01-architecture-overview.md#4-components-by-layer) |
| EP-04 | Homepage Hero Slider | [02 §4](02-content-model-dictionary.md#4-shared-components) (`sections.hero-slide`) |
| EP-05 | Homepage About Teaser | [01 §4](01-architecture-overview.md#4-components-by-layer) |
| EP-06 | Homepage Services Carousel (CMS-driven) | [02 §2](02-content-model-dictionary.md#cms-service--service) |
| EP-07 | Homepage Stats Counters | [02 §4](02-content-model-dictionary.md#4-shared-components) (`sections.stat-counter`) |
| EP-08 | Homepage News Marquee & News Grid | [02 §2](02-content-model-dictionary.md#cms-news-article--news-article) |
| EP-09 | Homepage Testimonials Carousel | [02 §2](02-content-model-dictionary.md#cms-testimonial--testimonial) |
| EP-10 | Homepage Partner Logo Strip | [02 §2](02-content-model-dictionary.md#cms-partner--partner) |
| EP-11 | Homepage Case Studies Carousel | [02 §2](02-content-model-dictionary.md#cms-casestudy--case-study) — see `O1` in [§4](#open-items-carried-forward) |
| EP-12 | About "Our Story" | [01 §10](01-architecture-overview.md#10-lift-and-shift-migration-strategy) — see `O3` in [§4](#open-items-carried-forward) |
| EP-13 | Team Member Directory | [02 §2](02-content-model-dictionary.md#cms-team-member--team-member) — see `O3` in [§4](#open-items-carried-forward) |
| EP-14 | Services Detail Page & Service Content Type | [02 §2](02-content-model-dictionary.md#cms-service--service) |
| EP-15 | Bootcamp Landing Page & Program Content | [02 §3](02-content-model-dictionary.md#3-single-types) — see [§3](#3-coverage-gaps-and-their-disposition) |
| EP-16 | Bootcamp Structured Data (JSON-LD) | [01 §7](01-architecture-overview.md#7-technology-stack) (`SVC-SEO`) |
| EP-17 | Partnership Page & Partner Content Type | [02 §2](02-content-model-dictionary.md#cms-partner--partner) |
| EP-18 | Contact Form & Submission Handling | [03 §1](03-web-api-reference.md#1-post-apicontact), [10 §4](10-security-compliance.md#spam-and-abuse-controls) |
| EP-19 | Contact Page Chrome | [01 §4](01-architecture-overview.md#4-components-by-layer) (`PAGE-CONTACT`) |
| EP-20 | News Article Collection & Detail Route | [02 §2](02-content-model-dictionary.md#cms-news-article--news-article) |
| EP-21 | Case Study Collection & Detail Route | [02 §2](02-content-model-dictionary.md#cms-casestudy--case-study) — see `O1` in [§4](#open-items-carried-forward) |
| EP-22 | Testimonial Collection & Detail Route | [02 §2](02-content-model-dictionary.md#cms-testimonial--testimonial) |
| EP-23 | Strapi Content Modeling & Permissions | [04 §§1–2](04-cms-reference.md#1-content-type-builder-conventions), [10 §1](10-security-compliance.md#1-public-role-permission-hardening) |
| EP-24 | SEO, Metadata, Sitemap & 301 Redirects | [09 §1–3](09-release-playbook.md#1-pre-cutover-gate) |
| EP-25 | Analytics & Structured Data | [09 §3](09-release-playbook.md#3-post-cutover-verification) (GA4 continuity check) |
| EP-26 | On-Demand ISR / Revalidation Webhook | [04 §3](04-cms-reference.md#3-lifecycle-hooks), [03 §2](03-web-api-reference.md#2-post-apirevalidate), [08 KB-3/KB-4](08-troubleshooting-kb.md#kb-3) |
| EP-27 | Hosting, Deployment & CI/CD (Hostinger VPS) | [06](06-runbook-deployment.md), [07](07-runbook-incident-recovery.md), [08 KB-1/KB-2](08-troubleshooting-kb.md#kb-1) |

---

## 3. Coverage gaps and their disposition

Two Epics are documented as **specified but not fully realized in the running system** — this is
an honest status, not a documentation omission, and each is flagged at its point of use rather
than only here:

| Epic | Gap | Where flagged |
|---|---|---|
| EP-15 (Bootcamp) | `/bootcamp` currently ships as one static, CMS-independent page; the `CMS-BOOTCAMP-PAGE` single type exists in the schema but the live route doesn't yet consume it (`EP-15-S4`, deferred) | [02 §3](02-content-model-dictionary.md#3-single-types), [01 §10](01-architecture-overview.md#10-lift-and-shift-migration-strategy) |
| EP-21 (Case Studies) | The `case-study.featured` field exists to resolve the `case8` homepage-carousel discrepancy (legacy showed 9 of 10; the CMS-driven carousel shows all 10) but isn't yet consumed by the front end (`EP-21-S4`) | [02 §2](02-content-model-dictionary.md#cms-casestudy--case-study), `O1` below |

`EP-27-S5` (the CI/CD pipeline) is a **deliberate, in-scope deferral**, not a gap — the pipeline is
fully designed and documented as "not yet activated," per its own acceptance criteria in the
requirements. See [06 §7](06-runbook-deployment.md#7-the-ci-pipeline-designed-not-yet-active).

---

## Open items carried forward

These carry the same identifiers used in [README §Open items](README.md#open-items-carried-from-requirementsarchitecture-status-unresolved)
— repeated here so a reader entering through the traceability doc doesn't need to cross-reference
the README to find them:

| # | Item | Epic | Owner |
|---|---|---|---|
| O1 | `case8` has no homepage-carousel card on the legacy site (legacy showed 9 of 10); the CMS-driven carousel currently shows all 10 — needs a `featured`-flag decision | EP-21-S4 | Content Editor + Front-End Engineer |
| O2 | Generic, duplicated SEO metadata on several legacy pages — a real content gap being fixed during migration | EP-24-S1 | SEO Engineer |
| O3 | `about.html`'s disabled hero-slider block and disabled alternate team-bio carousel (with a name discrepancy) need a content-owner disposition | EP-12-S1, EP-13-S2 | Content Editor |
| O4 | Acceptance of the CI/CD pipeline's "designed, not activated" state until a follow-on session enables it | EP-27-S5 | Deploy Engineer |
| O5 | Real CAPTCHA (Cloudflare Turnstile) vs. honeypot-only spam control on the contact form | EP-18-S5 | Site Administrator |

None of these are documentation gaps in this A10 set — every one is surfaced at its point of use
(linked above) precisely so it can't be mistaken for a settled decision.
