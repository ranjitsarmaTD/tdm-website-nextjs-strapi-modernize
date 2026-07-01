---
defect_id: STD-05
title: "Hardcoded contact-notification recipient email in the contact API route"
type: standards
severity: Low
priority: P3
status: Open
rule_ids: ["NEXT-04"]
category: "config hygiene"
component: "apps/web/app/api/contact"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "Front-End Engineer"
labels: ["standards", "config", "hardcoded-value", "low"]
affected_files:
  - "apps/web/app/api/contact/route.ts:91"
epic_link: "EP-18 — Contact & Lead Capture"
fix_within: "same PR as any other contact-route change"
related: ["STD-09"]
---

# [STD-05] Hardcoded contact-notification recipient email

## 1. Summary
`notifyTeam()` in `apps/web/app/api/contact/route.ts` hardcodes the notification recipient:
```ts
body: JSON.stringify({
  to: "contact@triedatum.com",
  ...
})
```
Every other piece of configuration this route depends on (`STRAPI_URL`, `RESEND_API_KEY`) is read
from `process.env`, but the recipient address is a literal string.

## 2. Severity & rule mapping
**Severity: Low.** Functionally correct today, but it means changing the notification recipient — a
plausible, non-code operational change — requires a code change and redeploy instead of an env var
edit.

## 3. Exact locations & evidence
```
apps/web/app/api/contact/route.ts:91:      to: "contact@triedatum.com",
```

## 4. Why it matters
Matches NEXT-04 ("secrets/config read via `process.env.*`... never hardcoded"). The recipient address
is exactly the kind of value a non-engineer stakeholder (Site Administrator) will want to change
without a PR — e.g., during a team transition or if `contact@triedatum.com` needs to route to a
distribution list instead.

## 5. Recommendation
```ts
async function notifyTeam(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL ?? "contact@triedatum.com";
  if (!apiKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject: `New contact form submission from ${payload.name}`,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\nCompany: ${payload.company ?? ""}\nPhone: ${payload.phone ?? ""}\nMessage: ${payload.message}`,
    }),
  });
}
```
Keep the literal as the fallback default (safe, matches current behavior exactly) and document
`CONTACT_NOTIFICATION_EMAIL` in the `.env.example` recommended in STD-09.

## 6. Acceptance criteria
- [ ] Recipient is read from `process.env.CONTACT_NOTIFICATION_EMAIL` with the current literal as
      fallback default — unconfigured deployments behave identically to today.
- [ ] New env var documented in `.env.example` (STD-09).
- [ ] No behavioral change for the current, unconfigured case.

## 7. References
- Coding-standards profile NEXT-04.
- `A01-2-REQUIREMENTS/07-contact-and-lead-capture.md` EP-18.
