# PROJECT.md — TrieDatum Website Modernization (target project config)

Configuration consumed by the Developer agent for this target project.

```json
{
  "name": "tdm-website-nextjs-strapi-modernize",
  "description": "TrieDatum marketing website modernized from a static Bootstrap/jQuery HTML site to a Next.js 14 + Strapi v5 + PostgreSQL headless-CMS monorepo",
  "stack": {
    "web": "Next.js 14 (App Router) + TypeScript, SSG + ISR, deployed as a PM2 fork-mode process behind Nginx",
    "cms": "Strapi v5 (TypeScript) + PostgreSQL, deployed as an independently-installed (non-hoisted) PM2 fork-mode process"
  },
  "test_command": {
    "web_unit": "npm run test --workspace web",
    "cms_unit": "npm --prefix apps/cms run test",
    "solution": "see A06-1-SOLUTION-TESTS/test-plans-and-code (not yet executable — no live environment)"
  },
  "format_command": {
    "all": "npm run format --workspaces --if-present"
  },
  "coverage_target": 80,
  "ticketing": { "type": "filesystem" },
  "secrets": {
    "backend": "env",
    "required": ["STRAPI_REVALIDATE_SECRET", "DATABASE_URL", "STRAPI_API_TOKEN"],
    "notes": "Never hardcode. STRAPI_REVALIDATE_SECRET gates POST /api/revalidate (EP-26-S1); DATABASE_URL is Strapi's PostgreSQL connection string (EP-27-S3)."
  },
  "hosting": {
    "target": "single Hostinger VPS",
    "topology": "Nginx reverse proxy -> PM2 fork-mode (apps/web :3000, apps/cms :1337) -> PostgreSQL",
    "not_yet_active": ["infra/github/deploy.yml (designed, per EP-27-S5, not copied into .github/workflows/)"]
  }
}
```

## Source-of-truth documents

| Area | Folder |
|---|---|
| Requirements (27 epics / 80 stories) | [`A01-2-REQUIREMENTS/`](A01-2-REQUIREMENTS/) |
| Test strategy & plans | [`A02-2-TEST-STRATEGY/`](A02-2-TEST-STRATEGY/) |
| Solution architecture + ADRs | [`A04-2-SOLUTION-ARCHITECTURE/`](A04-2-SOLUTION-ARCHITECTURE/) |
| Implementation (lean skeleton) | [`apps/`](apps/), [`packages/`](packages/) |
| Unit tests, results | [`A05-1-UNIT-TESTS/`](A05-1-UNIT-TESTS/) |
| Solution-level test plans & results | [`A06-1-SOLUTION-TESTS/`](A06-1-SOLUTION-TESTS/) |
| Standards scan results | [`A07-1-STANDARDS-SCAN-RESULTS/`](A07-1-STANDARDS-SCAN-RESULTS/) |
| Security scan results | [`A08-1-SECURITY-SCAN-RESULTS/`](A08-1-SECURITY-SCAN-RESULTS/) |
| Solution documentation & runbooks | [`A10-1-SOLUTION-DOCUMENTATION/`](A10-1-SOLUTION-DOCUMENTATION/) |
| Cross-check of actual implementation status | [`IMPLEMENTATION-CROSSCHECK.md`](IMPLEMENTATION-CROSSCHECK.md) |

## Build sequencing

Critical-path-first, per `A02-2-TEST-STRATEGY/TS-000-master-test-strategy.md` §5 and
the P1 priority baseline in `A01-2-REQUIREMENTS/00-overview-and-architecture.md` §8:
content modeling & permissions (EP-23) → global shell/nav/footer (EP-01/EP-02) →
homepage P1 sections (EP-04–EP-11 subset) → contact & lead capture (EP-18/EP-19) →
SEO/redirects (EP-24) → hosting & deploy (EP-27). Then outward to about/services/
bootcamp/partnership/news/case-studies/testimonials (EP-03, EP-12–EP-17, EP-20–EP-22),
analytics/structured data (EP-25), and the on-demand revalidation webhook (EP-26) once
enough content types exist to make it meaningful.
