<!-- Last updated: 2026-07-01 -->

# 08 — Troubleshooting Knowledge Base

**Audience:** Support · Deploy Engineer · Content Editor
**Source:** [04 — CMS Reference](04-cms-reference.md), [06 — Deployment Runbook](06-runbook-deployment.md), [03 — Web API Reference](03-web-api-reference.md)

Symptom-first lookup for the failure modes this architecture actually produces. Each entry gives
the symptom, the root cause, and the fix — cross-referenced back to the design docs that explain
*why* the system behaves this way, not just *what* to type.

## Contents

- [KB-1 — `ajv@6`/`ajv@8` hoist collision](#kb-1)
- [KB-2 — PM2 process crash loop](#kb-2)
- [KB-3 — Stale content after publish](#kb-3)
- [KB-4 — Webhook secret mismatch (`401 invalid_secret`)](#kb-4)

---

<a id="kb-1"></a>
## KB-1 — `ajv@6`/`ajv@8` hoist collision

**Symptom:** Strapi crashes immediately at boot with:

```
Error: Cannot find module 'ajv/dist/core'
```

**Root cause:** `apps/cms` requires `ajv@8`; the Next.js/ESLint toolchain elsewhere in the
monorepo requires `ajv@6`. If npm workspace hoisting is allowed to promote a single `ajv` version
to the root `node_modules`, `ajv@6` wins the hoist and shadows the `ajv@8` API surface Strapi
needs at boot. This is a **known, designed-around** failure mode — `apps/cms` is deliberately
excluded from workspace hoisting specifically to prevent it (`EP-27-S2`, see
[01 §2 P8](01-architecture-overview.md#2-architecture-principles) and
[06 §3](06-runbook-deployment.md#3-pm2-process-management)).

**How this happens in practice:**

- Someone runs a root-level `npm install` (or adds `apps/cms` to a hoisted workspace glob) without
  going through the isolated `cms:install` path.
- A monorepo tooling change accidentally removes the `nohoist`-equivalent exclusion.

**Fix:**

1. Confirm `apps/cms` has its own isolated `node_modules` rather than resolving `ajv` from the
   repo root:
   ```bash
   ls apps/cms/node_modules/ajv/package.json   # should exist and report a v8.x version
   ```
2. If it's missing or resolves to `ajv@6`, reinstall `apps/cms` in isolation rather than at the
   workspace root:
   ```bash
   npm run cms:install
   ```
3. Do **not** "fix" this with a dependency-override/resolutions hack that forces one shared `ajv`
   version — that's the specifically-rejected alternative; the correct fix is always to keep
   `apps/cms` out of the hoist, not to make both toolchains agree on one `ajv` major version.

---

<a id="kb-2"></a>
## KB-2 — PM2 process crash loop

**Symptom:** `pm2 list` shows a process repeatedly restarting (`↺` restart count climbing every
few seconds), never settling into `online`.

**Root cause:** distinguish two different things that both look like "the process keeps
restarting":

| Cause | How to tell | Fix |
|---|---|---|
| Hitting `max_memory_restart` under real, sustained load | Restarts are minutes/hours apart, not seconds; `pm2 logs` shows normal shutdown, no stack trace | Expected behavior, not a bug (§[06 §3](06-runbook-deployment.md#3-pm2-process-management)) — but investigate *why* memory is climbing if it's happening often |
| A boot-time crash (bad env var, DB unreachable, missing dependency) | Restarts are seconds apart; `pm2 logs <name>` shows the same error/stack trace every time, immediately on start | This is the actual crash loop — diagnose the logged error, not the restart itself |

**Diagnosis:**

```bash
pm2 logs cms --lines 50    # or "web"
pm2 describe cms           # restart count, uptime, memory
```

**Common boot-time crash causes for `cms`:**

- Missing/wrong `DATABASE_*` env vars — PostgreSQL connection refused (see
  [06 §4](06-runbook-deployment.md#4-postgresql-provisioning)).
- The `ajv` hoist collision — see [KB-1](#kb-1).
- `APP_KEYS`/JWT secrets missing on a fresh environment that was never given its own `.env`.

**Common boot-time crash causes for `web`:**

- `NEXT_PUBLIC_STRAPI_URL` pointing at an unreachable `apps/cms` during the build step (if the
  build itself fetches from Strapi at build time).
- A missing required env var causing an uncaught exception on the first request.

**Fix:** correct the underlying misconfiguration, then:

```bash
pm2 restart <name> --update-env
```

If the process still won't stay up after the config fix, escalate per
[07 — Incident & Recovery §Severity triage](07-runbook-incident-recovery.md#4-severity-triage).

---

<a id="kb-3"></a>
## KB-3 — Stale content after publish

**Symptom:** A Content Editor published a change in Strapi, but the public page still shows the
old value minutes later.

**Root cause:** the on-demand revalidation webhook is **best-effort** by design — it never blocks
or rolls back the Strapi save (see
[04 §3 — Failure isolation](04-cms-reference.md#3-lifecycle-hooks)). It can fail to reach
`apps/web` for any of these reasons, all of which produce the identical symptom:

| Cause | How to confirm |
|---|---|
| `apps/web` process is down | `pm2 list` shows `web` not online |
| `WEB_URL` in `apps/cms/.env` is wrong or stale (e.g. pointing at an old domain/port) | Check the value against the actual reachable origin |
| Network partition between the two apps | Manually `curl` from the CMS host to `WEB_URL` |
| The webhook fired, but the entry's content type isn't in the watched set | Page-level single types (`home-page`, `about-page`, etc.) aren't watched today — see [04 §3](04-cms-reference.md#3-lifecycle-hooks) |
| Wrong secret header | See [KB-4](#kb-4) — same underlying symptom, more specific cause |

**This is never data-loss** — the entry is safely published in Strapi regardless. It's purely a
*freshness* problem on the rendered page.

**Fix, in order:**

1. Fix whichever cause above applies (restart `web`, correct `WEB_URL`, resolve the network issue).
2. If you need the page fresh immediately rather than waiting, manually trigger the same
   revalidation the webhook would have:
   ```bash
   curl -X POST https://<web-origin>/api/revalidate \
     -H "Content-Type: application/json" \
     -H "x-revalidate-secret: $STRAPI_REVALIDATE_SECRET" \
     -d '{"model":"case-study","slug":"<slug>"}'
   ```
3. If you do nothing, the page **still self-heals within the hour** — every content fetch in
   `packages/shared` carries an independent `revalidate: 3600` fallback
   ([01 §5](01-architecture-overview.md#5-content-editing-pipeline-the-sync-contract),
   `EP-26-S3`). This is the designed safety net, not a workaround.

---

<a id="kb-4"></a>
## KB-4 — Webhook secret mismatch (`401 invalid_secret`)

**Symptom:** `POST /api/revalidate` responds `401` with `{ "revalidated": false, "error":
"invalid_secret" }`, or Strapi's logs show a warning that its revalidation call was rejected.

**Root cause:** `STRAPI_REVALIDATE_SECRET` must be byte-for-byte identical in both
`apps/web/.env` and `apps/cms/.env` (see
[03 §4](03-web-api-reference.md#4-environment-variables-this-surface-depends-on)). A mismatch
happens when:

- The secret was rotated in one app's `.env` but not the other.
- A deploy picked up a new `.env` in one app before the matching change was made in the other.
- A typo/whitespace difference was introduced when the secret was set.

**Fix:**

1. Compare the two values directly (don't eyeball it — diff them):
   ```bash
   grep STRAPI_REVALIDATE_SECRET apps/web/.env apps/cms/.env
   ```
2. Set both to the same value, then reload both processes so they pick it up:
   ```bash
   pm2 reload web --update-env
   pm2 reload cms --update-env
   ```
3. Re-test with the manual `curl` shown in [KB-3](#kb-3) to confirm the `401` clears.

**This failure mode produces the same visible symptom as [KB-3](#kb-3)** (stale content) from a
Content Editor's point of view — the difference only shows up in the logs/response code, which is
why a Deploy Engineer, not a Content Editor, should be the one diagnosing which KB entry applies.
