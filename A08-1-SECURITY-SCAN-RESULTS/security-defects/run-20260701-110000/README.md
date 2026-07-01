# Security Defects — Scan Run `run-20260701-110000`

**Scan initiated:** 2026-07-01 11:00:00 (local) · **Target:** `tdm-website-nextjs-strapi-modernize`
**Detected by:** Security Reviewer agent

This folder contains **all security defects identified in a single security-scanning run** against
this project's own requirements (`A01-2-REQUIREMENTS/07-contact-and-lead-capture.md`,
`A01-2-REQUIREMENTS/09-cms-seo-and-platform.md`) and the code already present under `apps/web` and
`apps/cms`. Each run gets its own timestamped folder so successive scans never overwrite each other
and a defect can always be traced to the run that produced it.

## Contents

| File | Purpose |
|------|---------|
| `defects-manifest.json` | Machine-readable manifest of all defects (for tooling / bulk upload) |
| `defects-import.csv` | Flat CSV for spreadsheet or defect-tracker bulk import |
| `SEC-01 … SEC-08 *.md` | One self-contained, Bug-Fixing-agent-ready defect per file |
| `README.md` | This file |

## Defect index

| ID | Severity | Title | Primary location | Owning Epic/Story |
|----|----------|-------|-------------------|--------------------|
| [SEC-01](SEC-01-missing-rate-limiting.md) | **High** | No rate-limiting on `/api/contact` or `/api/revalidate` | `apps/web/app/api/contact/route.ts`, `apps/web/app/api/revalidate/route.ts` | EP-18-S3, EP-26-S1 |
| [SEC-02](SEC-02-richtext-xss-risk.md) | **High** | Richtext body fields have no documented sanitization step (stored XSS risk) | `apps/cms/src/api/case-study/**/schema.json` (`body`), `service.description`, `news-article.body` | EP-23-S1, EP-24-S1 |
| [SEC-03](SEC-03-strapi-permission-drift.md) | **High** | Strapi Public-role permission matrix has no automated regression test | Strapi admin-panel permission config (EP-23-S2/S3) | EP-23-S2, EP-23-S3 |
| [SEC-04](SEC-04-contact-form-spam-protection.md) | Medium | Contact form has no real bot/spam gate beyond the honeypot (accepted, tracked risk) | `apps/web/app/api/contact/route.ts` | EP-18-S2, EP-18-S5 |
| [SEC-05](SEC-05-revalidate-secret-hygiene.md) | Medium | Revalidation secret handling hygiene (non-constant-time compare, no rotation, silent no-op) | `apps/web/app/api/revalidate/route.ts:34`, `apps/cms/src/index.ts:47-48` | EP-26-S1, EP-26-S2 |
| [SEC-06](SEC-06-missing-security-headers.md) | Medium | No security headers configured (CSP / X-Frame-Options / Referrer-Policy / HSTS) | `apps/web/next.config.js` (does not exist yet) | EP-27-S1, EP-24 |
| [SEC-07](SEC-07-cicd-not-active-no-scanning.md) | Medium | CI/CD not yet active — no automated dependency/secret scanning runs today | `infra/github/deploy.yml` (not yet activated), `.github/workflows/` (absent) | EP-27-S5 |
| [SEC-08](SEC-08-env-example-missing.md) | Low | No `.env.example` committed — secrets-hygiene template missing | repo root | EP-18-S5, EP-26-S1, EP-27-S3/S4 |

**Totals: 8 findings — 0 Critical · 3 High · 4 Medium · 1 Low.**

## Defect file format

Every `SEC-NN-*.md` opens with a YAML frontmatter block (`defect_id`, `severity`, `status`,
`component`, `epic_story`, `affected_files`, `labels`, …) followed by: description, impact,
recommendation, and — where useful — reproduction/verification notes. Designed so a Bug-Fixing
agent (or a human) can act on the defect without any other context.

## Framing note

Every finding here originates from scanning **this project's own** scaffold, requirements, and
code — none are derived from comparing this repo against any other project. Where a requirement
document already discloses a gap as an intentional, deferred decision (the contact-form Turnstile
deferral in EP-18-S5; the not-yet-active CI/CD pipeline in EP-27-S5), the corresponding defect here
says so explicitly and treats the finding as an **independent confirmation of a known, tracked
risk**, not a newly "discovered" oversight.

## How to upload to a defect tracker

Defect files are **generated, not yet pushed**. Use `defects-import.csv` (CSV bulk import) or
`defects-manifest.json` (drive a tracker API) to publish. Uploading is a separate, explicit step —
request it and name the destination repo/project when ready.
