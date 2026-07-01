# SEC-02 — Richtext body fields have no documented sanitization step — DOCUMENTED ONLY

**Severity:** High · **Status:** Documented only — not applied to code

## Why not applied

The `apps/web` render templates for `/case-studies/<slug>`, `/services/<slug>`, and `/news/<slug>`
do not exist yet in this repo, so there is no render call to add sanitization *to* today. This fix
pass is also scoped to `A08-1-SECURITY-SCAN-RESULTS/` only. The one committed schema
(`apps/cms/src/api/case-study/content-types/case-study/schema.json`) was read, not modified — no
schema change is needed to fix this; the fix belongs entirely on the render side.

## Fix to apply (follow-on task, at the time those pages are built)

1. Add a shared sanitizer (e.g. wrapping `sanitize-html` or `rehype-sanitize` with a project-wide
   allowlist of tags/attributes appropriate for CMS-authored marketing copy) in
   `packages/shared` so every richtext render site uses the same policy.
2. Wire it into every `dangerouslySetInnerHTML` call rendering a `richtext` field:
   `case-study.body`, `service.description`, `news-article.body`.
3. Add a lint rule or PR-template checklist item flagging any new `dangerouslySetInnerHTML` usage
   that doesn't go through the shared sanitizer.

## Verification (once applied)

- [ ] A case-study/service/news entry with a `<script>` or `onerror=` payload in its richtext field
      renders inert (stripped or escaped), not executed, on the public page.
- [ ] Legitimate rich-text formatting (bold, links, headings, images) still renders correctly.
