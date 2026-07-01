# SEC-01 — No rate-limiting on `/api/contact` or `/api/revalidate` — DOCUMENTED ONLY

**Severity:** High · **Status:** Documented only — not applied to code

## Why not applied

This fix pass is scoped to `A08-1-SECURITY-SCAN-RESULTS/` only; `apps/web/app/api/contact/route.ts`
and `apps/web/app/api/revalidate/route.ts` were read for the scan but not modified.

## Fix to apply (follow-on task)

1. Introduce a small rate-limit helper (e.g. `packages/shared/rateLimit.ts` or edge middleware) that
   both routes call first, keyed by client IP (or `CF-Connecting-IP` once behind Cloudflare):
   ```ts
   const limited = await isRateLimited(request, { key: "contact", max: 5, windowSec: 3600 });
   if (limited) return NextResponse.json({ ok: true }, { status: 429 });
   ```
2. For `/api/contact`, cap at a low per-IP submission rate (e.g. 5/hour) — legitimate visitors never
   need more.
3. For `/api/revalidate`, add a stricter cap on *failed*-secret attempts specifically (distinct from
   successful, expected webhook calls from `apps/cms`), so a brute-force pattern is throttled and
   logged distinctly from normal traffic.
4. Alternative/complementary: configure Cloudflare rate-limiting rules at the edge for both paths,
   since the target architecture already sits behind Cloudflare.

## Verification (once applied)

- [ ] A scripted flood of `POST /api/contact` from one IP is throttled after the configured cap.
- [ ] A scripted flood of `POST /api/revalidate` with an incorrect secret is throttled/locked out
      after N failed attempts, independent of the Strapi lifecycle hook's normal traffic.
- [ ] Legitimate single-submission and single-webhook-call flows are unaffected.
