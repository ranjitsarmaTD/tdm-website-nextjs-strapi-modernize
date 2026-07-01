---
defect_id: STD-04
title: "Case-studies dropdown has no ARIA/keyboard affordance"
type: standards
severity: Medium
priority: P2
status: Open
rule_ids: ["A11Y-01"]
category: "accessibility"
component: "apps/web/components/layout/SiteHeader.tsx"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Front-End Engineer"
labels: ["standards", "accessibility", "a11y", "medium"]
affected_files:
  - "apps/web/components/layout/SiteHeader.tsx:86-94"
epic_link: "EP-01 — Global Site Shell, Navigation & Footer"
fix_within: "same PR as MobileMenu.tsx (STD-03) or before EP-01 sign-off"
related: ["STD-03"]
---

# [STD-04] Case-studies dropdown has no ARIA/keyboard affordance

## 1. Summary
The Case Studies nav item renders a `<ul className="sub-menu">` of 9 links directly nested inside the
`<li>` for "Case Studies" (`SiteHeader.tsx:86-94`), with no `aria-haspopup`, `aria-expanded`, no
`<button>` toggle, and no keyboard handling. The submenu's visibility is presumably controlled purely
by CSS `:hover`/`:focus-within` (inherited from the legacy Themeholy stylesheet, per ADR-004's
lift-and-shift strategy) — but nothing in this component signals its expand/collapse state to
assistive technology, and there is no way to open it via keyboard alone without relying on CSS-only
`:focus` order, which is fragile.

## 2. Severity & rule mapping
**Severity: Medium.** This is a real, testable accessibility gap on the one interactive nav affordance
in the header, not a cosmetic nit. It applies to both desktop hover and (once STD-03 lands) any mobile
equivalent.

## 3. Exact locations & evidence
```tsx
<li key={link.href} className={activePath === link.href ? "active" : undefined}>
  <a href={link.href}>{link.label}</a>
  {link.href === "/case-studies" && (
    <ul className="sub-menu">
      {CASE_STUDY_LINKS.map((cs) => (
        <li key={cs.href}>
          <a href={cs.href}>{cs.label}</a>
        </li>
      ))}
    </ul>
  )}
</li>
```
No `aria-haspopup="true"`, no `aria-expanded`, no `role="button"`/`onKeyDown` on the parent `<a>`.

## 4. Why it matters
A screen-reader user tabbing to the "Case Studies" link has no indication that it has an associated
submenu, and a keyboard-only user has no explicit way to expand it (only whatever `:focus-within` CSS
happens to do, which is not guaranteed by this component and isn't verifiable from the `.tsx` file
alone).

## 5. Recommendation
```tsx
<li key={link.href} className={activePath === link.href ? "active" : undefined}>
  <a
    href={link.href}
    aria-haspopup={link.href === "/case-studies" ? "true" : undefined}
    aria-expanded={link.href === "/case-studies" ? isCaseStudiesOpen : undefined}
  >
    {link.label}
  </a>
  {link.href === "/case-studies" && (
    <ul className="sub-menu" role="menu">
      {CASE_STUDY_LINKS.map((cs) => (
        <li key={cs.href} role="none">
          <a href={cs.href} role="menuitem">{cs.label}</a>
        </li>
      ))}
    </ul>
  )}
</li>
```
Add an `isCaseStudiesOpen` piece of state (or one `openMenu: string | null`) toggled on `onFocus`/
`onBlur`/`onKeyDown` (Escape closes it), in addition to whatever CSS hover behavior is preserved from
the legacy stylesheet.

## 6. Acceptance criteria
- [ ] "Case Studies" link exposes `aria-haspopup`/`aria-expanded` reflecting actual open state.
- [ ] Submenu is reachable and dismissible via keyboard alone (Tab in, Escape out) without relying on
      mouse hover.
- [ ] No visual regression to the existing lift-and-shift desktop styling.

## 7. References
- Coding-standards profile A11Y-01 (`guidelines-and-findings/standards-profile-and-methodology.md` §1.4).
- `A01-2-REQUIREMENTS/01-global-shell-navigation-and-footer.md` EP-01-S3.
