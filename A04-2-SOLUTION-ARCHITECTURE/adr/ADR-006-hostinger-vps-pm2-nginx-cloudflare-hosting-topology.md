# ADR-006 — Hostinger VPS + PM2 + Nginx + Cloudflare hosting topology

**Status:** Accepted

---

## Context

The legacy site has no deployment pipeline at all — it was static files with nothing to "run." `TDWebsite2` introduces two long-running Node.js processes (`apps/web`, `apps/cms`) and a PostgreSQL database that need to be hosted, kept alive, TLS-terminated, and reachable at production URLs (EP-27). The traffic profile is a low-to-moderate marketing site with no user accounts and no high-concurrency writes (overview §7) — the hosting topology should be sized to that reality, not built for a scale the site doesn't have (architecture principle P8, overview §2: "deploy small, deploy honestly").

## Decision

`infra/` targets a **single Hostinger VPS** running:

- **Nginx** as the reverse proxy handling TLS termination and routing to the two application processes.
- **PM2 in fork mode** running `apps/web` (`:3000`) and `apps/cms` (`:1337`) as two independent processes, each with `max_memory_restart` caps and automatic restart on breach — with `apps/cms`'s dependency-tree isolation from ADR-005 preserved at the process level too.
- **PostgreSQL** provisioned locally on the same VPS, with a dedicated least-privilege database role (EP-27-S3), backed up nightly via `backup.sh` (`pg_dump`, 30-day retention, EP-27-S4).
- **Cloudflare** in front of the VPS for DNS, CDN edge caching, WAF, and TLS — the layer that actually serves cached HTML to most visitors (doc 04 §1).

Deployment is scripted (`deploy.sh`: `git pull --ff-only` → `npm ci` → build → `pm2 reload --update-env` → health-check curls, with a `--rollback` flag) rather than manual. CI/CD (`infra/github/deploy.yml`) is designed and version-controlled up front but deliberately **not yet activated** — activation is a separate, explicit step (copying into `.github/workflows/` plus SSH secret provisioning), never described as already running until it is (EP-27-S5, principle P8).

## Consequences

- **Positive:** A single VPS with two PM2 processes is proportionate to the actual traffic profile — no unnecessary multi-region or auto-scaling infrastructure cost for a marketing site.
- **Positive:** `deploy.sh`'s fail-fast behavior (refusing a non-fast-forward `git pull`, persisting the last-known-good SHA before every deploy, health-checking both apps before declaring success) gives a real rollback path without needing a full orchestration platform.
- **Positive:** Cloudflare in front of the VPS gets CDN caching, WAF, and TLS essentially "for free" relative to configuring all three natively on the VPS itself.
- **Negative:** No multi-region high availability — a VPS outage takes down both `apps/web` and `apps/cms` simultaneously, and there is no independent front-end availability from the CMS (doc 05 §3). Accepted explicitly as appropriate to this traffic profile, not an oversight.
- **Negative:** PM2 fork mode (not cluster mode) means each app runs as a single Node.js process instance — vertical, not horizontal, scaling within the VPS; acceptable at the stated traffic profile but a real ceiling if traffic grows substantially.
- **Negative:** Cloudflare-layer cache purging beyond what Next.js's own revalidation triggers already cause is explicitly out of scope for v1 (doc 04 §6, overview §10 R6) — a theoretical stale-edge-in-front-of-fresh-origin scenario is not designed against.
- **Neutral:** CI/CD sitting designed-but-inactive until EP-27-S5's activation step is a deliberate honesty choice (principle P8) — it means initial cutover deploys are run via `deploy.sh` directly, with CI activation as a fast-follow, not a blocker.

## Alternatives considered

| Alternative | Why not chosen |
|---|---|
| A managed platform-as-a-service (Vercel for `apps/web`, a managed Strapi host for `apps/cms`) | Would split the two apps across different vendors/billing relationships and likely different regions, complicating the on-demand revalidation webhook's network path (ADR-003) between them; a single VPS keeps both processes co-located and the webhook call effectively local-network. |
| Containerized deployment (Docker Compose or Kubernetes) on the same VPS | Adds real operational complexity (image builds, container networking, orchestration) disproportionate to running two Node.js processes and one Postgres instance on a single box — PM2 fork mode plus Nginx already solves process supervision and reverse-proxying directly. |
| Multi-VPS / multi-region topology for high availability | Not justified by the stated traffic profile (overview §7) or any Story's acceptance criteria — would add cost and coordination complexity (e.g. database replication, session/cache consistency) with no corresponding requirement driving it. |
| PM2 cluster mode instead of fork mode | Cluster mode buys horizontal scaling within a single VPS at the cost of added complexity (shared state across worker processes, especially relevant for Strapi); fork mode's simplicity is a better fit until traffic actually demands more than one process instance. |
| No CDN (serve directly from Nginx on the VPS) | Loses Cloudflare's edge caching, WAF, and DNS/TLS convenience for negligible savings — CDN fronting is a low-cost, high-value addition given the SSG+ISR architecture already produces cacheable HTML (ADR-001). |
