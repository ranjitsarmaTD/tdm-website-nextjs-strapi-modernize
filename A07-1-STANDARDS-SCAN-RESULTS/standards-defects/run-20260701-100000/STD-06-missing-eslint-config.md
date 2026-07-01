---
defect_id: STD-06
title: "No committed ESLint config despite apps/web declaring a lint script"
type: standards
severity: Medium
priority: P2
status: Open
rule_ids: ["NEXT-05", "A11Y-01"]
category: "tooling"
component: "apps/web"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Front-End Engineer"
labels: ["standards", "eslint", "tooling", "medium"]
affected_files:
  - "apps/web/package.json"
epic_link: null
fix_within: "before further apps/web UI components are added"
related: ["STD-01", "STD-04"]
---

# [STD-06] No committed ESLint config in `apps/web`

## 1. Summary
`apps/web/package.json` declares `"lint": "next lint"`, but no `.eslintrc*` (or flat `eslint.config.*`)
file exists anywhere under `apps/web`. `next lint` will prompt to auto-generate a default config on
first interactive run, but nothing is committed today, so there is no enforced, shared rule set — and
in particular no accessibility linting (`eslint-plugin-jsx-a11y`, which `eslint-config-next` includes
by default but which still needs the config file committed to actually run in CI).

## 2. Severity & rule mapping
**Severity: Medium.** Directly related to STD-04 (accessibility gap on the case-studies dropdown) —
`eslint-plugin-jsx-a11y`'s `anchor-is-valid`/`no-noninteractive-element-interactions` rules would have
flagged part of that pattern automatically had a config existed to run them.

## 3. Exact locations & evidence
- `apps/web/package.json` — `"lint": "next lint"` present.
- No `.eslintrc.json` / `.eslintrc.js` / `eslint.config.mjs` under `apps/web` (confirmed by search).

## 4. Why it matters
`npm run lint` today either interactively prompts (breaking any non-interactive CI run) or silently
does nothing meaningful, depending on the Next.js version's exact first-run behavior. Either way, the
`lint` script that's already promised in `package.json` isn't backed by an actual enforced rule set.

## 5. Recommendation
Commit `apps/web/.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```
`next/core-web-vitals` already pulls in `eslint-plugin-jsx-a11y`'s recommended rule set — committing
this one file closes both the general lint gap and materially improves detection of issues like STD-04
going forward.

## 6. Acceptance criteria
- [ ] `apps/web/.eslintrc.json` (or equivalent flat config) committed.
- [ ] `npm run lint -w apps/web` runs non-interactively and reports real findings (or zero) rather
      than prompting for setup.
- [ ] No source files need to change to satisfy this defect on its own (config-only fix).

## 7. References
- Coding-standards profile NEXT-05.
- STD-04 (accessibility gap this would have caught).
