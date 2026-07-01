# STD-03 — Dangling MobileMenu.tsx reference — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. `apps/web/components/layout/SiteHeader.tsx` was not modified and
`MobileMenu.tsx` was not created — both are `apps/web` changes outside this run's scope.

## Recommended fix (ready to apply)
Two options are given in
[`../run-20260701-100000/STD-03-dangling-mobilemenu-reference.md`](../run-20260701-100000/STD-03-dangling-mobilemenu-reference.md)
§5: build `MobileMenu.tsx` importing the exported `CASE_STUDY_LINKS`, or correct the comment and file
a tracked follow-up against EP-01-S3 if mobile nav is intentionally deferred further.

## Next step
Front-End Engineer decides which of the two options applies given current sprint priority for
EP-01-S3, then either builds the component or edits the comment — this is a product/sequencing call
this scan cannot make on its own.

## Verification (not yet performed)
Not run — depends on which option is chosen.
