---
defect_id: STD-01
title: "No tsconfig.json in apps/web or apps/cms — TypeScript strict mode unenforceable"
type: standards
severity: High
priority: P1
status: Open
rule_ids: ["TS-01"]
category: "tooling / type-safety"
component: "apps/web, apps/cms (package roots)"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Front-End Engineer / CMS Engineer"
labels: ["standards", "typescript", "tooling", "high"]
affected_files:
  - "apps/web/package.json"
  - "apps/cms/package.json"
epic_link: null
fix_within: "before further TypeScript is added to either package"
related: ["STD-02", "STD-06"]
---

# [STD-01] No `tsconfig.json` in `apps/web` or `apps/cms`

## 1. Summary
Both `apps/web/package.json` and `apps/cms/package.json` declare `typescript: ^5.4.0` as a dependency
and `apps/web` ships a `"typecheck": "tsc --noEmit"` script, but neither package directory contains a
`tsconfig.json`. A search for `tsconfig*` anywhere under `apps/` returns no results. Without it,
`tsc --noEmit` either fails immediately (no config found) or falls back to TypeScript's permissive
defaults — `strict` is `false`, `noImplicitAny` is `false` — which is the opposite of this project's
own coding-standards profile (TS strict, no `any` unless at a documented untyped boundary).

## 2. Severity & rule mapping
**Severity: High.** This isn't a style nit — it's the config that decides whether every other TS rule
(`TS-02` no-`any`, `TS-03` typed props/payloads) is actually checked by tooling at all, and the
project's own root `CLAUDE.md`-equivalent convention (TS strict, run typecheck before committing)
cannot be honored without it.

## 3. Exact locations & evidence
- `apps/web/package.json` — `"typecheck": "tsc --noEmit"` present; no `apps/web/tsconfig.json` file.
- `apps/cms/package.json` — `typescript` devDependency present, no `apps/cms/tsconfig.json` file
  (Strapi's own generator normally scaffolds one; it wasn't committed here).

## 4. Why it matters
`SiteHeader.tsx`, `SiteFooter.tsx`, `contact/route.ts`, and `revalidate/route.ts` are already
well-typed by hand (explicit `interface`s throughout), but that discipline is currently
**unenforced** — nothing fails CI or a local `npm run typecheck` if a future edit introduces an
implicit `any` or loosens a type. The gap compounds every day more code is written against it.

## 5. Recommendation
Add a `tsconfig.json` to each package:

**`apps/web/tsconfig.json`** (Next.js 14 App Router baseline):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**`apps/cms/tsconfig.json`** (Strapi v5 TS baseline — `strapi generate` normally produces this):
```json
{
  "extends": "@strapi/typescript-utils/tsconfigs/server",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["./", "./**/*.json"],
  "exclude": ["node_modules/", "build/", "dist/", ".cache/", ".tmp/"]
}
```

## 6. Acceptance criteria
- [ ] `apps/web/tsconfig.json` exists with `"strict": true`.
- [ ] `apps/cms/tsconfig.json` exists (Strapi-generated baseline is acceptable).
- [ ] `npm run typecheck` in `apps/web` runs to completion (pass or a real, fixable type error — not
      a "cannot find tsconfig.json" failure).
- [ ] No behavioral change to any runtime code.

## 7. References
- Coding-standards profile TS-01 (`guidelines-and-findings/standards-profile-and-methodology.md` §1.1)
- `A04-2-SOLUTION-ARCHITECTURE/00-solution-architecture-overview.md` §6 (TypeScript stack choice)
