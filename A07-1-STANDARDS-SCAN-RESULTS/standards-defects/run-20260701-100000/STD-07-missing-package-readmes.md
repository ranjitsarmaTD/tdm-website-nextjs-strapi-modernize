---
defect_id: STD-07
title: "No package-level README.md in apps/web or apps/cms"
type: standards
severity: Low
priority: P3
status: Open
rule_ids: ["HYG-01"]
category: "documentation"
component: "apps/web, apps/cms"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Front-End Engineer / CMS Engineer"
labels: ["standards", "documentation", "low"]
affected_files:
  - "apps/web/README.md (does not exist)"
  - "apps/cms/README.md (does not exist)"
epic_link: null
fix_within: "opportunistic — same PR as any other package-level change"
related: ["STD-09"]
---

# [STD-07] No package-level `README.md` in `apps/web` or `apps/cms`

## 1. Summary
Neither `apps/web/` nor `apps/cms/` has its own `README.md`. A directory search for `README*` under
`apps/` returns no results. This project keeps a strong root-level documentation convention (per its
own `CLAUDE.md`-equivalent guidance: "Documentation is the primary surface"), and that convention
should extend to each workspace package once workspaces exist (see STD-02).

## 2. Severity & rule mapping
**Severity: Low.** Purely a documentation gap, no functional impact. Ranked low because at skeleton
stage there's genuinely little to document yet — but the gap should not be allowed to compound as
each package grows.

## 3. Exact locations & evidence
- `apps/web/` — no `README.md`.
- `apps/cms/` — no `README.md`.

## 4. Why it matters
A new contributor (or a `Front-End Engineer`/`CMS Engineer` agent persona picking up either package
cold) currently has to read `A01-2-REQUIREMENTS/` and `A04-2-SOLUTION-ARCHITECTURE/` to reconstruct
what `apps/web` even is, rather than getting a package-scoped orientation (scripts, required env vars,
where routes/components live) at the point of use.

## 5. Recommendation
`apps/web/README.md`:
```markdown
# apps/web — TDWebsite2 front end

Next.js 14 (App Router), SSG + ISR. See A04-2-SOLUTION-ARCHITECTURE/00 for the full design.

## Scripts
- `npm run dev` / `build` / `start` / `lint` / `typecheck` / `test`

## Required env vars
See `.env.example` (STD-09).
```
`apps/cms/README.md` analogous, covering Strapi's `develop`/`build`/`start` scripts and the content
types under `src/api/**`.

## 6. Acceptance criteria
- [ ] `apps/web/README.md` and `apps/cms/README.md` exist with at least: purpose, scripts, env-var
      pointer.
- [ ] No code changes required.

## 7. References
- Coding-standards profile HYG-01.
