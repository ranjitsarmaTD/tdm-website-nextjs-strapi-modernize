# STD-01 — Missing tsconfig.json — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. `apps/web/tsconfig.json` and `apps/cms/tsconfig.json` were **not**
created — this scan run was scoped to `A07-1-STANDARDS-SCAN-RESULTS/` only and explicitly instructed
not to touch `apps/`.

## Recommended fix (ready to apply)
Create `apps/web/tsconfig.json` and `apps/cms/tsconfig.json` with the exact content given in
[`../run-20260701-100000/STD-01-missing-tsconfig-strict-mode.md`](../run-20260701-100000/STD-01-missing-tsconfig-strict-mode.md)
§5.

## Next step
A Front-End Engineer / CMS Engineer (or a Bug-Fixing agent explicitly scoped to `apps/`) should create
both files, then run `npm run typecheck -w apps/web` to confirm it executes against real strict-mode
checking rather than failing on a missing config.

## Verification (not yet performed)
Not run — no `tsconfig.json` exists yet to verify against.
