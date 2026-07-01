# TS-010 — Cross-Cutting Strategy: Performance & Accessibility (NFR)

> **Inherits:** [TS-000 Master Strategy](TS-000-master-test-strategy.md) §4 ("Performance / accessibility tests"), §7 (CI gates), §8 (tooling: Lighthouse CI, axe-core).
> **Requirements source:** no single requirements section owns performance/accessibility as a numbered Epic — these are non-functional requirements (NFR) that apply across every route Sections A–H build. Scattered explicit accessibility ACs do exist per story (e.g. `02-homepage.md` hero-fade "shortened/disabled per accessibility best practice," `ServiceExpandButton`'s `aria-expanded`, the partnership logo links' accessible names, the contact form's honeypot+labels) and are cross-referenced below rather than re-authored.
> **Framing:** `TDWebsite2` does not yet exist as a running system to measure — there is no Lighthouse baseline, no axe-core run, and no production traffic to sample Core Web Vitals from today. This plan specifies the **budgets and checks to enforce as each route is built**, not a report on measured performance. Legacy `TDWebsite` (static HTML, no build step, no JS framework) is a *reference point for what "no regression" means* on load-time-sensitive metrics, not a system this plan re-tests.
> **Risk tier:** performance/accessibility gates apply to every route; per TS-000 §5, the routes with the largest blast radius if they fail (global shell, homepage) inherit Tier 1 review depth, page-specific routes (about, services, bootcamp, partnership, news/case-studies/testimonials) inherit Tier 2/3 per that same table.

---

## 1. Why this is a cross-cutting plan, not a per-section one

Every route renders through the same root layout (`SiteHeader`/`MobileMenu`/`SiteFooter`, GA4 script, preloader) and is built on the same Next.js SSG+ISR pipeline — a performance or accessibility regression in a shared primitive (an unoptimized hero image, a focus trap in the mobile menu, a missing `aria-expanded`) reproduces on every page that uses it. This plan therefore defines **one set of budgets and checks**, applied per-route in CI, rather than restating them in each of TS-001…TS-009.

## 2. Performance budgets (Core Web Vitals + Lighthouse)

Budgets are tiered by page weight/interactivity, since a text-and-card page (`/about`) and an image/animation-heavy page (`/` homepage carousels, `/bootcamp`'s micro-site) carry genuinely different achievable targets — a single site-wide number would either be too lax for the homepage or unachievably strict for it.

| Metric | Tier A — light pages (`/about`, `/services`, `/partnership`, `/testimonials/[slug]`, `/case-studies/[slug]`) | Tier B — hero/carousel-heavy pages (`/`, `/case-studies`, `/news/[slug]` gallery articles) | Tier C — structural outlier (`/bootcamp`, own inline CSS design system) |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.0s | ≤ 2.5s | ≤ 2.5s |
| **INP** (Interaction to Next Paint) | ≤ 150ms | ≤ 200ms | ≤ 200ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.05 | ≤ 0.1 | ≤ 0.1 |
| **TBT** (Total Blocking Time, lab proxy for INP) | ≤ 150ms | ≤ 250ms | ≤ 300ms |
| **Lighthouse Performance score** (mobile, throttled) | ≥ 90 | ≥ 80 | ≥ 75 |
| **Lighthouse Accessibility score** | ≥ 95 | ≥ 95 | ≥ 95 |
| **Lighthouse SEO score** | 100 (cross-ref TS-009/TS-012) | 100 | 100 |

- **No-regression-from-legacy rule.** Because the legacy site ships zero JS framework overhead, the target's Tier A/B budgets are set to be *at least as fast* as a reasonable static-HTML baseline would be, adjusted for the unavoidable overhead of hydration and the CMS round-trip at build time (mitigated by SSG — the visitor never waits on a live Strapi call). Any route landing outside its tier's budget is a defect to fix before launch, not an accepted cost of migrating off static HTML.
- **Image-heavy surfaces get explicit LCP scrutiny:** the hero slider (EP-04), case-study/news hero images (EP-20/EP-21), and the partner-logo strip (EP-10) are the most likely LCP-element candidates — each must use `next/image` with correct `priority`/`sizes` rather than an unoptimized `<img>`, mirroring the legacy site's already-present lazy-load intent but through Next.js's own mechanism.
- **Animation-heavy surfaces get explicit CLS/TBT scrutiny:** GSAP hero entrance animation (EP-04-S3), CounterUp stat cards (EP-07), and the bootcamp micro-site's heavier inline-CSS layout (EP-15) are the most likely sources of layout shift or main-thread blocking if not deferred/isolated correctly as `"use client"` components.

## 3. Accessibility checks (WCAG 2.1 AA)

| Check | What it verifies | Applies to |
|---|---|---|
| **axe-core automated scan** | Zero critical/serious violations (color contrast, missing alt text, invalid ARIA, form-label association) | every route, run in CI per TS-000 §7 |
| **Keyboard navigation** | Every interactive element (nav links, mobile-menu toggle, Case Studies dropdown, service-expand buttons, contact form fields, lightbox next/prev) is reachable and operable via Tab/Enter/Escape alone, with a visible focus indicator | global shell (EP-01), homepage service toggle (EP-06), contact form (EP-18), news lightbox (EP-20-S2) |
| **`aria-expanded`/labelled interactive widgets** | The mobile off-canvas menu, the Case Studies dropdown, and `ServiceExpandButton` (`02-homepage.md`'s own explicit AC) expose correct `aria-expanded` state and accessible names — not just a visual open/closed class | EP-01-S2/S3, EP-06 |
| **Accessible names on icon-only/image links** | The partnership logo links (`02-homepage.md`'s own explicit AC: e.g. "Databricks — view partnership details" rather than an unlabeled image link) and any social/footer icon link carry a real accessible name, not an empty `<a>` wrapping only an image | EP-10, EP-02-S3, EP-17 |
| **Reduced-motion respect** | The hero fade/slide transition (`02-homepage.md`'s own explicit AC: duration shortened or disabled per accessibility best practice under `prefers-reduced-motion`) applies the same treatment to GSAP entrance animation, CounterUp, and the news-article lightbox transition, not just the hero | EP-04-S1/S3, EP-07, EP-20-S2 |
| **Form accessibility** | Every contact-form field has a programmatically associated label, inline errors are announced (not purely color-coded), and the honeypot field is hidden via a technique that is invisible to sighted users *and* correctly ignored by assistive tech (not merely `display:none` misapplied in a way that also hides a legitimate field) | EP-18-S2 (TS-007 §3 already owns the functional honeypot test; this plan owns its a11y-hiding-technique correctness) |
| **No-JS baseline** | Content-bearing markup (nav links, contact-form fields, article text) is present in server-rendered HTML and does not depend on client-side JS to exist in the DOM, even though interactivity (menu toggle, lightbox, validation) does | cross-ref EP-18-S1's own "JavaScript disabled" AC (TS-007 §3) |

## 4. Test matrix by concern

| Concern | Layer | Key scenarios (happy / failure / edge) |
|---|---|---|
| Lighthouse performance budget per tier | PERF | **H:** a Tier A page (`/about`) scores ≥90 mobile Performance with LCP ≤2.0s. **F:** a page landing below its tier's budget fails the CI gate and blocks merge rather than being noted and shipped anyway. **E:** the homepage (Tier B, the single heaviest route — 5 carousels/sliders) is measured with throttled mobile network/CPU profiles, not just an unthrottled desktop run that would mask real-world slowness. |
| Core Web Vitals field-data readiness | PERF | **H:** once live, the site is instrumented (e.g. via `web-vitals` reporting to GA4 or a dedicated endpoint) so field CWV data becomes available post-launch. **F:** lab-only (Lighthouse CI) scores are never presented as a substitute for field data in a launch report — the DoD requires both to be tracked, with field data explicitly labeled "pending post-launch collection" pre-launch. **E:** a page whose lab score passes but whose real-user LCP element differs (e.g. a font-loading shift) is caught by comparing Lighthouse's identified LCP element against the actual rendered element in a manual spot-check. |
| axe-core critical/serious violations | A11Y | **H:** an automated scan of every route returns zero critical/serious violations. **F:** a violation found on a shared component (e.g. insufficient contrast on the sticky header's active-link state) is filed once against the component, not once per route that renders it, to avoid the same defect being "fixed" inconsistently across pages. **E:** a violation that only appears in one content state (e.g. a testimonial rendered with a missing `authorRole` producing an empty, mislabeled region) is caught by scanning with boundary-fixture content, not only the happy-path seed data. |
| Keyboard-only operability | A11Y | **H:** a full keyboard-only pass (no mouse) can open the mobile menu, expand the Case Studies dropdown, submit the contact form, and navigate a news-article lightbox. **F:** any interactive element reachable by mouse but not by keyboard (a "keyboard trap" or an unreachable control) is a blocking defect, not a nice-to-have fix. **E:** the lightbox's Escape-to-close and next/previous keyboard shortcuts are verified explicitly, since Magnific Popup's legacy behavior included them and the re-implementation must not silently drop that parity. |
| Reduced-motion compliance | A11Y | **H:** with `prefers-reduced-motion: reduce` set, the hero fade, GSAP entrance animation, CounterUp, and lightbox transition all shorten or disable their animation while preserving final content/order. **F:** a component that ignores the media query and still animates at full duration is flagged as a defect against that component's story, not accepted as "only the hero needed to respect this." **E:** the reduced-motion path is asserted to produce the *same final DOM/content state* as the full-motion path — accessibility must never mean less content, only less motion. |

## 5. Tooling & CI gates

Per TS-000 §7/§8 — restated here with this plan's specific thresholds, since no test runner or CI pipeline is active yet:

| Gate | Threshold | Stage |
|---|---|---|
| Lighthouse CI (mobile, throttled) | Per-tier budgets in §2 above | CI, pre-staging gate on touched routes |
| axe-core (`@axe-core/playwright`) | Zero critical/serious violations | CI, every route |
| Manual keyboard-only pass | All interactive widgets operable, visible focus indicator | pre-merge for any new interactive component |
| `prefers-reduced-motion` spot-check | Every animated component respects the media query | pre-merge for any new animated component |

## 6. Traceability stub (rolls up to TS-COVERAGE)

| Concern | Cross-referenced stories |
|---|---|
| Performance budgets, all tiers | site-wide (all EP-01–EP-22 routes); LCP-sensitive: EP-04, EP-10, EP-20, EP-21 |
| axe-core scan | site-wide |
| Keyboard navigation + `aria-expanded` | EP-01-S2/S3, EP-06-S2, EP-18-S2, EP-20-S2 |
| Accessible names on icon/image links | EP-02-S3, EP-10, EP-17 |
| Reduced-motion compliance | EP-04-S1/S3, EP-07, EP-20-S2 |
| Form accessibility (honeypot hiding technique) | EP-18-S2 (functional honeypot test owned by TS-007) |
| No-JS content baseline | EP-18-S1 (TS-007) |
