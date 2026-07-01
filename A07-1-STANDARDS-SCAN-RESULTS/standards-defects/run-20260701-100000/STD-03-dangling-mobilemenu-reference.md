---
defect_id: STD-03
title: "SiteHeader.tsx references a MobileMenu.tsx component that does not exist"
type: standards
severity: Medium
priority: P2
status: Open
rule_ids: ["NEXT-01", "documentation-accuracy"]
category: "doc-vs-code drift / dead reference"
component: "apps/web/components/layout"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Front-End Engineer"
labels: ["standards", "drift", "mobile-nav", "medium"]
affected_files:
  - "apps/web/components/layout/SiteHeader.tsx:38-39"
epic_link: "EP-01 — Global Site Shell, Navigation & Footer"
fix_within: "before EP-01's mobile-nav story is marked done"
related: ["STD-04"]
---

# [STD-03] `SiteHeader.tsx` references a non-existent `MobileMenu.tsx`

## 1. Summary
`apps/web/components/layout/SiteHeader.tsx` line 38-39 comments:
> "EP-01-S3: shared verbatim between this dropdown and MobileMenu.tsx so the two surfaces can never
> list different case studies."

No `MobileMenu.tsx` file exists anywhere under `apps/web` (confirmed by directory listing — only
`SiteHeader.tsx` and `SiteFooter.tsx` exist in `components/layout/`). `SiteHeader.tsx` itself also has
no responsive/mobile rendering branch — it renders one `<nav className="main-menu">` unconditionally,
with a `data-desktop-breakpoint={992}` attribute but no actual mobile menu markup, toggle button, or
`"use client"`-driven open/close state for it.

## 2. Severity & rule mapping
**Severity: Medium.** The requirement this comment is scoped to (EP-01-S3, and by extension
EP-01-S1's mobile/desktop breakpoint behavior) is not yet implemented — the comment describes a
contract with a component that hasn't been built, which will mislead the next engineer into believing
mobile nav exists and just needs wiring, when in fact it needs building from scratch.

## 3. Exact locations & evidence
```
apps/web/components/layout/SiteHeader.tsx:38
// EP-01-S3: shared verbatim between this dropdown and MobileMenu.tsx so the
apps/web/components/layout/SiteHeader.tsx:39
// two surfaces can never list different case studies. `case8` is
```
`export const CASE_STUDY_LINKS` (line 42) is exported specifically so a future `MobileMenu.tsx` could
import it — the intent is real and reasonable, but the file it names doesn't exist yet.

## 4. Why it matters
Per `A01-2-REQUIREMENTS/01-global-shell-navigation-and-footer.md` (EP-01), the legacy site's
`DESKTOP_BREAKPOINT_PX = 992` constant only matters if there's a mobile menu to switch to below that
width. Without `MobileMenu.tsx`, mobile visitors currently get the desktop `<nav>` markup with no
adapted layout — a functional gap, not just a documentation one.

## 5. Recommendation
Either:
(a) build `apps/web/components/layout/MobileMenu.tsx` — a `"use client"` component that imports
`CASE_STUDY_LINKS` from `SiteHeader.tsx` (or a shared `nav-links.ts` module, to avoid a circular
import) and renders a toggle-driven off-canvas/dropdown menu for viewports below
`DESKTOP_BREAKPOINT_PX`, wired into `SiteHeader.tsx`'s render; or
(b) if mobile nav is intentionally deferred, correct the comment to say so explicitly and file the
follow-up against EP-01-S3 rather than leaving a comment that implies the file already exists.

## 6. Acceptance criteria
- [ ] Either `MobileMenu.tsx` exists and is rendered from `SiteHeader.tsx` below the desktop
      breakpoint, or the comment is corrected and a tracked follow-up exists.
- [ ] `CASE_STUDY_LINKS` (or its replacement) is not duplicated between the two surfaces.
- [ ] No behavioral regression to the existing desktop nav.

## 7. References
- `A01-2-REQUIREMENTS/01-global-shell-navigation-and-footer.md` EP-01-S1/S3.
