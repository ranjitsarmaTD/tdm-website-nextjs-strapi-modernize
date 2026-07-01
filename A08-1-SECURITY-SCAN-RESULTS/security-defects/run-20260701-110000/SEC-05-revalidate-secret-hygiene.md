---
defect_id: SEC-05
title: "Revalidation secret handling hygiene (non-constant-time compare, no rotation, silent no-op)"
type: security
severity: MEDIUM
status: Open
component: "API-REVALIDATE"
epic_story: "EP-26-S1, EP-26-S2"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "secrets", "webhook", "timing-attack", "config"]
affected_files:
  - "apps/web/app/api/revalidate/route.ts:34"
  - "apps/cms/src/index.ts:47-48"
---

# [SEC-05] Revalidation secret handling hygiene

## Description

`apps/web/app/api/revalidate/route.ts:34` compares the incoming `x-revalidate-secret` header against
`process.env.STRAPI_REVALIDATE_SECRET` with a plain `!==` string comparison:

```ts
if (!secret || secret !== process.env.STRAPI_REVALIDATE_SECRET) {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
```

Three related hygiene gaps, all in this same secret's lifecycle:

1. **Non-constant-time comparison.** `!==` on strings short-circuits on the first differing byte,
   which is a timing side-channel in principle (lower practical severity here since the attacker
   would need to measure network-jitter-dominated timing over many requests, but it's a
   well-known anti-pattern for secret comparison and cheap to fix).
2. **No rotation mechanism.** The secret is a single static value read from the environment with no
   documented rotation procedure or support for a grace-period dual-secret check during rotation.
3. **Silent no-op on missing secret, on both sides.** `apps/cms/src/index.ts:47-48`
   (`if (!secret) return;`) treats an unconfigured `STRAPI_REVALIDATE_SECRET` as "provisioned-but-
   unconfigured is a no-op, not an error" — reasonable for local dev, but there is no distinction in
   logging/monitoring between "intentionally not configured in this environment" and "accidentally
   left unset in production," so a production misconfiguration would silently degrade to
   always-stale-until-timed-ISR (EP-26-S3) with no alert.

## Impact

Individually low-severity, but together they weaken the one endpoint in the system gated by a
shared secret rather than a real identity/session: a leaked or guessed secret is easier to exploit
without rate-limiting (SEC-01) compounding the exposure, rotation has no supported path if a leak is
suspected, and a production misconfiguration fails silently rather than loudly.

## Recommendation

1. Replace the `!==` check with a constant-time comparison (e.g. Node's `crypto.timingSafeEqual` on
   equal-length buffers, with a length check first since `timingSafeEqual` throws on mismatched
   lengths).
2. Document a rotation procedure (even a simple "update the env var on both `apps/web` and
   `apps/cms`, redeploy both, old value stops working immediately" is fine — the point is that one
   exists and is written down, likely alongside the `.env.example` work in SEC-08).
3. Have both `apps/web/app/api/revalidate/route.ts` and `apps/cms/src/index.ts` log a distinct,
   loud warning (not just skip silently) when `STRAPI_REVALIDATE_SECRET` is unset in a
   `NODE_ENV=production` context specifically, so a deploy-time misconfiguration is caught by
   monitoring rather than discovered as "the site never gets fresher than the 1-hour ISR window."
