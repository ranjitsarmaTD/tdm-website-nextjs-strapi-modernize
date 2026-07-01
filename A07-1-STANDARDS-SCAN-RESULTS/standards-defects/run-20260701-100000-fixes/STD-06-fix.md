# STD-06 — Missing ESLint config — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. `apps/web/.eslintrc.json` was not created — an `apps/web` change
outside this run's scope.

## Recommended fix (ready to apply)
Commit `apps/web/.eslintrc.json` extending `next/core-web-vitals` (which already includes
`eslint-plugin-jsx-a11y`'s recommended rules), plus an explicit `@typescript-eslint/no-explicit-any:
error` rule matching this project's "no `any`" standard. Exact content in
[`../run-20260701-100000/STD-06-missing-eslint-config.md`](../run-20260701-100000/STD-06-missing-eslint-config.md)
§5.

## Next step
Config-only change — safe to apply immediately, independent of every other defect in this run. Doing
it before STD-04 is fixed would let the linter itself surface the STD-04 pattern.

## Verification (not yet performed)
Not run. Once applied: `npm run lint -w apps/web` should run non-interactively and report the existing
STD-04 pattern (or a clean pass if STD-04 already landed first).
