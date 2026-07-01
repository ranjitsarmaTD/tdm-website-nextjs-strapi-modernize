---
defect_id: SEC-06
title: "No security headers configured (CSP / X-Frame-Options / Referrer-Policy / HSTS)"
type: security
severity: MEDIUM
status: Open
component: "SVC-SEO, INFRA-NGINX"
epic_story: "EP-27-S1, EP-24"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "headers", "csp", "defense-in-depth", "config"]
affected_files:
  - "apps/web/next.config.js"
---

# [SEC-06] No security headers configured

## Description

No `next.config.js` exists yet under `apps/web` (confirmed absent at scan time), and no
Content-Security-Policy, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`, or
`Strict-Transport-Security` header is declared anywhere in the code or infrastructure config
reviewed. `A01-2-REQUIREMENTS/09-cms-seo-and-platform.md` (EP-27-S1) specifies the Nginx reverse
proxy topology (apex → `apps/web`, `cms.` subdomain → Strapi admin) but does not mention security
headers as part of either the Nginx or Next.js configuration scope.

This matters more than a generic "add headers" best-practice note because of two other findings in
this run: richtext content is rendered without a documented sanitization step (SEC-02), and the
Strapi admin panel is reachable from any IP by default with the allowlist optional/off (per
EP-27-S1's own acceptance criteria). Security headers are the standard defense-in-depth layer for
exactly this combination — they don't replace sanitization, but they meaningfully reduce the blast
radius of an XSS if one slips through, and `X-Frame-Options`/`frame-ancestors` protects the admin
panel against clickjacking.

## Impact

Without a CSP, a successful stored-XSS payload (SEC-02) has an unconstrained execution context —
free to load arbitrary external scripts, exfiltrate data via `fetch`, or inject further content.
Without `X-Frame-Options`/`frame-ancestors`, both the public site and (more importantly) the Strapi
admin panel at `cms.<domain>` can be framed by a malicious page, enabling clickjacking against
Content Editors/Site Administrators. Without HSTS, a user's first visit over plain HTTP (or a
downgrade attempt) isn't automatically upgraded.

## Recommendation

1. Add a `headers()` function to `apps/web/next.config.js` once it's created, applying at minimum:
   `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (or `SAMEORIGIN` if any legitimate
   framing use case exists), `Referrer-Policy: strict-origin-when-cross-origin`, and
   `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (safe once TLS is
   confirmed stable per EP-27-S1).
2. Add a CSP — start with a reasonably strict default (`default-src 'self'`) and explicitly
   allowlist the known third-party origins already required by this project's own requirements:
   GA4 (EP-25-S1), Resend (server-side only, no CSP entry needed), and the future Turnstile
   widget/script origin (EP-18-S5) so the policy doesn't need rework when Turnstile lands.
3. Add an equivalent `X-Frame-Options`/CSP `frame-ancestors` directive to the Nginx server block for
   `cms.<domain>` (EP-27-S1) specifically protecting the Strapi admin panel, independent of whatever
   the IP-allowlist decision ends up being.
