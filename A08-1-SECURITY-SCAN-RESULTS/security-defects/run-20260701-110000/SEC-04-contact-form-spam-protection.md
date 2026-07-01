---
defect_id: SEC-04
title: "Contact form has no real bot/spam gate beyond the honeypot (accepted, tracked risk)"
type: security
severity: MEDIUM
status: Accepted-Risk / Tracked
component: "API-CONTACT, SEC-CONTACT-FORM"
epic_story: "EP-18-S2, EP-18-S5"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "spam-protection", "honeypot", "turnstile", "already-documented-gap"]
affected_files:
  - "apps/web/app/api/contact/route.ts"
  - "A01-2-REQUIREMENTS/07-contact-and-lead-capture.md"
---

# [SEC-04] Contact form has no real bot/spam gate beyond the honeypot

## Description

`apps/web/app/api/contact/route.ts` implements exactly one anti-spam control: a honeypot field
check (`if (payload.honeypot) { ... return success-shaped, no write }`), matching EP-18-S2/S3
precisely. `A01-2-REQUIREMENTS/07-contact-and-lead-capture.md` (EP-18-S5) already documents that
real bot protection via Cloudflare Turnstile is **intentionally deferred to P4** and explicitly
warns that "a sophisticated bot that fills all visible and hidden fields, including the honeypot,
... may pass through to Strapi despite being spam" as an accepted, documented limitation.

This finding does **not** contradict that deferral or claim it as a newly discovered oversight — it
independently confirms, from a security-scan perspective, that the residual exposure described in
EP-18-S5 is real and should be tracked as a launch-time risk item (not just a backlog story) rather
than assumed-mitigated because a honeypot exists.

## Impact

At any meaningful traffic/attack volume, a bot that fills every field (a trivial upgrade from the
naive scripts a bare honeypot deters) passes through to a durable Strapi `contact-submission`
write and a Resend email to `contact@triedatum.com` — degrading signal quality for the sales team
and, combined with SEC-01's lack of rate-limiting, allowing volume-based abuse even without
defeating the honeypot logic itself (a flood that simply never touches the honeypot field succeeds
at the same rate a real user's traffic would).

## Recommendation

1. No code change is required to close EP-18-S5 itself — it is correctly scoped to P4 and its own
   acceptance criteria already state the honeypot-only state as intentional.
2. Recommend the project track this specific residual-risk item (not just "implement Turnstile
   eventually") as a launch-readiness checklist entry, so a conscious go/no-go decision is made at
   launch time rather than the risk being implicitly re-accepted by omission.
3. Prioritize SEC-01 (rate-limiting) as the cheaper, sooner mitigation for the same underlying
   exposure class, since it does not require the Turnstile integration work EP-18-S5 defers.
