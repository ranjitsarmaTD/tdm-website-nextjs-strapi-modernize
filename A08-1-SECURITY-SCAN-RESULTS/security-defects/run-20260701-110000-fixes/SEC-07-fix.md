# SEC-07 — CI/CD not yet active, no automated scanning — DOCUMENTED ONLY

**Severity:** Medium · **Status:** Documented only — not applied

## Why not applied

Activating scanning requires either adding a `.github/workflows/` file or changing GitHub repo
settings (Dependabot, secret scanning/push protection) — both outside this task's scope
(`A08-1-SECURITY-SCAN-RESULTS/` only). `infra/github/deploy.yml` was referenced from requirements,
not created or modified.

## Fix to apply (follow-on task)

1. Add `.github/dependabot.yml` (no secrets required, independent of the full deploy pipeline):
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/apps/web"
       schedule: { interval: "weekly" }
     - package-ecosystem: "npm"
       directory: "/apps/cms"
       schedule: { interval: "weekly" }
   ```
2. Enable GitHub secret scanning + push protection in repo settings (no code change, a settings
   toggle).
3. When `infra/github/deploy.yml`'s verify job is activated, add
   `npm audit --audit-level=high` scoped per workspace, per the dependency audit's note on
   `apps/cms`'s un-hoisted install boundary.

## Verification (once applied)

- [ ] Dependabot alerts appear for both `apps/web` and `apps/cms` independently.
- [ ] A test push of a dummy high-entropy string is caught by secret-scanning/push-protection.
