# Standards Audit — Full Scaffold — 2026-07-01

**Run:** `run-20260701-100000` · **Scope:** `apps/web/`, `apps/cms/` (the entire code skeleton that
exists at time of scan) · **Rule profile:** [`standards-profile-and-methodology.md`](standards-profile-and-methodology.md)

## 1. What was in scope, and why the boundary is drawn where it is

This scan covers exactly the two package directories that contain real source at time of run:

- `apps/web/` — `package.json`, `components/layout/SiteHeader.tsx`, `components/layout/SiteFooter.tsx`,
  `app/api/contact/route.ts`, `app/api/revalidate/route.ts`.
- `apps/cms/` — `package.json`, `src/index.ts`, `src/api/case-study/content-types/case-study/schema.json`,
  `src/api/global/content-types/global/schema.json`, `src/components/shared/{link,seo,social-link}.json`.

`packages/`, `A05-1-UNIT-TESTS`, and every other top-level `A0N-*` folder besides `A07-1-STANDARDS-SCAN-RESULTS`
were deliberately **not** read or modified for this run — out of scope per this run's own instructions.
Findings below are grounded entirely in the files actually read, not inferred from the requirements or
architecture documents alone.

## 2. Headline

The eleven files that exist are **small, internally consistent, and unusually well-commented for a
skeleton** — every non-obvious decision (why `case8` is missing from the nav, why the honeypot returns
a success-shaped response, why `apps/cms`'s lifecycle hook swallows its own fetch failures) carries a
one-line WHY comment tied back to an Epic/Story ID. That is the standard the rest of the build should
be held to.

What's missing is almost entirely **project-level scaffolding that hasn't been laid down yet**: there
is no `tsconfig.json`, `.eslintrc*`, or `next.config.js` anywhere in the repo, and no root workspace
`package.json` — despite `apps/web/package.json` already shipping a `typecheck`/`lint` script that has
nothing to run against. This is expected for a skeleton this early, but it is a real, actionable gap,
not a "clean bill of health," and is logged as such (STD-01, STD-06, STD-09).

The two UI components that exist (`SiteHeader.tsx`, `SiteFooter.tsx`) are otherwise solid, but each has
one concrete, fixable gap: `SiteHeader.tsx` references a `MobileMenu.tsx` that does not exist in the
tree (STD-03), and its case-studies dropdown has no keyboard/ARIA affordance (STD-04). The one API route
that talks to an external service (`app/api/contact/route.ts`) hardcodes its notification recipient
rather than sourcing it from config (STD-05).

## 3. Findings summary

| ID | Severity | Title | Location |
|----|----------|-------|----------|
| [STD-01](../standards-defects/run-20260701-100000/STD-01-missing-tsconfig-strict-mode.md) | **High** | No `tsconfig.json` in `apps/web` or `apps/cms` — TS strict mode unenforceable | `apps/web/`, `apps/cms/` |
| [STD-02](../standards-defects/run-20260701-100000/STD-02-missing-workspace-root-manifest.md) | Medium | No root `package.json`/`workspaces` manifest for the npm-workspaces monorepo | repo root |
| [STD-03](../standards-defects/run-20260701-100000/STD-03-dangling-mobilemenu-reference.md) | Medium | `SiteHeader.tsx` references a `MobileMenu.tsx` component that doesn't exist | `apps/web/components/layout/SiteHeader.tsx:39` |
| [STD-04](../standards-defects/run-20260701-100000/STD-04-dropdown-missing-aria-and-keyboard-support.md) | Medium | Case-studies dropdown has no ARIA/keyboard affordance | `apps/web/components/layout/SiteHeader.tsx:86-94` |
| [STD-05](../standards-defects/run-20260701-100000/STD-05-hardcoded-notification-recipient.md) | Low | Hardcoded contact-notification recipient email | `apps/web/app/api/contact/route.ts:91` |
| [STD-06](../standards-defects/run-20260701-100000/STD-06-missing-eslint-config.md) | Medium | No committed ESLint config despite a `lint` script | `apps/web/package.json` |
| [STD-07](../standards-defects/run-20260701-100000/STD-07-missing-package-readmes.md) | Low | No package-level `README.md` in `apps/web` or `apps/cms` | `apps/web/`, `apps/cms/` |
| [STD-08](../standards-defects/run-20260701-100000/STD-08-strapi-schema-missing-length-constraints.md) | Low | Strapi `case-study`/`global` schemas lack `maxLength` on string/text fields | `apps/cms/src/api/case-study/content-types/case-study/schema.json` |
| [STD-09](../standards-defects/run-20260701-100000/STD-09-missing-env-example.md) | Medium | No committed `.env.example` documenting required env vars | `apps/web/`, `apps/cms/` |

**Totals: 9 — 0 Critical · 1 High · 5 Medium · 3 Low.**

## 4. Positive observations (worth preserving as the codebase grows)

- Every "why is this hardcoded / deferred / swallowed" decision in the five source files is documented
  inline and traces back to an Epic/Story ID — this is exactly the "non-obvious logic carries a
  one-line WHY comment" bar this project should hold itself to.
- Both API routes (`contact`, `revalidate`) validate input server-side and fail closed on bad input,
  matching NEXT-03.
- `apps/cms/src/index.ts`'s lifecycle hook correctly treats the revalidation webhook as best-effort —
  a failed `fetch` is caught, logged, and never blocks or fails the underlying Strapi write, matching
  CMS-04 and ADR-003's "never a correctness dependency" principle.
- `SiteFooter.tsx` already guards against a common real bug (`.filter((link) => Boolean(link.url))`
  before rendering `footerLinks`), which is exactly the kind of defensive code this profile wants to
  see, not "just in case" over-defensiveness.

## 5. Advisory call

**CONDITIONAL.** No security-class or architecture-violation defects. The one High (STD-01) should be
closed before more `apps/web`/`apps/cms` TypeScript is written, since every line added without a
`tsconfig.json` is currently unchecked by the `typecheck` script that already exists in `package.json`.
The remaining 8 are real but not launch-blocking at this stage of the build.
