---
defect_id: SEC-01
title: "No rate-limiting on POST /api/contact or POST /api/revalidate"
type: security
severity: HIGH
status: Open
component: "API-CONTACT, API-REVALIDATE"
epic_story: "EP-18-S3, EP-26-S1"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "dos", "abuse", "rate-limiting", "api-route"]
affected_files:
  - "apps/web/app/api/contact/route.ts"
  - "apps/web/app/api/revalidate/route.ts"
---

# [SEC-01] No rate-limiting on `POST /api/contact` or `POST /api/revalidate`

## Description

Neither `apps/web/app/api/contact/route.ts` nor `apps/web/app/api/revalidate/route.ts` implements
any request-rate throttling, IP-based limiting, or abuse-detection. Both routes accept an unbounded
number of `POST` requests per second from any single caller:

- `POST /api/contact` re-validates the payload and, on success, performs a Strapi write plus a
  best-effort Resend call (EP-18-S3/S4) — there is no cap on how many times one client can trigger
  this per minute.
- `POST /api/revalidate` is gated only by a static shared secret compared with `!==`
  (`apps/web/app/api/revalidate/route.ts:34`) — there is no lockout, backoff, or rate limit on
  repeated guesses, and a correct-secret caller can trigger unbounded `revalidatePath()` calls.

## Impact

- **`/api/contact`:** a scripted flood can (a) generate large volumes of spam `contact-submission`
  records that Content Editors must manually triage in the Strapi admin panel, (b) drive Resend
  API usage/cost, and (c) mount a resource-exhaustion attack against the Strapi write path itself
  — none of which the honeypot (EP-18-S2) mitigates, since a flood does not need to fill the
  honeypot correctly to be disruptive at volume (it just needs to leave it empty).
- **`/api/revalidate`:** with no throttling, an attacker who obtains or brute-forces
  `STRAPI_REVALIDATE_SECRET` can trigger excessive on-demand regeneration, degrading the ISR caching
  benefit the whole EP-26 design exists to provide. Absence of rate-limiting also removes a natural
  signal (a spike of failed-secret attempts) that would otherwise help detect a leaked/guessed
  secret before it's exploited at scale.

## Recommendation

1. Add IP-based (or, if behind Cloudflare, `CF-Connecting-IP`-based) rate limiting to both routes —
   e.g. a small in-memory or Redis-backed token-bucket middleware, or Cloudflare's own rate-limiting
   rules at the edge (the architecture already sits behind Cloudflare per the overview's target
   architecture diagram, making edge-level limiting a low-effort first line of defense).
2. For `/api/contact` specifically, consider a stricter per-IP cap (e.g. 5 submissions/hour) since
   legitimate visitors submit this form at most a handful of times.
3. For `/api/revalidate`, add a failed-secret attempt counter with a short lockout window, and log
   failed attempts distinctly from the generic 401 so a brute-force pattern is visible in monitoring.
4. Track this alongside EP-18-S5 (Turnstile) — rate-limiting and a real challenge are complementary,
   not substitutes for each other.
