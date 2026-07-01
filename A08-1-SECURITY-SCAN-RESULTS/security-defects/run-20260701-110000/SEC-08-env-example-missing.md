---
defect_id: SEC-08
title: "No .env.example committed — secrets-hygiene template missing"
type: security
severity: LOW
status: Open
component: "PLATFORM"
epic_story: "EP-18-S5, EP-26-S1, EP-27-S3, EP-27-S4"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "secrets", "config", "documentation"]
affected_files:
  - "(repo root — .env.example does not exist)"
---

# [SEC-08] No `.env.example` committed

## Description

A repo-wide search at scan time found no `.env.example` file anywhere in `tdm-website-nextjs-strapi-modernize`.
This is notable specifically because `A01-2-REQUIREMENTS/07-contact-and-lead-capture.md` (EP-18-S5)
states, as an explicit acceptance criterion, that `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` should
already be "present and documented as provisioned, not yet integrated" in `.env.example` — that
criterion cannot currently be met because the file itself doesn't exist. The same is true for the
other environment variables this project's own requirements already name:
`STRAPI_REVALIDATE_SECRET` (EP-26-S1), `RESEND_API_KEY` (EP-18-S4), `DATABASE_*` (EP-27-S3), and the
SSH/deploy secrets implied by EP-27-S4/S5.

This is separate from, and does not imply, any actual `.env` (a real secrets file) being committed —
no such file was found either, which is the correct state. The gap is the **absence of a safe
template**, not the presence of a leaked secret.

## Impact

Without a checked-in `.env.example`, each engineer/environment either reverse-engineers the required
variable names from source code (error-prone — e.g. missing `RESEND_API_KEY` degrades silently per
`apps/web/app/api/contact/route.ts`'s `notifyTeam()`, rather than failing loudly) or copies a real
`.env` from another environment, which is exactly the kind of ad hoc secret-sharing that raises the
odds of a real credential eventually being pasted somewhere it shouldn't (a chat message, a wrong
directory, a future accidental `git add .`). It also means EP-18-S5's own stated acceptance
criterion is not actually satisfiable yet.

## Recommendation

1. Add `.env.example` at the repo root (or per-app, matching wherever `apps/web`/`apps/cms` each read
   their env from) listing every variable name referenced in code or requirements today, with
   placeholder/empty values only: `STRAPI_URL`, `STRAPI_REVALIDATE_SECRET`, `RESEND_API_KEY`,
   `NEXT_WEB_URL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `DATABASE_*` (per EP-27-S3's
   naming), and any SSH-deploy variables EP-27-S4/S5 will need.
2. Add a `.gitignore` entry for `.env` (and `.env.local`, etc.) if not already present, to pair the
   template with an explicit guard against committing the real file — verify this exists as part of
   closing this defect.
3. Once added, this directly satisfies EP-18-S5's currently-unmet acceptance criterion regarding the
   Turnstile variables being "present and documented" ahead of the actual integration.
