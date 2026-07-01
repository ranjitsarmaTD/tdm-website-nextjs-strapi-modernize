<!-- Last updated: 2026-07-01 -->

# 10 — Security & Compliance Summary

**Audience:** Site Administrator · Compliance · Developer
**Source:** [04 — CMS Reference §Permission matrix](04-cms-reference.md#2-permission-matrix), [02 — Content Model Dictionary](02-content-model-dictionary.md), [03 — Web API Reference](03-web-api-reference.md)

The security posture of the platform as specified — what's hardened, what's a stated design
trade-off, and what's an open item still requiring a decision. This summarizes controls defined
elsewhere in this documentation set rather than introducing new ones; each section links back to
its authoritative source.

## Contents

1. [Public-role permission hardening](#1-public-role-permission-hardening)
2. [Secret handling](#secret-handling)
3. [PII in contact submissions](#pii-in-contact-submissions)
4. [Spam and abuse controls](#spam-and-abuse-controls)
5. [Admin-panel access](#5-admin-panel-access)
6. [Open security items](#6-open-security-items)

---

## 1. Public-role permission hardening

The single hardest rule in the schema: the Strapi `Public` role — the identity `apps/web` uses
for every request — can never write anything except a `contact-submission`, and can never read
anything not yet published. See the full grant table in
[04 §2 — Permission matrix](04-cms-reference.md#2-permission-matrix); the summary:

| Capability | Granted to Public? |
|---|---|
| `find`/`findOne` published entries of editorial types | Yes |
| `find` on the `global` single type | Yes |
| `create` on `contact-submission` | Yes — the **only** public write anywhere in the schema |
| `find`/`findOne` on `contact-submission` | **No** — a submission is write-only from the anonymous side; only authenticated admins can read one back |
| `update`/`delete` on **any** content type, including the types Public can read | **No**, without exception |

**Enforcement mechanism.** These grants are applied programmatically by `SVC-BOOTSTRAP` at every
Strapi startup, not configured by hand in the admin UI — so the permission set is reproducible
across every environment and reviewable as code (`EP-23-S2`, `EP-23-S3`). This matters for
security review specifically because it means the permission matrix can't silently drift between
dev, staging, and production the way a click-configured setting could.

**Draft isolation.** Every editorial content type has `draftAndPublish` on, which is also a
security-relevant control, not just an editorial workflow feature: an unpublished draft is
invisible to the Public role's `find`/`findOne`, so work-in-progress content (an unfinished case
study, a testimonial not yet approved) is never accidentally exposed via the API before a Content
Editor deliberately publishes it (`EP-23-S4`, see [04 §4](04-cms-reference.md#4-draft--publish)).

---

<a id="secret-handling"></a>
## 2. Secret handling

| Secret | Lives in | Rule |
|---|---|---|
| `STRAPI_REVALIDATE_SECRET` | `apps/web/.env` **and** `apps/cms/.env` (must match exactly) | Shared secret gating `POST /api/revalidate` — a mismatch or leak lets anyone force cache invalidation, which is low-severity (it's not a data-write path) but should still be treated as a real secret |
| `STRAPI_API_TOKEN` | `apps/web/.env` | A **scoped, non-admin** token — must never be an admin/full-access token. `packages/shared`'s reads and `API-CONTACT`'s write both use this one token |
| `APP_KEYS` | `apps/cms/.env` | Strapi's session/cookie signing keys, auto-generated per environment — never reused across dev/staging/production |
| JWT secrets | `apps/cms/.env` | Auto-generated per environment, same rule as `APP_KEYS` |
| Database credentials | `apps/cms/.env` | Least-privilege role scoped to one database, never the Postgres superuser (see [06 §4](06-runbook-deployment.md#4-postgresql-provisioning)) |
| `RESEND_API_KEY` | `apps/web/.env` | Optional; scope to send-only if the provider supports it |

**Hard rules:**

- No `.env` file is ever committed. This is a repo-wide rule, not specific to this platform (see
  the project's root guidance).
- Every secret is **environment-specific** — a dev secret is never reused in staging or
  production, and a leaked/rotated secret is regenerated independently per environment, not
  globally.
- A secret rotation on one side of a paired secret (`STRAPI_REVALIDATE_SECRET`) must be applied to
  both `.env` files and both processes reloaded together — see
  [08 — Troubleshooting KB-4](08-troubleshooting-kb.md#kb-4) for the failure mode when this is
  done half-way.

---

<a id="pii-in-contact-submissions"></a>
## 3. PII in contact submissions

`CMS-CONTACT-SUBMISSION` (`contact-submission`) is the one content type in this schema that holds
genuine personal data by design: `name`, `email`, `phone`, and a free-text `message` (see
[02 §2](02-content-model-dictionary.md#cms-contact-submission--contact-submission)).

| Control | Detail |
|---|---|
| Visibility | Admin-only — the Public role has no `find`/`findOne` on this type at all (§1). Only authenticated Strapi admins can view a submission |
| Mutability | Read + delete only for admins — there is no `update`, because a submission is a record of what a visitor sent, not editorial content to be edited (see [05 §7](05-runbook-content-operations.md#7-handling-a-contact-form-submission)) |
| Write path | `API-CONTACT` server-side only, using the scoped `STRAPI_API_TOKEN` — no client-side code ever writes directly to Strapi |
| Retention | Not currently time-boxed — submissions persist indefinitely unless an admin deletes them. This is an open item, not a settled policy (see [§6](#6-open-security-items)) |
| Draft/publish | Off — see [04 §4](04-cms-reference.md#4-draft--publish); every submission is immediately a complete record, there's no "unpublished" state that would hide it from the admin who needs to act on it |

**Handling guidance for admins:** treat exported/downloaded submission data (e.g. copied into an
email or CRM) with the same care as the record in Strapi — the security boundary Strapi enforces
doesn't follow the data once it leaves the admin panel.

---

<a id="spam-and-abuse-controls"></a>
## 4. Spam and abuse controls

| Control | Status |
|---|---|
| Honeypot hidden field (`_gotcha` or equivalent) | **Active today.** A bot that fills every visible field also fills the hidden one; the request is accepted with a `200` (so the bot doesn't learn it was blocked) but silently never forwarded to Strapi (see [03 §1](03-web-api-reference.md#1-post-apicontact)) |
| Cloudflare Turnstile | **Designed, not yet wired** (`EP-18-S5`, deferred P4). The honeypot is the only live spam control today — this is a stated interim posture, not an oversight |
| Server-side field validation | **Active.** `name`/`email`/`message` required, `email` format-checked, before any write reaches Strapi |
| Rate limiting on `/api/contact` | Not currently implemented at the application layer — Cloudflare's platform-level DDoS/rate-limiting protection is the only control in front of this endpoint today |

---

## 5. Admin-panel access

The Strapi admin (`/admin` on the `cms.` subdomain) has its own authentication, entirely separate
from the API permission grants in §1 — logging into the admin panel and having Public-role API
access are two independent control planes (see
[04 §2 — Admin panel access](04-cms-reference.md#2-permission-matrix)).

An IP-allowlist for the admin path is available in the Nginx config but **inactive by default** —
see [06 §2](06-runbook-deployment.md#2-nginx-reverse-proxy-server-blocks). Enabling it is a
one-line config change, not a code change; whether to enable it is a Site Administrator decision,
not a platform default, because it trades convenience (admins working from varying IPs) against a
narrower attack surface.

---

## 6. Open security items

These are unresolved decisions, not documentation gaps — surfaced here so they aren't mistaken for
settled policy:

| Item | Detail | Owner |
|---|---|---|
| Contact-submission retention policy | No automatic expiry/deletion exists today; submissions accumulate indefinitely until an admin manually deletes them | Site Administrator |
| Admin-panel IP-allowlist | Available, inactive by default (§5) | Site Administrator |
| Real CAPTCHA vs. honeypot-only | Tracked as open item **O5** — see [09 — Release Playbook §1](09-release-playbook.md#1-pre-cutover-gate) and [11 — Traceability](11-traceability-coverage.md#open-items-carried-forward) | Site Administrator |
| Production secret rotation cadence | No stated rotation schedule beyond "never reuse across environments" (§2) | Site Administrator / Deploy Engineer |
