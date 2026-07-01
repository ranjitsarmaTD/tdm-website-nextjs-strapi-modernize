# A05 — Unit Tests

Unit tests for the lean, representative code skeleton at the repo root (`apps/web/`,
`apps/cms/`, `packages/shared/`). This is **not** the full 80-story surface — it is a
Junior-Developer-agent-style first pass that stands up one vertical slice per major
platform capability so the acceptance criteria already written in
[`A01-2-REQUIREMENTS`](../A01-2-REQUIREMENTS/) have real code to test against, and so
`A06`/`A07`/`A08` have something concrete to exercise, lint and scan.

## What's covered

| Area | Source | Tests |
|---|---|---|
| Global site shell | `apps/web/components/layout/{SiteHeader,SiteFooter}.tsx` | `web/site-header.test.tsx`, `web/site-footer.test.tsx` |
| Contact form submission (EP-18/EP-19) | `apps/web/app/api/contact/route.ts` | `web/contact-route.test.ts` |
| On-demand revalidation webhook (EP-26-S1) | `apps/web/app/api/revalidate/route.ts` | `web/revalidate-route.test.ts` |
| Strapi `global` schema (EP-23-S1) | `apps/cms/src/api/global/content-types/global/schema.json` | `cms/global-schema.test.ts` |
| Strapi `case-study` schema (EP-23-S1) | `apps/cms/src/api/case-study/content-types/case-study/schema.json` | `cms/case-study-schema.test.ts` |
| Strapi lifecycle hook (EP-26-S2) | `apps/cms/src/index.ts` | `cms/lifecycle-hooks.test.ts` |

## What's intentionally not covered here

The remaining 6 content types (`news-article`, `service`, `team-member`, `partner`,
`testimonial`), the sitemap/robots/redirect routes (EP-24), analytics/JSON-LD (EP-25),
and every page route under `apps/web/app/` are specified in full in
`A01-2-REQUIREMENTS` and `A04-2-SOLUTION-ARCHITECTURE` but do not yet have a code
skeleton or tests — building them out is downstream implementation work, not part of
this scaffold pass. See `RESULTS.md` for the honest coverage accounting.

## Running

```bash
npm run test --workspace apps/web    # vitest, web/*
npm run test --workspace apps/cms    # vitest, cms/*
```

(Both `package.json`s declare a `vitest` test script; neither has been installed/run
in this environment — see `RESULTS.md`.)
