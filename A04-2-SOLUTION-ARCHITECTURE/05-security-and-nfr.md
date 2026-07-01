# 05 — Security & Non-Functional Requirements

> Strapi permission hardening, secret handling, performance/availability targets, and PII handling for `TDWebsite2` — the design basis the Security Reviewer and QA Architect agents test against (README §"Scope & guardrails"). Nothing below describes a control already running; it specifies what must be built and verified.

---

## 1. Strapi permission hardening

### 1.1 Public-role matrix (authoritative; full field detail in `02-data-architecture-and-content-model.md` §4)

| Content type | `find` | `findOne` | `create` | `update` | `delete` |
|---|---|---|---|---|---|
| `global` | Public (find only exists on singleType) | n/a | ✗ | ✗ | ✗ |
| `service`, `news-article`, `case-study`, `team-member`, `partner`, `testimonial` | Public, **published only** | Public, **published only** | ✗ | ✗ | ✗ |
| `contact-submission` | ✗ | ✗ | **Public** | ✗ | ✗ |

**Hard rules (EP-23-S2/S3, stated without exception):**

1. Public `find`/`findOne` on the 7 editorial types never returns a `draft`-state entry — an unauthenticated `GET` on a draft-only entry is a `404`, not a filtered `200`.
2. `update` and `delete` are unchecked for the Public role on **every** content type without exception — including the 7 read-oriented types where `find`/`findOne` is granted. Read access never implies write access.
3. `contact-submission` is the **only** content type where Public gets `create`; it gets nothing else there — no `find`, `findOne`, `update`, or `delete`. Submissions are write-only from the anonymous side; readable only via the authenticated Strapi admin panel.
4. Every other capability (admin CRUD on all 8 types, role/permission management) is Strapi's default **authenticated admin** capability set — not re-specified per type, and never exposed to the Public role.

### 1.2 `draftAndPublish`

Enabled on all 7 editorial types + `global`; **explicitly disabled** on `contact-submission` (EP-23-S4, EP-18-S3) — a submission is a data record with no draft/review workflow, not editorial copy.

### 1.3 Revalidation endpoint auth

`API-REVALIDATE` is gated by a secret header checked against `STRAPI_REVALIDATE_SECRET` (§2). A missing or incorrect secret is a `401` with **no** revalidation performed, regardless of whether the request body is otherwise well-formed — the auth check happens before any path-mapping logic runs (EP-26-S1).

---

## 2. Secret & credential handling

