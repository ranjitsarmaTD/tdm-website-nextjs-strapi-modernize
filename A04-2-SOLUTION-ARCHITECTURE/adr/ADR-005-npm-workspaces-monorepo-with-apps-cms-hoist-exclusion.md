# ADR-005 — npm-workspaces monorepo with `apps/cms` hoist exclusion

**Status:** Accepted

---

## Context

`TDWebsite2` is delivered as a single repository containing `apps/web` (Next.js 14), `apps/cms` (Strapi v5), `packages/shared` (the typed REST client), `packages/seed` (the one-time ETL tool), and `infra/` (deployment scripts). These need to be developed, versioned, and deployed together while keeping `apps/web` and `apps/cms` from reaching into each other's internals (architecture principle P2). Separately, Strapi v5's toolchain depends on `ajv@8`, while Next.js's toolchain (via ESLint's dependency tree) depends on `ajv@6` — two incompatible major versions of the same transitive dependency, both needed in the same repository (EP-27-S2).

## Decision

The repository is an **npm-workspaces monorepo** (`apps/web`, `packages/*`) with **Turborepo** as the task runner, and `apps/cms` is **deliberately excluded from the hoisting workspace** rather than folded into the same top-level `node_modules` hoist as everything else. This keeps Strapi's `ajv@8` and Next/ESLint's `ajv@6` from colliding in a single flattened dependency tree. This is recorded as a **preserved, hard-won constraint** — architecture principle P7 (overview §2) states explicitly that this is "a documented constraint, not a code smell to 'fix' later." The un-hoisting is mirrored operationally in PM2 (ADR-006/EP-27-S2): `apps/cms` runs as its own process with its own dependency tree, not assuming a shared hoisted `node_modules`.

## Consequences

- **Positive:** Both toolchains coexist in one repository without one's transitive dependency breaking the other — the actual problem this decision exists to solve, resolved cleanly rather than papered over.
- **Positive:** `apps/web` and `apps/cms` having genuinely separate dependency trees reinforces architecture principle P2 (no reaching into internals) at the tooling level, not just at the code-import level — a structural, not just conventional, boundary.
- **Negative:** `apps/cms` cannot benefit from workspace-level dependency deduplication the way `apps/web`/`packages/*` can — a modest disk/install-time cost, accepted deliberately.
- **Negative:** Anyone unfamiliar with this repo's history could look at the un-hoisted `apps/cms` and assume it's a misconfiguration or an incomplete monorepo migration — hence this ADR and principle P7 exist specifically to make the decision legible rather than something a future engineer "fixes" and reintroduces the `ajv` collision.
- **Neutral:** `packages/seed`, the one-time legacy-HTML → Strapi ETL tool, is a workspace member alongside `apps/web` — it's a build-time tool, not a runtime component, and doesn't carry the same toolchain-collision risk as `apps/cms`.

## Alternatives considered

| Alternative | Why not chosen |
|---|---|
| Fully hoisted single `node_modules` across the whole monorepo (default npm-workspaces behavior) | This is precisely what causes the `ajv@6`/`ajv@8` collision — one of the two toolchains would end up resolving the wrong major version, causing hard-to-diagnose runtime or build failures in either Next/ESLint or Strapi. |
| Two entirely separate repositories (`TDWebsite2-web`, `TDWebsite2-cms`) | Avoids the collision by construction, but fragments a single logical product across repos, complicates cross-cutting changes (e.g. updating `packages/shared`'s contract when a Strapi schema changes), and loses the benefit of one PR touching both sides of a contract change atomically. |
| Yarn or pnpm workspaces instead of npm workspaces | Both have their own hoisting/isolation models (pnpm's strict node_modules structure in particular might avoid this class of collision differently), but npm workspaces is the tool already in use and consistent with the team's existing Node.js tooling; switching package managers to solve one dependency collision is a disproportionate response when explicit hoist exclusion solves it directly. |
| Vendor/pin a compatible `ajv` version across both toolchains manually | Fragile — depends on both Strapi and Next/ESLint continuing to accept whatever pinned version is chosen, and would need re-verification on every upstream dependency bump; the hoist-exclusion boundary is structural and doesn't rot the same way a manual pin would. |
