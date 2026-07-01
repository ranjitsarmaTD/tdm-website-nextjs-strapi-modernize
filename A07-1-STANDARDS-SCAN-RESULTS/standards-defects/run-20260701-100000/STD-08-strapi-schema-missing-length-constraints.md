---
defect_id: STD-08
title: "Strapi case-study/global schemas lack maxLength constraints on string/text fields"
type: standards
severity: Low
priority: P3
status: Open
rule_ids: ["CMS-02"]
category: "content model / data validation"
component: "apps/cms/src/api"
scan_run: run-20260701-100000
detected_date: 2026-07-01
detected_by: "Standards Enforcer agent (#7)"
assignee: "CMS Engineer"
labels: ["standards", "strapi", "validation", "low"]
affected_files:
  - "apps/cms/src/api/case-study/content-types/case-study/schema.json"
  - "apps/cms/src/api/global/content-types/global/schema.json"
epic_link: "EP-23 — CMS Platform, SEO, Redirects, Analytics & Hosting"
fix_within: "before content editors start authoring real entries"
related: []
---

# [STD-08] Strapi schemas lack `maxLength` constraints on string/text fields

## 1. Summary
`apps/cms/src/api/case-study/content-types/case-study/schema.json` declares `title`, `client`,
`industry`, and `image` as bare `{"type": "string"}` (or `{"type": "string", "required": true}` for
`title`), with no `maxLength`. `summary` is `{"type": "text"}`, also unconstrained. The `global`
schema follows the same pattern for its address/contact string fields.

## 2. Severity & rule mapping
**Severity: Low.** Strapi will accept arbitrarily long values for any of these today; nothing breaks
immediately, but the lift-and-shift CSS strategy (ADR-004) reuses legacy Themeholy layout assumptions
that were tuned for realistic legacy content lengths — an editor pasting an unusually long `title` or
`client` name has no schema-level guardrail before it visually breaks a card layout.

## 3. Exact locations & evidence
```json
"title": { "type": "string", "required": true },
"client": { "type": "string" },
"industry": { "type": "string" },
"image": { "type": "string" },
"summary": { "type": "text" }
```
(`apps/cms/src/api/case-study/content-types/case-study/schema.json:15-26`)

## 4. Why it matters
This is exactly the class of gap CMS-02 exists to catch — Strapi's admin UI will happily let a
Content Editor type a 500-character `title` into a card designed around the legacy site's ~40-character
titles, with no warning until someone notices the rendered page looks broken.

## 5. Recommendation
```json
"title": { "type": "string", "required": true, "maxLength": 120 },
"client": { "type": "string", "maxLength": 80 },
"industry": { "type": "string", "maxLength": 80 },
"summary": { "type": "text", "maxLength": 400 }
```
Pick exact limits from the legacy `TDWebsite` case-study page markup's realistic content lengths, not
arbitrary round numbers — the Content Migrator agent's ETL output (`packages/seed`) is the fastest way
to sample real-world lengths once it exists.

## 6. Acceptance criteria
- [ ] `title`, `client`, `industry`, `summary` (and the `global` schema's equivalent string fields)
      carry explicit, content-informed `maxLength` values.
- [ ] Existing seeded/test content (if any) still validates against the new constraints.
- [ ] No relation/component structure changes — this is an attribute-level addition only.

## 7. References
- Coding-standards profile CMS-02.
- ADR-004 (lift-and-shift CSS strategy) — the reason length matters for layout, not just data hygiene.
