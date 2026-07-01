# Campaign Report — run-20260701-090000

**Campaign:** [`TP-000-master-campaign-plan`](../../test-plans-and-code/plans/TP-000-master-campaign-plan.md)
**Environment:** none — no `apps/web` or `apps/cms` instance has been started in this environment.

## Honest status

This is a **first, pre-implementation planning pass**, not a launch-verification run.
5 solution-level specs exist (3 Playwright e2e, 2 integration) covering scenarios
drawn directly from the Gherkin acceptance criteria already written in
`A01-2-REQUIREMENTS` (contact form happy/failure/edge cases from EP-18/19, Strapi
Public-role permission boundaries from EP-23-S2/S3, revalidation webhook auth from
EP-26-S1). **None have been executed against a live environment** — there is no
running Next.js server, no running Strapi instance, and no seeded PostgreSQL database
in this scaffold yet.

| Spec | Status |
|---|---|
| `e2e/homepage.spec.ts` | Blocked — no running `apps/web` |
| `e2e/contact-form.spec.ts` | Blocked — no running `apps/web` |
| `e2e/case-study-journey.spec.ts` | Blocked — no running `apps/web` + `apps/cms` |
| `integration/strapi-permissions.test.ts` | Blocked — no running `apps/cms` / seeded DB |
| `integration/revalidate-webhook.test.ts` | Blocked — no running `apps/web` to receive the webhook |

**0 pass / 0 fail / 5 blocked.** This must not be reported as "solution tests passing"
— per the same honesty principle the requirements already apply to `EP-27-S5`
(designed-but-not-yet-active CI/CD), a planned-but-not-executed test suite is a
distinct, correctly-labeled state, not a completed gate.

## Next steps

1. Stand up `apps/web` (`npm run dev`) and `apps/cms` (`npm run develop`) against a
   local PostgreSQL instance per `A10-1-SOLUTION-DOCUMENTATION/06-runbook-deployment.md`.
2. Seed the database (`packages/seed`, once implemented) with the fixture content the
   specs assume (a published case study, a `global` entry, etc.).
3. Re-run this campaign and replace this report with real pass/fail results before
   any Story is marked done against the Definition-of-Done's "acceptance criteria
   pass in a local/staging environment" gate.
