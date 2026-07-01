# Standards Defect Dispositions — Scan Run `run-20260701-100000`

**Fix pass initiated:** 2026-07-01 (same session as the scan)
**Applies to:** the 9 defects in [`../run-20260701-100000/`](../run-20260701-100000/)

## Honest disposition statement

**None of the 9 defects in this run were applied to `apps/` source code.** This documentation pass
was explicitly scoped to `A07-1-STANDARDS-SCAN-RESULTS/` only and was instructed **not** to touch
`apps/`, `packages/`, `A05-1-UNIT-TESTS`, or any other top-level folder. Every `STD-NN-fix.md` in this
folder therefore records a **documented recommendation, not a code change** — each one is concrete
enough (file paths, exact snippets) for a Front-End Engineer, CMS Engineer, or Bug-Fixing agent to
apply directly, but "documented" and "fixed" are not conflated anywhere in this run's records.

This mirrors the intent of the reference `STD-NN-fix.md` format (fixed-vs-not-fixed, verification
steps) without overstating what happened: where the sibling reference project's fixes describe a
verified code change, these describe a **ready-to-apply** one.

## Disposition index

| ID | Severity | Disposition | Detail |
|----|----------|--------------|--------|
| [STD-01](STD-01-fix.md) | High | Documented only — not applied (out of scope: `apps/`) | Recommended `tsconfig.json` content for both packages |
| [STD-02](STD-02-fix.md) | Medium | Documented only — not applied (out of scope: repo root) | Recommended root `package.json` workspaces manifest |
| [STD-03](STD-03-fix.md) | Medium | Documented only — not applied (out of scope: `apps/web`) | Two remediation options (build `MobileMenu.tsx` or correct the comment) |
| [STD-04](STD-04-fix.md) | Medium | Documented only — not applied (out of scope: `apps/web`) | ARIA/keyboard markup recommendation |
| [STD-05](STD-05-fix.md) | Low | Documented only — not applied (out of scope: `apps/web`) | Env-var-driven recipient snippet |
| [STD-06](STD-06-fix.md) | Medium | Documented only — not applied (out of scope: `apps/web`) | Recommended `.eslintrc.json` content |
| [STD-07](STD-07-fix.md) | Low | Documented only — not applied (out of scope: `apps/`) | Recommended README skeletons |
| [STD-08](STD-08-fix.md) | Low | Documented only — not applied (out of scope: `apps/cms`) | Recommended `maxLength` values |
| [STD-09](STD-09-fix.md) | Medium | Documented only — not applied (out of scope: `apps/`) | Recommended `.env.example` content for both packages |

**Totals:** 9 documented, 0 applied to code, 0 rejected.

## Why detect-only, not fix-in-place, for this run

The run instruction for this scan was explicit: register findings under `A07-1-STANDARDS-SCAN-RESULTS/`
only, and leave `apps/`, `packages/`, and every other `A0N-*` folder untouched. That boundary is
respected here even though several of these fixes (STD-05, STD-06, STD-07, STD-09 especially) are
small enough to have been applied directly. Applying them is a **separate, explicitly-scoped**
Bug-Fixing pass — see each `STD-NN-fix.md`'s "Next step" line for what that pass should do.
