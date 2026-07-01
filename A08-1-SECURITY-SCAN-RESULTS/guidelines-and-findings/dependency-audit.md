# Dependency Audit — TrieDatum Website Modernization

**Stack:** Next.js 14 (App Router) + Strapi v5 (TypeScript) + PostgreSQL, npm-workspaces monorepo
(`apps/web`, `apps/cms`, `packages/shared`, `packages/seed`).

This is a fresh scaffold — `apps/web/package.json` and `apps/cms/package.json` each declare a
small, mostly first-party dependency set today. The audit below is therefore weighted toward
**supply-chain posture and process** (what will catch problems as the dependency tree grows) rather
than a large existing CVE backlog, since there isn't one yet.

## 1. Current dependency inventory

### `apps/web` (Next.js 14.2.0)

| Package | Version | Note |
|---|---|---|
| `next` | 14.2.0 | Current major; confirm patch-level CVE status before first deploy (Next.js has shipped several security patch releases within the 14.x line — pin to latest 14.2.x at deploy time, not just "14.2.0" literally). |
| `react` / `react-dom` | ^18.3.0 | Standard, low risk. |
| `typescript` | ^5.4.0 | Dev-only. |
| `vitest`, `@testing-library/*`, `jsdom` | — | Dev/test-only; not shipped to production, lower supply-chain weight but still an install-time attack surface (postinstall scripts). |

### `apps/cms` (Strapi 5.0.0)

| Package | Version | Note |
|---|---|---|
| `@strapi/strapi` | 5.0.0 | Pin to the latest 5.x patch at deploy time — Strapi has a history of admin-panel and plugin CVEs; the `Users & Permissions` plugin specifically (used here for the entire Public-role security model in EP-23) should be watched closely since it is the direct enforcement point for the permission matrix this project's security model depends on. |
| `@strapi/plugin-users-permissions` | 5.0.0 | Same lockstep version as core; see above — this is the plugin implementing EP-23-S2/S3's access control. |
| `pg` | ^8.11.0 | Standard PostgreSQL driver, low independent risk; ensure it's kept current alongside Strapi's own supported range. |
| `jest`, `ts-jest` | ^29.x | Dev-only. |

## 2. Supply-chain / build-integrity items

### 2.1 `ajv@6` / `ajv@8` hoist collision (EP-27-S2)

`A01-2-REQUIREMENTS/09-cms-seo-and-platform.md` (EP-27-S2) documents a real, hard-won architecture
decision: Strapi's dependency tree requires `ajv@8`, while the Next.js/ESLint toolchain elsewhere in
this monorepo requires `ajv@6`. If npm workspace hoisting is allowed to collapse both to a single
root-level `ajv`, whichever toolchain loses the hoist breaks — concretely, Strapi fails to boot with
`Cannot find module 'ajv/dist/core'` if `ajv@6` wins. The documented fix is to keep `apps/cms`
un-hoisted (its own `node_modules` install boundary) rather than resolving the conflict via a
`resolutions`/`overrides` dependency-pinning hack.

**Why this belongs in a security/dependency audit, not just a build note:** an un-hoisted,
independently-installed `apps/cms/node_modules` means Strapi's transitive dependency tree is
**not** deduplicated against the rest of the monorepo. That's the correct call functionally, but it
also means `npm audit`/Dependabot-style tooling must be configured to scan `apps/cms` as its own
root, not assume a single top-level lockfile covers the whole tree — a single monorepo-root
`npm audit` will silently under-report `apps/cms`'s actual exposure once this exclusion is in place.
This is folded into SEC-07 (no automated scanning active yet) as a configuration detail that scanning
setup must account for once it's added, not treated as a separate defect today.

### 2.2 No automated dependency scanning is active yet

Per EP-27-S5, `infra/github/deploy.yml` is designed but not copied into `.github/workflows/`, so no
GitHub event currently triggers *any* CI job — including a dependency/secret scan. There is
currently no `npm audit`, Dependabot config (`.github/dependabot.yml`), or Renovate config anywhere
in the repo. See **SEC-07** in this run's defects for the tracked action item; recommendation is to
add a scanning-only workflow (or Dependabot alerts, which don't require the deploy pipeline to be
active at all) independently of and sooner than the full CI/CD activation, since dependency scanning
has no coupling to the deploy secrets that are presumably the reason activation is being staged
carefully.

### 2.3 Strapi admin panel and plugin CVE watch

Because `@strapi/plugin-users-permissions` is the actual enforcement mechanism for this project's
entire public-write/public-read security model (EP-23), any CVE affecting that plugin's permission
evaluation is higher-impact here than a typical "just another npm package" finding. Recommend
subscribing to Strapi's security advisories specifically (not just generic `npm audit` output) given
how much of this project's threat model rests on that one plugin behaving as configured.

### 2.4 Lockfile discipline

No `package-lock.json` was found committed at the monorepo root or under either app at scan time.
Given `apps/cms`'s deliberate un-hoisted install boundary (2.1), reproducible installs across
dev/CI/VPS deploy depend on committing lockfiles for **both** the root workspace and, if it ends up
with its own install boundary, `apps/cms` specifically — otherwise `deploy.sh`'s `npm ci` step
(EP-27-S4) has nothing to enforce against and could silently drift between environments.

## 3. Recommendations (priority order)

1. Add Dependabot (or equivalent) alerts scoped to both `apps/web` and `apps/cms` independently,
   given the un-hoisted `apps/cms` install boundary — do this before full CI/CD activation, not
   contingent on it (ties to SEC-07).
2. Commit lockfiles for both install boundaries once dependencies stabilize, so `npm ci` in
   `deploy.sh` (EP-27-S4) is meaningful.
3. Pin `@strapi/strapi` and `@strapi/plugin-users-permissions` to the same minor/patch line and
   track Strapi security advisories explicitly, given the plugin's role as the sole enforcement
   point for EP-23's permission model.
4. When `infra/github/deploy.yml` is activated (EP-27-S5), include an `npm audit --audit-level=high`
   (or equivalent SCA tool) step in the verify job, scoped per workspace.
