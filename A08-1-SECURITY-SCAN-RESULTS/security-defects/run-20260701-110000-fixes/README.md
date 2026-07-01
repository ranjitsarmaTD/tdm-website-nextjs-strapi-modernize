# Fix Record — Scan Run `run-20260701-110000`

This folder records, per defect, **whether a fix was actually applied to code or only
documented** for the `run-20260701-110000` scan.

## Honest status for this fix pass

**No source code under `apps/` was modified as part of this fix pass.** This documentation and
scan-recording task was scoped exclusively to `A08-1-SECURITY-SCAN-RESULTS/` — every other
top-level folder, including `apps/`, `packages/`, and the other `A0N-*` directories, was explicitly
out of scope. All 8 defects below are therefore **documented-only**: each fix file gives the exact
remediation a follow-on engineering task should apply, with concrete file/line targets, but none of
that remediation has been applied to `apps/web` or `apps/cms` yet.

This is stated plainly rather than glossed over — a fix record that claims code changes that didn't
happen would itself be a documentation-integrity problem, the same category of issue SEC-07/EP-27-S5
already warns against ("CI/CD is automated" claims that don't match reality).

## Status index

| ID | Severity | Fix status | Follow-on owner |
|----|----------|------------|------------------|
| [SEC-01](SEC-01-fix.md) | High | Documented only — not applied | Front-End Engineer (`apps/web/app/api/contact/route.ts`, `.../revalidate/route.ts`) |
| [SEC-02](SEC-02-fix.md) | High | Documented only — not applied | CMS Engineer + Front-End Engineer (sanitization at render, not yet built) |
| [SEC-03](SEC-03-fix.md) | High | Documented only — not applied | CMS Engineer (needs a test harness against a running Strapi instance) |
| [SEC-04](SEC-04-fix.md) | Medium | No fix needed — already correctly accepted/tracked per EP-18-S5 | N/A (tracking recommendation only) |
| [SEC-05](SEC-05-fix.md) | Medium | Documented only — not applied | Front-End Engineer + CMS Engineer |
| [SEC-06](SEC-06-fix.md) | Medium | Documented only — not applied | Front-End Engineer (`apps/web/next.config.js` doesn't exist yet) |
| [SEC-07](SEC-07-fix.md) | Medium | Documented only — not applied | Deploy Engineer (`.github/` config, repo settings) |
| [SEC-08](SEC-08-fix.md) | Low | Documented only — not applied | Any engineer — smallest, fastest close in this run |

**0 of 8 fixed in code this pass; 8 of 8 have a documented, actionable remediation plan.**
