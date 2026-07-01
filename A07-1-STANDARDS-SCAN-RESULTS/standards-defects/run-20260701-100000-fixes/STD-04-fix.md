# STD-04 — Dropdown missing ARIA/keyboard support — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. `SiteHeader.tsx`'s case-studies dropdown markup was not modified — an
`apps/web` change outside this run's scope.

## Recommended fix (ready to apply)
Add `aria-haspopup`/`aria-expanded` to the "Case Studies" `<a>`, add `role="menu"`/`role="menuitem"`
to the submenu, and wire an `isCaseStudiesOpen` state toggled on focus/blur/Escape. Exact JSX in
[`../run-20260701-100000/STD-04-dropdown-missing-aria-and-keyboard-support.md`](../run-20260701-100000/STD-04-dropdown-missing-aria-and-keyboard-support.md)
§5.

## Next step
Bundle with STD-03 if `MobileMenu.tsx` is built in the same pass — both touch `SiteHeader.tsx`'s
nav-item rendering and share the same `CASE_STUDY_LINKS` data.

## Verification (not yet performed)
Not run. Once applied: keyboard-only Tab/Escape walkthrough + an automated a11y check (e.g. axe) once
STD-06's ESLint config is also in place.
