---
defect_id: STD-09
title: "No committed .env.example documenting required environment variables"
type: standards
severity: Medium
priority: P2
status: Open
rule_ids: ["HYG-02"]
category: "config hygiene"
component: "apps/web, apps/cms"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Deploy Engineer"
labels: ["standards", "config", "env-vars", "medium"]
affected_files:
  - "apps/web/.env.example (does not exist)"
  - "apps/cms/.env.example (does not exist)"
epic_link: "EP-27 — CMS Platform, SEO, Redirects, Analytics & Hosting"
fix_within: "before first deploy attempt"
related: ["STD-05"]
---

# [STD-09] No committed `.env.example`

## 1. Summary
Across the five source files scanned, the following environment variables are read but never
enumerated in any committed `.env.example`:
- `apps/web/app/api/contact/route.ts`: `STRAPI_URL`, `RESEND_API_KEY`
- `apps/web/app/api/revalidate/route.ts`: `STRAPI_REVALIDATE_SECRET`
- `apps/cms/src/index.ts`: `STRAPI_REVALIDATE_SECRET`, `NEXT_WEB_URL`
- `A04-2-SOLUTION-ARCHITECTURE/00` §6 also names `APP_KEYS` and DB credentials as required for
  `apps/cms`, not yet reflected in any checked-in example file.

No `.env.example` exists at either package root (confirmed by search).

## 2. Severity & rule mapping
**Severity: Medium.** Every one of these env vars has a documented "unconfigured = no-op, not an
error" fallback in code (e.g. `notifyRevalidate` in `apps/cms/src/index.ts` returns early if
`STRAPI_REVALIDATE_SECRET` is unset) — which is good defensive design, but it also means a
misconfigured deployment **fails silently** (the webhook just never fires) rather than loudly. A
committed `.env.example` is the cheapest mitigation: it makes every required var discoverable without
reading five source files.

## 3. Exact locations & evidence
```
apps/web/app/api/contact/route.ts:53   process.env.STRAPI_URL
apps/web/app/api/contact/route.ts:84   process.env.RESEND_API_KEY
apps/web/app/api/revalidate/route.ts:34 process.env.STRAPI_REVALIDATE_SECRET
apps/cms/src/index.ts:47               process.env.STRAPI_REVALIDATE_SECRET
apps/cms/src/index.ts:50               process.env.NEXT_WEB_URL
```

## 4. Why it matters
This directly matches the risk called out in `A04-2-SOLUTION-ARCHITECTURE/00-solution-architecture-overview.md`
§10 (R3): the webhook's best-effort semantics already mean a Content Editor gets no in-admin
confirmation of revalidation success. An undocumented, misconfigured `STRAPI_REVALIDATE_SECRET` on
either side (set on one app, not the other, or mismatched) makes every publish silently stale until
the 1-hour timed-ISR fallback catches up — exactly the failure mode a committed `.env.example` most
directly guards against.

## 5. Recommendation
`apps/web/.env.example`:
```
STRAPI_URL=http://localhost:1337
STRAPI_REVALIDATE_SECRET=
RESEND_API_KEY=
CONTACT_NOTIFICATION_EMAIL=contact@triedatum.com
```
`apps/cms/.env.example`:
```
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
APP_KEYS=
STRAPI_REVALIDATE_SECRET=
NEXT_WEB_URL=http://localhost:3000
```

## 6. Acceptance criteria
- [ ] `.env.example` committed at both package roots, covering every env var actually referenced in
      source at time of authoring.
- [ ] `STRAPI_REVALIDATE_SECRET` value matches conceptually across both files (same var name, both
      sides), preventing the exact mismatch failure mode described above.
- [ ] No real secret values committed — placeholders/empty strings only.

## 7. References
- Coding-standards profile HYG-02.
- `A04-2-SOLUTION-ARCHITECTURE/00-solution-architecture-overview.md` §6 (Secrets), §10 (R3).
