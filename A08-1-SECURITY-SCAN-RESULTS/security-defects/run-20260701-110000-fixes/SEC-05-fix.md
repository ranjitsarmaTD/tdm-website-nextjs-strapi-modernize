# SEC-05 — Revalidation secret handling hygiene — DOCUMENTED ONLY

**Severity:** Medium · **Status:** Documented only — not applied to code

## Why not applied

This fix pass is scoped to `A08-1-SECURITY-SCAN-RESULTS/` only. `apps/web/app/api/revalidate/route.ts`
and `apps/cms/src/index.ts` were read for the scan but not modified — despite this being a small,
mechanical change, editing files under `apps/` was explicitly out of scope for this task.

## Fix to apply (follow-on task)

1. In `apps/web/app/api/revalidate/route.ts:34`, replace the `!==` string comparison with a
   constant-time comparison:
   ```ts
   import { timingSafeEqual } from "crypto";

   function safeEqual(a: string, b: string): boolean {
     const bufA = Buffer.from(a);
     const bufB = Buffer.from(b);
     if (bufA.length !== bufB.length) return false;
     return timingSafeEqual(bufA, bufB);
   }
   // ...
   if (!secret || !safeEqual(secret, process.env.STRAPI_REVALIDATE_SECRET ?? "")) {
     return NextResponse.json({ error: "unauthorized" }, { status: 401 });
   }
   ```
2. In both `apps/web/app/api/revalidate/route.ts` and `apps/cms/src/index.ts`, add a loud
   `console.error`/monitoring alert (not just a silent `return`) when
   `STRAPI_REVALIDATE_SECRET` is unset specifically under `NODE_ENV=production`.
3. Document a rotation procedure in `docs/modules/` or the deploy runbook (update both env vars,
   redeploy both apps).

## Verification (once applied)

- [ ] Secret comparison uses `timingSafeEqual` (or equivalent), not `!==`.
- [ ] A production boot with `STRAPI_REVALIDATE_SECRET` unset produces a visible error/log entry,
      not a silent no-op.