| Secret | Consumer | Notes |
|---|---|---|
| `STRAPI_REVALIDATE_SECRET` | `apps/cms` lifecycle hook (sender) ↔ `apps/web` `API-REVALIDATE` (verifier) | Shared secret, not a JWT; rotated by regenerating the env var on both sides in lockstep. |
| `STRAPI_API_TOKEN` | `packages/shared` (read client used by `apps/web`) | Read-scoped Strapi API token — never the full-access admin token. |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT` | `apps/cms` (Strapi's own required secrets) | Strapi-standard; generated per environment, never committed, never shared between dev/prod. |
| `DATABASE_*` (host/user/password/name) | `apps/cms` → PostgreSQL | Least-privilege dedicated role scoped to exactly one database (EP-27-S3) — never the Postgres superuser. |
| `RESEND_API_KEY` | `API-CONTACT` | Missing/invalid key degrades to a logged failure, not a `500` to the visitor (EP-18-S4). |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | (deferred — provisioned, unused) | Present in `.env.example`, documented as "provisioned, not yet integrated" — deliberately not wired into `API-CONTACT` at launch (EP-18-S5, P4). |

**Rules (hard rule #5 from `CLAUDE.md`, carried into this design):**

- No secret above is ever committed to the repository; `.env.example` documents variable *names*, never real values.
- No file under `.builder-data/`-equivalent runtime storage on the CMS/DB side (i.e. no ad hoc dump containing live secrets) is ever committed.
- Environment variables are the sole secret-delivery mechanism (overview §6 tech-stack table) — no secrets manager is introduced in v1; this is a scope decision appropriate to the single-VPS topology (ADR-006), not an oversight.

---

## 3. Performance & availability targets

*(Restated from overview §7 with the security/NFR framing this document owns; these are design-basis targets, not measured production SLAs — correct them if the business has different expectations.)*

| Dimension | Target |
|---|---|
| Traffic profile | Low-to-moderate marketing-site traffic; no user accounts, no checkout, no high-concurrency writes. |
| Page freshness (on-demand path) | Seconds after publish, when the webhook succeeds (doc 04 §2). |
| Page freshness (fallback path) | ≤ 3600 seconds worst case, unconditionally (doc 04 §6) — this is the number the design's correctness depends on, not the fast path. |
| TTFB for cached routes | Served from Cloudflare edge cache; sub-100 ms typical for a cache hit. |
| Availability | Single-VPS topology; no multi-region HA in v1. A VPS outage takes down both `apps/web` and `apps/cms` simultaneously — there is no independent front-end availability from the CMS. |
| Process resilience | PM2 `max_memory_restart` caps on both processes; automatic restart on breach (ADR-006, EP-27-S2). |
| Backup | Nightly `pg_dump` via `backup.sh`, 30-day retention, pruning anything older (EP-27-S4). |
| Deploy safety | `deploy.sh` refuses a non-fast-forward `git pull` rather than force-merging; persists the last-known-good SHA before every deploy so `--rollback` always has a target; health-checks both apps via `curl` before declaring success (EP-27-S4). |
| Database provisioning | Documented, repeatable recipe producing an isolated dedicated role/database per environment — verified idempotent across dev and prod (EP-27-S3). |
| SEO continuity | 23/23 legacy URLs 301; zero generic duplicated metadata; complete OG/canonical/sitemap/robots coverage (EP-24). |

---

## 4. PII handling — `contact-submission`

`contact-submission` is the one content type holding personally identifiable information: `name`, `email`, `company`, `phone`, `message` (doc 02 §1.8).

| Control | Detail |
|---|---|
| Collection minimality | Exactly the 5 fields listed — no IP address, user agent, or geolocation captured server-side beyond what the hosting/CDN layer logs independently of the application (Cloudflare's own logs are out of scope for this document). |
| Write path | `create`-only, server-validated (`API-CONTACT` re-validates every field server-side — the client-side validation in `SEC-CONTACT-FORM` is UX, never trusted alone, EP-18-S3). |
| Read path | **No public read path exists at all.** The only way to read a submission is the authenticated Strapi admin panel (Content Editor / Site Administrator role, doc 03 §2's `reviewsLeadsOn` relation) — never the Public REST API, not even a filtered/redacted view. |
| Durability vs. notification | The Strapi `create` is the durable record; the Resend notification email is a best-effort side effect that can fail without losing the underlying PII record (doc 04 §3). |
| Anti-spam / minimization of junk PII | A honeypot field filters bot submissions before they reach Strapi at all (EP-18-S2); real bot-verification (Cloudflare Turnstile) is deferred (EP-18-S5, P4) — accepted residual risk that some spam PII may be persisted until Turnstile lands. |
| Retention | Governed by the same nightly-backup/30-day-retention infrastructure as all other content (§3) — no separate PII-specific retention/erasure workflow (e.g. a "right to be forgotten" deletion flow) is specified in the requirements; flagged below as an open question rather than assumed out of scope. |
| Draft/publish | Disabled for this content type (§1.2) — a submission is never in a "draft" state visible to anyone, editorial or public. |

---

## 5. `[RISKS / OPEN QUESTIONS]`

| # | Item | Impact | Suggested owner |
|---|------|--------|------------------|
| S1 | No explicit PII erasure/right-to-be-forgotten workflow is specified for `contact-submission` beyond standard admin-panel delete access. | Compliance posture depends on the business's actual regulatory exposure (GDPR/CCPA); not assessed here. | Site Administrator / Product |
| S2 | Turnstile/CAPTCHA is deferred; the honeypot alone is known to pass a sophisticated bot that fills every field (EP-18-S5's own stated edge case). | Spam PII may be persisted (and a notification email sent) until Turnstile lands. | SEO Engineer / Deploy Engineer |
| S3 | Cloudflare-layer cache purging beyond Next.js's own revalidation triggers is out of scope for v1 (doc 04 §6) — no CDN-level control is specified if an edge node serves stale HTML past a fresh origin regeneration. | Theoretical cache-freshness edge case at the CDN layer, not the origin. | Deploy Engineer |
| S4 | No monitoring/alerting is specified for `API-REVALIDATE` webhook failure rate (EP-26-S3 explicit out-of-scope) — a Content Editor has no visibility into whether the fast path is silently failing. | Operational blind spot; the timed fallback still guarantees eventual correctness (doc 04 §6), so this is a UX/observability gap, not a correctness gap. | Deploy Engineer |
