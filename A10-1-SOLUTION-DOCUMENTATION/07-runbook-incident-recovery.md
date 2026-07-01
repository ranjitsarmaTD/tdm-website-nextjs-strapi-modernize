<!-- Last updated: 2026-07-01 -->

# 07 — Incident & Recovery Runbook

**Audience:** Deploy Engineer · On-call
**Source:** [06 — Deployment Runbook](06-runbook-deployment.md), [`A01-2-REQUIREMENTS/09-cms-seo-and-platform.md`](../A01-2-REQUIREMENTS/09-cms-seo-and-platform.md) §EP-27

What to do when the site is down, a deploy went bad, or data needs restoring. This assumes the
infrastructure in [06 — Deployment Runbook](06-runbook-deployment.md) is already provisioned;
it's the "something's wrong, now what" companion to that document's "how to set it up."

## Contents

1. [First things to check when the site is down](#1-first-things-to-check-when-the-site-is-down)
2. [Rolling back a bad deploy](#2-rolling-back-a-bad-deploy)
3. [Restoring the database from backup](#3-restoring-the-database-from-backup)
4. [Severity triage](#4-severity-triage)
5. [Post-incident checklist](#5-post-incident-checklist)

---

## 1. First things to check when the site is down

Work top-down — each layer's failure looks different, and checking in this order avoids chasing
the wrong one:

| Order | Check | Command | If this is the problem |
|---|---|---|---|
| 1 | Is the VPS itself reachable? | `ping`/SSH to the VPS | Hosting-provider incident, not an app issue — check the Hostinger status page |
| 2 | Is Cloudflare serving an error page, or passing through? | Visit the site; check Cloudflare dashboard | A Cloudflare-side outage/misconfig; origin may be fine |
| 3 | Is Nginx up and proxying? | `sudo systemctl status nginx`, `tail -f /var/log/nginx/error.log` | Nginx crashed or misconfigured — a `502`/`503` here means Nginx is up but the upstream app isn't |
| 4 | Are both PM2 processes online? | `pm2 list` | A crashed/crash-looping process — see [08 — Troubleshooting KB-2](08-troubleshooting-kb.md#kb-2) |
| 5 | Is PostgreSQL accepting connections? | `psql "postgresql://triedatum@127.0.0.1:5432/triedatum" -c '\conninfo'` | DB down/unreachable — `apps/cms` will be failing to boot or erroring on every request |
| 6 | Is the most recent deploy the cause? | `pm2 logs`, compare timestamp of outage to last deploy | Go to [§2 — Rolling back](#2-rolling-back-a-bad-deploy) |

**A useful signal:** if `apps/web` is down but `apps/cms` is fine (or vice versa), the problem is
almost certainly in that one app's process or its most recent deploy — the two apps are
independently deployable and don't share a failure domain by design
([01 §2, P8](01-architecture-overview.md#2-architecture-principles)).

---

## 2. Rolling back a bad deploy

```bash
./infra/deploy/deploy.sh --rollback
```

This checks out the SHA `deploy.sh` stored as "last known good" immediately before the deploy
that's now suspect, rebuilds, and reloads PM2 back to that state — see
[06 §5](06-runbook-deployment.md#5-deploysh) for the exact mechanics.

**Before rolling back:**

1. Confirm it actually *is* the deploy — check `pm2 logs` for an error signature that started
   exactly at deploy time, not before.
2. Note the current (bad) SHA before rolling back, so it can be diagnosed later without needing
   to reproduce the incident live.

**After rolling back:**

1. Re-run the health checks `deploy.sh` itself runs (`curl` against both apps) to confirm the
   rollback actually restored service.
2. File the bad SHA as a known-bad build before anyone re-deploys it.

**If the rollback itself fails** (e.g. the previous SHA also doesn't build cleanly in the current
environment), stop and treat it as a P1 — do not keep trying successively older SHAs blindly; get
a second person to diagnose why "known good" no longer builds.

---

## 3. Restoring the database from backup

Use this when data loss or corruption is confirmed — not as a first response to "the site is
down," which is usually a process/deploy issue (§1), not a data issue.

1. **Stop writes.** Stop the `cms` PM2 process so nothing writes to PostgreSQL mid-restore:
   ```bash
   pm2 stop cms
   ```
2. **Identify the right dump.** Backups live under `/var/backups/triedatum/`, one gzipped
   `pg_dump` per night, retained 30 days (see [06 §6](06-runbook-deployment.md#6-backupsh)):
   ```bash
   ls -la /var/backups/triedatum/
   ```
3. **Restore into a fresh database**, never directly over the live one, so a bad restore doesn't
   destroy the last-known-good state before it's confirmed good:
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE triedatum_restore OWNER triedatum;"
   gunzip -c /var/backups/triedatum/triedatum-<date>.sql.gz | psql "postgresql://triedatum@127.0.0.1:5432/triedatum_restore"
   ```
4. **Verify the restored data** against `triedatum_restore` — spot-check a few known entries.
5. **Cut over.** Once verified, repoint `apps/cms/.env`'s `DATABASE_NAME` at `triedatum_restore`
   (or rename databases) and restart:
   ```bash
   pm2 restart cms --update-env
   ```
6. **Confirm.** Health-check `apps/cms`'s admin panel and REST API before declaring the incident
   resolved.

**Expected data loss window:** up to ~24 hours (since the last nightly `pg_dump`) — any content
published or contact-submission created after the most recent backup is not recoverable this way.
This is a stated trade-off of the nightly-backup cadence, not an oversight; more frequent backups
are a possible follow-up if this window proves too wide in practice.

---

## 4. Severity triage

| Severity | Symptom | Response |
|---|---|---|
| P1 | Both apps unreachable, or data corruption/loss confirmed | Immediate — follow §1 top-down, then §2 or §3 as diagnosed |
| P2 | One app down, the other unaffected | Isolate to that app's process/deploy — §1 steps 4–6 |
| P3 | Site up, but content stale beyond the 1-hour ISR fallback window | Not an outage — see [08 — Troubleshooting KB-3](08-troubleshooting-kb.md#kb-3) |
| P4 | Cosmetic/content defect, no availability impact | Route to a Content Editor or Front-End Engineer, not an incident |

---

## 5. Post-incident checklist

- [ ] Service confirmed restored via health-check `curl` against both `apps/web` and `apps/cms`
- [ ] Root cause identified (bad deploy / DB issue / infra issue / other) and recorded
- [ ] If rolled back: bad SHA flagged so it isn't redeployed before the underlying issue is fixed
- [ ] If restored from backup: data-loss window communicated to whoever owns lead-capture follow-up
  (a restored database may be missing recent `contact-submission` entries)
- [ ] `pm2 logs` / Nginx error log snippets saved before they rotate out, for later diagnosis
