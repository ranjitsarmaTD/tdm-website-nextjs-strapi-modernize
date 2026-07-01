# SECURITY-SCAN-RESULTS

All security-scanning output for the **TrieDatum website modernization** (`tdm-website-nextjs-strapi-modernize`) —
the migration of the legacy static `TDWebsite` (Themeholy HTML + jQuery + `mail.php`) into the
target Next.js 14 (App Router) + Strapi v5 + PostgreSQL monorepo (`apps/web` + `apps/cms`).

This directory is the single home for security artifacts on this project. **Durable, general
findings & guidance** live separately from **per-run defect records**, so a defect can always be
traced to the exact scanning run that produced it.

```
A08-1-SECURITY-SCAN-RESULTS/
├── README.md                              ← (this file) structure, methodology, latest run
├── guidelines-and-findings/                ← durable reports, threat model, dependency audit
│   ├── threat-model.md                         ← attack surfaces, actors, top risks
│   └── dependency-audit.md                     ← supply-chain / dependency posture
└── security-defects/                       ← individual defects, grouped by scan run
    ├── run-20260701-110000/                    ← the scan run itself
    │   ├── README.md                               ← run summary + defect index
    │   ├── defects-manifest.json                   ← machine-readable manifest (bulk upload)
    │   ├── defects-import.csv                      ← CSV for tracker bulk import
    │   └── SEC-NN-*.md                              ← one tracker-ready defect per finding
    └── run-20260701-110000-fixes/               ← remediation record for that run
        ├── README.md                               ← fix-run summary
        └── SEC-NN-fix.md                           ← one fix record per defect (applied or documented-only)
```

## Scope of this scan

This is a **scaffold-and-requirements-level security scan**, not a scan of a fully built, deployed
system — much of `apps/web` and `apps/cms` is still early scaffold (e.g. no `next.config.js`,
no `.env.example`, and no `contact-submission` content-type schema exist yet in the repo at scan
time). Findings below are drawn from three sources actually present in this repo:

1. **The requirements themselves** — `A01-2-REQUIREMENTS/07-contact-and-lead-capture.md` (EP-18/EP-19)
   and `A01-2-REQUIREMENTS/09-cms-seo-and-platform.md` (EP-23/EP-26/EP-27), which encode hard
   security rules (Strapi Public-role permission matrix, the secret-gated revalidation webhook, the
   documented-but-not-yet-active CI/CD pipeline).
2. **Code that already exists** — `apps/web/app/api/contact/route.ts`, `apps/web/app/api/revalidate/route.ts`,
   `apps/cms/src/index.ts`, and the two Strapi schemas already committed (`apps/cms/src/api/global`,
   `apps/cms/src/api/case-study`).
3. **What is conspicuously absent** — no `.env.example`, no `next.config.js` (hence no security
   headers or redirect table yet), no `contact-submission` schema/permissions file yet, no active
   `.github/workflows/`.

This scan does **not** compare this project against any other project's implementation — every
finding traces to this project's own scaffold, requirements, or code as it stands today.

## Folder conventions

| Folder | Holds | Lifecycle |
|--------|-------|-----------|
| `guidelines-and-findings/` | Threat model and dependency audit — durable, re-read on every future scan. | Durable; superseded in place as the project matures. |
| `security-defects/run-<timestamp>/` | The discrete, actionable defects from **one** scanning run, tracker-ready. | Immutable per run; a new run creates a new timestamped folder. |
| `security-defects/run-<timestamp>-fixes/` | What was actually fixed (or only documented) for that run's defects. | Immutable per run; paired 1:1 with its `run-<timestamp>/` folder. |

## Latest run

| | |
|---|---|
| **Run** | `run-20260701-110000` (2026-07-01) |
| **Findings** | 8 — **0 Critical · 3 High · 4 Medium · 1 Low** |
| **Highs** | SEC-01 no rate-limiting on `/api/contact` & `/api/revalidate` · SEC-02 richtext XSS risk if body ever rendered unsanitized · SEC-03 Strapi permission-drift risk (no regression test) |
| **Release call** | None of the Highs are launch-blocking in isolation (the platform has no production deployment yet), but all three should be closed before `apps/web`/`apps/cms` go live on the Hostinger VPS (EP-27). |
| **Start here** | [`guidelines-and-findings/threat-model.md`](guidelines-and-findings/threat-model.md) |

## Methodology (per scan)

1. **Recon** — read `A01-2-REQUIREMENTS` (contact/lead-capture, CMS/SEO/platform sections) to
   establish the *intended* controls (permission matrix, webhook secret gating, CI/CD status).
2. **Manual review of existing code** — `apps/web/app/api/contact/route.ts`,
   `apps/web/app/api/revalidate/route.ts`, `apps/cms/src/index.ts`, and committed Strapi schemas,
   checked against the mandated inspection vectors: injection, broken auth, abuse/rate-limiting,
   data exposure, dependency risk, insecure configuration.
3. **Gap sweep** — confirmed which controls named in requirements (Turnstile, security headers,
   `.env.example`, active CI) do or do not yet exist in the repo, to avoid double-counting an
   already-documented deferral as a "newly discovered" defect.
4. **Dependency posture** — `apps/web/package.json` (Next.js 14.2.0, React 18.3) and
   `apps/cms/package.json` (Strapi 5.0.0, `pg` 8.11) reviewed for stack-level supply-chain risk.
5. **Report & defects** — one durable threat model + dependency audit, plus per-finding,
   tracker-ready defect files.

## Severity → action policy

| Severity | Required action |
|----------|-----------------|
| Critical | Block release immediately |
| High | Fix before merge to `main` / before first VPS deploy |
| Medium | Fix within the sprint that implements the owning Epic/Story |
| Low | Fix within the quarter / opportunistically |

Critical/High must be remediated or formally risk-accepted before production. This scan is
advisory — sign-off belongs to the project's Site Administrator / Deploy Engineer role, not the
scanning agent.

## Uploading defects to a tracker

Defect files are **generated, not yet pushed**. Use `defects-import.csv` (CSV bulk import) or
`defects-manifest.json` (drive a tracker API) from the run folder. Uploading publishes to an
external system — request it explicitly and name the destination.
