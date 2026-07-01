# SEC-03 — Strapi permission matrix has no automated regression test — DOCUMENTED ONLY

**Severity:** High · **Status:** Documented only — not applied to code

## Why not applied

A regression test for this needs a running Strapi instance with the `Public` role actually
configured to test against — `apps/cms` at scan time has only 2 of 8 content-type schemas committed
and no test harness for permissions exists yet. This fix pass is also scoped to
`A08-1-SECURITY-SCAN-RESULTS/` only, so no test file was added under `apps/cms`.

## Fix to apply (follow-on task)

1. Add an integration test (Jest, matching `apps/cms/package.json`'s existing `jest`/`ts-jest`
   devDependencies) that boots a test Strapi instance (or hits a seeded dev instance) and, as an
   unauthenticated client, asserts for each of the 7 read-oriented content types: `GET`/`findOne`
   succeeds, `POST`/`PUT`/`DELETE` all return 403; and for `contact-submission`: `POST` succeeds,
   `GET`/`PUT`/`DELETE` all return 403.
2. Wire this test into the CI verify job once activated (SEC-07), and/or as a `deploy.sh`
   post-deploy smoke check (EP-27-S4).

## Verification (once applied)

- [ ] Test fails if any read-oriented type's Public permissions are widened to include
      create/update/delete.
- [ ] Test fails if `contact-submission` is ever granted `find`/`findOne` for Public.
- [ ] Test passes against the currently-specified, correct EP-23-S2/S3 matrix.
