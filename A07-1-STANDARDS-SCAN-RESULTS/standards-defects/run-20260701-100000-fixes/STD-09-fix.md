# STD-09 — Missing .env.example — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. `apps/web/.env.example` and `apps/cms/.env.example` were not created —
both are `apps/` changes outside this run's scope.

## Recommended fix (ready to apply)
Full contents for both files given in
[`../run-20260701-100000/STD-09-missing-env-example.md`](../run-20260701-100000/STD-09-missing-env-example.md)
§5, covering every env var actually referenced in the five source files scanned
(`STRAPI_URL`, `RESEND_API_KEY`, `STRAPI_REVALIDATE_SECRET`, `NEXT_WEB_URL`) plus the DB/`APP_KEYS`
vars `A04-2-SOLUTION-ARCHITECTURE/00` §6 names for `apps/cms`.

## Next step
Deploy Engineer should treat this as a prerequisite for the first real deploy attempt — see the
related risk R3 in `A04-2-SOLUTION-ARCHITECTURE/00-solution-architecture-overview.md` §10 (silent
webhook failure on a `STRAPI_REVALIDATE_SECRET` mismatch between the two apps).

## Verification (not yet performed)
Not run. Once applied: a fresh clone + `cp .env.example .env` in each package should be enough to
identify every required var without reading source.
