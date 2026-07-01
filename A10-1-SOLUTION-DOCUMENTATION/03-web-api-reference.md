<!-- Last updated: 2026-07-01 -->

# 03 — Web API Reference

**Audience:** Front-End Engineer · CMS Engineer
**Source:** `apps/web/app/api/*/route.ts`, `packages/shared`

This document covers two distinct API surfaces: `apps/web`'s own two API routes (`API-CONTACT`,
`API-REVALIDATE`), and the read contract `packages/shared` uses to call Strapi's REST API on
`apps/web`'s behalf. There is no third-party-facing public API — both `apps/web` routes exist to
serve the site itself and the CMS's webhook, not external integrators.

## Contents

1. [`POST /api/contact`](#1-post-apicontact)
2. [`POST /api/revalidate`](#2-post-apirevalidate)
3. [`packages/shared` → Strapi REST contract](#3-packagesshared--strapi-rest-contract)
4. [Environment variables this surface depends on](#4-environment-variables-this-surface-depends-on)

---

## 1. `POST /api/contact`

**Component:** `API-CONTACT` · **File:** `apps/web/app/api/contact/route.ts`
**Replaces:** the legacy `mail.php` handler (`EP-18-S1`)
**Auth:** none (public endpoint) — protected by input validation + a honeypot field, not a token

### Request

```
POST /api/contact
Content-Type: application/json
```

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Acme Corp",
  "phone": "+1 555 0100",
  "message": "We'd like to talk about a data platform engagement.",
  "_gotcha": ""
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | |
| `email` | string | yes | Validated as a well-formed email server-side before forwarding |
| `company` | string | no | |
| `phone` | string | no | |
| `message` | string | yes | |
| `_gotcha` (or equivalent hidden field name) | string | no | **Honeypot.** Must arrive empty; a bot filling every field trips this and the request is silently accepted but never forwarded to Strapi. This is the only spam control today — see [10 — Security](10-security-compliance.md#spam-and-abuse-controls) |

### Behavior

1. Validate required fields are present and `email` is well-formed. Missing/invalid input → `400`.
2. Check the honeypot field. If populated, respond `200` (so a bot doesn't learn it was blocked)
   but skip the downstream write entirely.
3. `POST` a `contact-submission` to Strapi's REST API using the server-side `STRAPI_API_TOKEN`
   (never the public read-only token — see [§4](#4-environment-variables-this-surface-depends-on)).
4. If `RESEND_API_KEY` is set, best-effort send a notification email via Resend. A Resend failure
   does **not** fail the request — the submission is already durably stored in Strapi.
5. Respond to the caller.

### Response

| Status | Body | Meaning |
|---|---|---|
| `200` | `{ "ok": true }` | Submission stored (or silently dropped as a honeypot trip) |
| `400` | `{ "ok": false, "error": "<reason>" }` | Missing/invalid required field |
| `502` | `{ "ok": false, "error": "cms_unreachable" }` | Strapi did not accept the write (e.g. CMS down, token invalid) |

### Downstream write

```
POST {NEXT_PUBLIC_STRAPI_URL}/api/contact-submissions
Authorization: Bearer {STRAPI_API_TOKEN}
Content-Type: application/json
```

```json
{ "data": { "name": "Jane Doe", "email": "jane@example.com", "company": "Acme Corp", "phone": "+1 555 0100", "message": "..." } }
```

Strapi responds `201` with the created entry; `contact-submission` has draft & publish **off**, so
the record is immediately visible to admins with no separate publish step.

---

## 2. `POST /api/revalidate`

**Component:** `API-REVALIDATE` · **File:** `apps/web/app/api/revalidate/route.ts`
**Purpose:** on-demand ISR — invalidate the Next.js cache for a route the instant its content
changes, instead of waiting for the timed `revalidate` window (`EP-26-S1`)
**Auth:** shared-secret header, not a session or JWT

### Request

```
POST /api/revalidate
Content-Type: application/json
x-revalidate-secret: {STRAPI_REVALIDATE_SECRET}
```

```json
{ "model": "case-study", "slug": "case9" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `model` | string | yes | The Strapi content-type UID that changed (`global`, `service`, `case-study`, `news-article`, `team-member`, `partner`, `testimonial`) |
| `slug` | string | no | The entry's slug, when the model is a routable collection type; omitted for `global` and other non-slugged models |

### Behavior

1. Compare the `x-revalidate-secret` header to `STRAPI_REVALIDATE_SECRET`. Mismatch → `401`
   immediately, no revalidation performed.
2. Map `model` (+ `slug` if present) to the affected Next.js path(s) — e.g. `case-study` + `case9`
   → `/case-studies/case9` (and, for models that also feed the homepage, the homepage path too).
3. Call `revalidatePath()` for each affected path.
4. Respond with the list of paths revalidated.

### Response

| Status | Body | Meaning |
|---|---|---|
| `200` | `{ "revalidated": ["/case-studies/case9", "/"] }` | Success |
| `401` | `{ "revalidated": false, "error": "invalid_secret" }` | Secret header missing or wrong |
| `400` | `{ "revalidated": false, "error": "unknown_model" }` | `model` not in the recognized set |

### Caller

The only caller is `SVC-BOOTSTRAP`'s `registerRevalidateHooks()` in `apps/cms/src/index.ts`,
which subscribes to `db.lifecycles.subscribe` for every editorial content type and POSTs here on
create/update/delete, targeting the `WEB_URL` configured in `apps/cms/.env`. See
[01 §5](01-architecture-overview.md#5-content-editing-pipeline-the-sync-contract) for the full
sequence and [08 — Troubleshooting](08-troubleshooting-kb.md) for failure modes.

---

## 3. `packages/shared` → Strapi REST contract

`apps/web` never calls Strapi's REST API directly — every fetch goes through a typed accessor in
`packages/shared`. This is the enforced "one dependency boundary" from
[01 §Architecture principles](01-architecture-overview.md#2-architecture-principles) (P2).

| Accessor | Strapi endpoint | Used by |
|---|---|---|
| `getGlobal()` | `GET /api/global?populate=*` | `SEC-FOOTER`, `SEC-HEADER` |
| `getServices()` | `GET /api/services?populate=*` | `PAGE-SERVICES`, `SEC-SERVICES-CAROUSEL` |
| `getCaseStudies()` | `GET /api/case-studies?populate=*` | `SEC-CASESTUDIES-CAROUSEL`, homepage grid |
| `getCaseStudy(slug)` | `GET /api/case-studies?filters[slug][$eq]=<slug>&populate=*` | `PAGE-CASESTUDY-DETAIL` |
| `getNews()` | `GET /api/news-articles?populate=*&sort=publishedDate:desc` | `PAGE-NEWS`, `SEC-NEWS-GRID` |
| `getNewsArticle(slug)` | `GET /api/news-articles?filters[slug][$eq]=<slug>&populate=*` | `PAGE-NEWS-DETAIL` |
| `getTeam()` | `GET /api/team-members?populate=*&sort=order:asc` | `PAGE-ABOUT` |
| `getPartners()` | `GET /api/partners?populate=*&sort=order:asc` | `PAGE-PARTNERSHIP`, `SEC-PARTNERS-STRIP` |
| `getTestimonials()` | `GET /api/testimonials?populate=*` | `SEC-TESTIMONIALS` |
| `getTestimonial(slug)` | `GET /api/testimonials?filters[slug][$eq]=<slug>&populate=*` | `PAGE-TESTIMONIAL-DETAIL` |

### Request shape

Every call sends the read-only bearer token:

```
GET {NEXT_PUBLIC_STRAPI_URL}/api/<endpoint>
Authorization: Bearer {STRAPI_API_TOKEN}   (read-only, scoped token in prod; omitted in local dev if Public role grants suffice)
```

### Response shape (Strapi v5 flattened format)

```json
{
  "data": [
    { "id": 9, "documentId": "abc123", "title": "...", "slug": "case9", "summary": "...", "seo": { "metaTitle": "..." } }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 10 } }
}
```

### Resilience contract

Every accessor:
1. Sets `next: { revalidate: 3600 }` on the fetch, so a Strapi response is cached to Next's disk
   cache for at most an hour even with zero webhook delivery (`EP-26-S3`).
2. Is wrapped by the calling component with a static `FALLBACK` array — if the fetch throws or
   Strapi is unreachable, the section renders the fallback content rather than crashing the page
   (P7 in [01 §2](01-architecture-overview.md#2-architecture-principles)).

---

## 4. Environment variables this surface depends on

| Variable | App | Purpose |
|---|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | `apps/web` | Base URL for every `packages/shared` call; defaults to `http://localhost:1337` |
| `STRAPI_API_TOKEN` | `apps/web` | Bearer token for `packages/shared` reads and `API-CONTACT`'s write; a **scoped, non-admin** token in production |
| `STRAPI_REVALIDATE_SECRET` | both apps | Shared secret gating `API-REVALIDATE`; must be identical in `apps/web/.env` and `apps/cms/.env` |
| `WEB_URL` | `apps/cms` | The front-end origin `SVC-BOOTSTRAP`'s lifecycle hooks POST to |
| `RESEND_API_KEY` | `apps/web` | Optional; enables the contact-form notification email |
| `PORT` / `HOST` | `apps/cms` | Strapi's listen port/host (default `1337`); if changed, `NEXT_PUBLIC_STRAPI_URL` must be updated to match |

See [10 — Security & Compliance §Secret handling](10-security-compliance.md#secret-handling) for
rotation and never-commit rules.
