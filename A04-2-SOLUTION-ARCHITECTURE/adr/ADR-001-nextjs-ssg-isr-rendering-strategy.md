# ADR-001 — Next.js 14 App Router, SSG + ISR as the default rendering strategy

**Status:** Accepted

---

## Context

`TDWebsite2` replaces 23 static Themeholy HTML pages with content that will be centrally managed in Strapi (EP-23) and edited by non-technical Content Editors. The front end (`apps/web`) needs a rendering strategy that:

- Serves every route fast, at marketing-site traffic volumes with no user accounts and no high-concurrency writes (overview §7).
- Never makes the public site's uptime or latency depend on Strapi being reachable at request time — Strapi runs on the same single VPS as the front end (ADR-006), so a per-request dependency on it would couple two processes' availability unnecessarily.
- Reflects editorial changes without requiring a full redeploy for every content edit (unlike the legacy static-file model, where "publishing" meant re-uploading HTML).
- Preserves per-page SEO metadata quality (EP-24) with content resolved at generation time, not client-side.

## Decision

Every content-backed route in `apps/web` (Next.js 14, App Router) is rendered as **Static Site Generation (SSG) with Incremental Static Regeneration (ISR)**. Server Components fetch content via `packages/shared` at build time (`generateStaticParams`) and at revalidation. No route is server-rendered per-request by default (architecture principle P1, overview §2). The only genuinely dynamic server code is the two API routes, `API-CONTACT` and `API-REVALIDATE`, which are request-time by necessity (a form submission and a webhook receiver, not a page render). Freshness after publish is delivered by two independent mechanisms layered on top of this base (see ADR-003): an on-demand revalidation webhook for speed, and a timed `revalidate: 3600` window that the design's correctness never depends on.

## Consequences

- **Positive:** Strapi becomes a build-/revalidation-time dependency of `apps/web`, never a per-request one — a Strapi outage does not take down already-generated pages (architecture principle P1). Sub-100ms TTFB is achievable for cache hits served from Cloudflare's edge (overview §7).
- **Positive:** SSG output is straightforward to reason about for the SEO Engineer persona verifying zero ranking/traffic loss (EP-24) — metadata is resolved and baked into HTML at generation time, not hydrated client-side.
- **Negative:** Every content-backed page needs an explicit revalidation story (this is exactly what ADR-003 exists to specify) — SSG+ISR is not "set and forget" the way a fully dynamic SSR page would be for freshness, though it is far cheaper to serve.
- **Negative:** `generateStaticParams` must enumerate all known slugs at build time for detail routes (`PAGE-NEWS-DETAIL`, `PAGE-CASE-STUDY-DETAIL`, `PAGE-TESTIMONIAL-DETAIL`); a newly created entry is not visible until the next build or the first on-demand/timed regeneration touches that path — an inherent SSG characteristic, mitigated but not eliminated by ISR.
- **Neutral:** `PAGE-BOOTCAMP` and other structurally hard-coded page shells (architecture principle P3) still benefit from SSG even though their non-repeating copy isn't CMS-driven — the rendering strategy is orthogonal to how much of a given page is CMS-backed.

## Alternatives considered

| Alternative | Why not chosen |
|---|---|
| Full Server-Side Rendering (SSR) per request | Couples every page render to Strapi's live availability and adds unnecessary per-request latency for content that changes infrequently — the marketing site's traffic profile doesn't justify the operational cost. |
| Client-Side Rendering (CSR) with a SPA fetching from Strapi in the browser | Regresses SEO (crawlers historically favor server-rendered HTML; Next's own metadata APIs require server-side resolution) and reintroduces a client-side fetch-and-inject pattern the legacy `load-footer.js` approach already demonstrated as a weak spot worth retiring (EP-02). |
| Static export with no revalidation (build-time only, redeploy to update) | Matches the legacy "reupload the files" model too closely — would force a full rebuild+redeploy for every editorial change, defeating the point of introducing a CMS at all (EP-23's whole premise). |
| On-demand-only revalidation with no timed fallback | Rejected specifically because it would make correctness depend on the webhook always succeeding — see ADR-003 for the full reasoning; this ADR's SSG+ISR choice is only safe *because* ADR-003 pairs it with an unconditional timed fallback. |
