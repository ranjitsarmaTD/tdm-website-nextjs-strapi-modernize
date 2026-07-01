# ADR-003 — On-demand revalidation webhook with timed ISR fallback

**Status:** Accepted

---

## Context

ADR-001 commits `apps/web` to SSG+ISR, which means every route needs an explicit answer to "how does a Content Editor's change become visible?" EP-26 requires freshness that is "near-immediate on publish, without becoming a correctness dependency" (overview §4). Two failure scenarios must both be handled: (1) the common case, where the front end is up and a fast update is desirable; and (2) the case where `apps/web` is unreachable at the moment of publish (local dev not running, production mid-deploy, a dropped request) — in which case the architecture must not leave the page stale indefinitely.

## Decision

Two independent, layered mechanisms deliver freshness (`04-content-editing-pipeline-and-data-exchange.md`):

1. **On-demand path (fast, best-effort):** A Strapi lifecycle hook (`db.lifecycles.subscribe`, registered in `apps/cms/src/index.ts` for every editorial content type except `contact-submission`) fires on every `afterCreate`/`afterUpdate`/`afterDelete` and POSTs to `apps/web`'s secret-header-gated `POST /api/revalidate` (`API-REVALIDATE`), which maps the content-type + slug to the affected Next.js path(s) and calls `revalidatePath()`. This call is explicitly best-effort — it never blocks or fails the underlying Strapi write, and its own failure (unreachable front end, timeout) is logged, not surfaced to the Content Editor.
2. **Timed fallback (slow, unconditional):** Every content-backed route also declares `revalidate: 3600` — a one-hour timed ISR window that fires regardless of whether the webhook ever succeeded. This is the mechanism the design's *correctness* depends on; the webhook exists purely to make the common case fast (architecture principle P4, overview §2).

The two mechanisms are explicitly designed not to conflict: a page just revalidated on-demand keeps serving that fresh content until its own timed window independently elapses — no redundant regeneration is forced.

## Consequences

- **Positive:** Editorial changes are visible in seconds in the common case, a substantial UX improvement over the legacy "re-upload static files" model and over an ISR-only design with no on-demand path (which would cap freshness at the timed window even when the front end is perfectly healthy).
- **Positive:** The site never permanently depends on the webhook succeeding — a local dev environment where `apps/web` wasn't running at edit time, or a production blip that drops the POST, both self-heal within the hour with zero manual intervention (EP-26-S3).
- **Negative:** No retry/backoff queue exists for a failed webhook delivery — the timed window is the only fallback, by explicit design choice (EP-26-S2's stated out-of-scope), not an oversight; if a business need for guaranteed near-real-time freshness emerges, this would need revisiting.
- **Negative:** A Content Editor gets no in-admin signal that the webhook actually succeeded versus silently failed — only that Strapi saved (overview §10, R3; doc 04 §7, P1) — an accepted observability gap for v1.
- **Neutral:** The secret-header gate on `API-REVALIDATE` (`STRAPI_REVALIDATE_SECRET`) means the endpoint cannot be triggered by anyone who doesn't hold the shared secret, but it is still a fixed, closed mapping of known content types to paths — not a general-purpose "revalidate anything" surface (doc 04 §4).

## Alternatives considered

| Alternative | Why not chosen |
|---|---|
| Timed ISR only, no webhook | Simpler, but caps freshness at up to an hour even when the front end is healthy and the webhook would have succeeded instantly — a worse editorial experience than necessary for a low-effort trade. |
| Webhook only, no timed fallback | Rejected specifically because it makes correctness depend on the webhook always succeeding — any missed delivery (front end down, dropped request) would leave a page stale indefinitely with no self-healing mechanism. This is the exact failure mode ADR-003 exists to prevent. |
| A retry queue for failed webhook deliveries (e.g. a job queue with backoff) | Adds real infrastructure (a queue, a worker) for a problem the timed fallback already solves within an acceptable bound (≤1 hour) for a marketing site's traffic profile — not justified by any stated requirement; explicitly out of scope per EP-26-S2. |
| Full cache purge (regenerate every page) on every content change instead of a scoped `contentType` + `slug` → path mapping | Wasteful — most edits affect one detail page plus at most one or two index/carousel pages (doc 04 §4); a full-site purge on every edit would multiply regeneration cost for no freshness benefit. |
| Client-side polling from the browser for content updates | Would require every page to carry a live polling loop, reintroducing a client-side "keep fetching until fresh" pattern the legacy `load-footer.js` model already showed weaknesses in, and doesn't fit the SSG delivery model at all. |
