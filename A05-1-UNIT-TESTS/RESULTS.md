# A05 — Unit Test Results

> **Status: written, not executed.** No `node_modules` has been installed in this
> scaffold and no test runner has actually been invoked. The counts below are the
> test cases as authored, not a passing CI run. This must not be reported as "tests
> passing" until `npm install && npm run test` has genuinely been run — see the
> `EP-27-S5` precedent in the requirements for why this project treats "designed but
> not yet executed" as a distinct, honestly-labeled state from "done."

## Test case count (as authored)

| File | Cases |
|---|---|
| `web/site-header.test.tsx` | 3 |
| `web/site-footer.test.tsx` | 3 |
| `web/contact-route.test.ts` | 3 |
| `web/revalidate-route.test.ts` | 3 |
| `cms/global-schema.test.ts` | 5 |
| `cms/case-study-schema.test.ts` | 4 |
| `cms/lifecycle-hooks.test.ts` | 3 |
| **Total** | **24** |

## Coverage against the requirements surface

24 test cases cover the 6 skeleton components/routes listed in `README.md`, which
implement a slice of 4 of the 27 Epics (EP-02, EP-18, EP-23, EP-26). The remaining 23
Epics have acceptance criteria specified in `A01-2-REQUIREMENTS` and (where already
written) architectural components in `A04-2-SOLUTION-ARCHITECTURE`, but no
implementation or tests yet — that is real, outstanding work for a future
implementation pass, not a gap this document should paper over.

## Next steps to make this a real, executable result

1. `npm install` at the repo root (resolve the `apps/cms` hoist-exclusion from
   ADR-005 first).
2. Wire an actual `vitest.config.ts` per workspace.
3. Run `npm run test` and replace this file's "as authored" count with real
   pass/fail/coverage-% numbers.
