# STD-08 — Strapi schema missing maxLength — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. `apps/cms/src/api/case-study/content-types/case-study/schema.json` and
the `global` schema were not modified — both are `apps/cms` changes outside this run's scope.

## Recommended fix (ready to apply)
Add explicit `maxLength` values to `title`, `client`, `industry`, `summary` (case-study) and the
`global` schema's equivalent string fields. Suggested starting values in
[`../run-20260701-100000/STD-08-strapi-schema-missing-length-constraints.md`](../run-20260701-100000/STD-08-strapi-schema-missing-length-constraints.md)
§5 — flagged there as starting points to refine against real legacy content lengths once
`packages/seed`'s ETL output is available, not final numbers.

## Next step
CMS Engineer applies once real case-study content lengths are sampled (either from the legacy
`TDWebsite` HTML directly or from `packages/seed`'s output once it exists) — applying arbitrary limits
now risks picking numbers that don't fit real content.

## Verification (not yet performed)
Not run. Once applied: attempt to save a case-study entry exceeding each new limit in the Strapi admin
and confirm it's rejected with a clear validation message.
