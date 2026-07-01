# SEC-06 — No security headers configured — DOCUMENTED ONLY

**Severity:** Medium · **Status:** Documented only — not applied to code

## Why not applied

`apps/web/next.config.js` does not exist yet in this repo, and creating/editing files under `apps/`
was explicitly out of scope for this task. There is nothing to patch yet — this is a "build it in
from the start" item for whoever creates that file, not a regression in an existing one.

## Fix to apply (follow-on task, when `apps/web/next.config.js` is first created)

```js
// apps/web/next.config.js
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' https://www.googletagmanager.com https://challenges.cloudflare.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-src https://challenges.cloudflare.com",
    ].join("; "),
  },
];

module.exports = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
```

Also add an equivalent `frame-ancestors`/`X-Frame-Options` directive to the Nginx server block for
`cms.<domain>` (EP-27-S1) protecting the Strapi admin panel specifically.

## Verification (once applied)

- [ ] Every response from `apps/web` includes the headers above.
- [ ] The CSP allowlist is updated when GA4 (EP-25-S1) and Turnstile (EP-18-S5) are actually wired
      in, so it doesn't silently block them.
