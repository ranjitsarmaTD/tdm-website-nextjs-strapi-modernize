---
defect_id: SEC-02
title: "Richtext body fields have no documented sanitization step (stored XSS risk)"
type: security
severity: HIGH
status: Open
component: "CMS-CASE-STUDY, CMS-SERVICE, CMS-NEWS-ARTICLE"
epic_story: "EP-23-S1, EP-24-S1"
scan_run: run-20260701-110000
detected_date: 2026-07-01
detected_by: "Security Reviewer agent"
labels: ["security", "xss", "richtext", "content-modeling", "cwe-79"]
affected_files:
  - "apps/cms/src/api/case-study/content-types/case-study/schema.json"
  - "A01-2-REQUIREMENTS/00-overview-and-architecture.md"
---

# [SEC-02] Richtext body fields have no documented sanitization step (stored XSS risk)

## Description

Per the ER model in `A01-2-REQUIREMENTS/00-overview-and-architecture.md` §5 and the already-committed
`apps/cms/src/api/case-study/content-types/case-study/schema.json`, `case-study.body` is a Strapi
`richtext` field (confirmed committed: `"body": { "type": "richtext" }`). The same ER model specifies
`service.description` and `news-article.body` as `richtext` as well (not yet committed as schema
files at scan time, but specified with the same field type). Strapi `richtext` fields store raw
HTML/markdown-rendered-to-HTML content that is written by an authenticated Content Editor and is
expected to be rendered directly on public pages (`/case-studies/<slug>`, `/services/<slug>`,
`/news/<slug>`).

No requirement document or code reviewed specifies **how** that HTML is sanitized before being
rendered to a Site Visitor's browser (e.g. via `dangerouslySetInnerHTML` in a React Server Component,
which is the typical way a Next.js app renders richtext HTML from a headless CMS). Content Editors
are a trusted role today, but "trusted admin input" is not the same as "safe-to-render-unescaped
input" — a compromised admin session, a malicious/compromised browser extension in a Content
Editor's browser, or simply a pasted snippet from an untrusted source (e.g. copy-pasting rich text
from an external doc that carries an embedded `<script>` or `onerror` attribute) all become stored
XSS against every Site Visitor once that content is published, with no sanitization layer stated
anywhere in the architecture.

## Impact

Stored XSS via a richtext field would execute in the browser context of every anonymous Site
Visitor who loads the affected case-study/service/news page — capable of session/cookie theft
(low value here since there's no visitor auth, but still enables credential-phishing overlays,
malicious redirects, or defacement), and would be indexed and cached by the CDN/ISR layer,
amplifying reach until manually caught and the content edited.

## Recommendation

1. Decide and document (e.g. in `docs/content-model.md`, which EP-23's Definition of Done already
   requires be updated for schema/permission changes) whether sanitization happens server-side at
   render time in `apps/web` (e.g. via `sanitize-html`/`rehype-sanitize` wrapping every richtext
   render) or is enforced Strapi-side before storage. Server-side-at-render is the more robust
   choice since it protects against both malicious input and future schema/rendering changes.
2. Apply that sanitization at every richtext render site once `apps/web`'s page templates for
   case-study/service/news-article are implemented — this is currently zero-line-of-code risk only
   because those render templates don't exist yet; it becomes a live risk the moment they're built,
   so it should be closed in the same PR that first renders a richtext field, not after.
3. Add a lint/review checklist item: any new `dangerouslySetInnerHTML` usage in `apps/web` must go
   through the shared sanitizer, never inline.
