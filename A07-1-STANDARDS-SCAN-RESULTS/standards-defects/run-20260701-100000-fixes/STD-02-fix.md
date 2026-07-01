# STD-02 — Missing workspace root manifest — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. No root `package.json` was created — creating one is a repo-root change
outside this run's scope (`A07-1-STANDARDS-SCAN-RESULTS/` only).

## Recommended fix (ready to apply)
Create a root `package.json` with `"workspaces": ["apps/web", "packages/*"]`, keeping `apps/cms`
un-hoisted per ADR-005. Exact content in
[`../run-20260701-100000/STD-02-missing-workspace-root-manifest.md`](../run-20260701-100000/STD-02-missing-workspace-root-manifest.md)
§5.

## Next step
Deploy Engineer (or whoever scaffolds `packages/shared`/`packages/seed` first) should add this file
as part of that work, since the workspaces array needs to exist before those packages can be
meaningfully installed alongside `apps/web`.

## Verification (not yet performed)
Not run — no root manifest exists yet.
