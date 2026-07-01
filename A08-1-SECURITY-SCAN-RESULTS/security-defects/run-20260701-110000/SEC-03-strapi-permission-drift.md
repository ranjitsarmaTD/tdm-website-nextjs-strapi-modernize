---
defect_id: SEC-03
title: "Strapi Public-role permission matrix has no automated regression test"
type: security
severity: HIGH
status: Open
component: "CMS-GLOBAL, CMS-CASE-STUDY, CMS-NEWS-ARTICLE, CMS-SERVICE, CMS-TEAM-MEMBER, CMS-PARTNER, CMS-TESTIMONIAL, CMS-CONTACT-SUBMISSION"
epic_story: "EP-23-S2, EP-23-S3"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "permissions", "config-drift", "strapi", "regression-test"]
affected_files:
  - "A01-2-REQUIREMENTS/09-cms-seo-and-platform.md"
---

# [SEC-03] Strapi Public-role permission matrix has no automated regression test

## Description

`A01-2-REQUIREMENTS/09-cms-seo-and-platform.md` (EP-23-S2, EP-23-S3) states an exact, hard-rule
permission matrix for the Strapi `Public` role: `find`/`findOne` on 7 read-oriented content types,
`create`-only on `contact-submission`, and **never** `update` or `delete` on anything, anywhere,
without exception. This is correctly and precisely specified in the requirements.

The problem is *where that rule lives once implemented*: Strapi's Users & Permissions plugin stores
role/permission grants as **database state configured through the admin UI**, not as a
version-controlled file that a `git diff` or CI check can inspect. Nothing in the requirements or
the code reviewed (`apps/cms/src/index.ts`, the two committed schema files) establishes an automated
check that re-verifies this matrix after the fact. A Site Administrator (or anyone with admin-panel
access) can widen it — intentionally or by misclick — with no code review, no CI gate, and no
regression test to catch the drift before it reaches production.

This is exactly the failure mode EP-23-S2/S3's own acceptance criteria describe as unacceptable
("this remains true even for content types that grant find/findOne... audited"), but "audited" is
not currently backed by any automated mechanism — only a manual, point-in-time check.

## Impact

If the Public role ever gains `update`/`delete` on any content type, or `find`/`findOne` on
`contact-submission`, the consequence is severe and silent: anonymous visitors could read
(potentially PII-bearing) contact-form submissions, or tamper with/delete published editorial
content — with no build failure, no PR diff, and no alert to surface the change until someone
happens to notice or a visitor exploits it.

## Recommendation

1. Add an automated regression test (can run against a local/CI Strapi instance seeded with the
   `Public` role) that asserts the exact permission matrix from EP-23-S2/S3: for each of the 7
   read-oriented types, `find`/`findOne` allowed and `create`/`update`/`delete` denied; for
   `contact-submission`, `create` allowed and `find`/`findOne`/`update`/`delete` denied.
2. Run this test as part of the verify job once CI is activated (ties to SEC-07/EP-27-S5), and
   ideally also as a smoke test any `deploy.sh` health-check pass (EP-27-S4) can invoke against the
   live Strapi instance post-deploy.
3. If feasible, export/version-control the permission configuration itself (Strapi supports
   config-as-code for some plugin settings via `apps/cms/config/`) so a diff is visible in code
   review rather than relying solely on a runtime test to catch drift after the fact.
