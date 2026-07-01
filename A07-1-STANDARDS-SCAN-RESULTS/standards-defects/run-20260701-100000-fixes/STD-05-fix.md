# STD-05 — Hardcoded notification recipient — 📋 DOCUMENTED ONLY, NOT APPLIED

**Status:** Not fixed in code. `apps/web/app/api/contact/route.ts` was not modified — an `apps/web`
change outside this run's scope.

## Recommended fix (ready to apply)
Read the recipient from `process.env.CONTACT_NOTIFICATION_EMAIL`, falling back to the current literal
`"contact@triedatum.com"` so unconfigured deployments behave identically to today. Exact diff in
[`../run-20260701-100000/STD-05-hardcoded-notification-recipient.md`](../run-20260701-100000/STD-05-hardcoded-notification-recipient.md)
§5.

## Next step
Small enough to bundle into whatever PR next touches `contact/route.ts`, or apply standalone — no
dependency on any other defect in this run except sharing STD-09's `.env.example` file once that
exists.

## Verification (not yet performed)
Not run. Once applied: confirm `notifyTeam()` still no-ops safely when `RESEND_API_KEY` is unset, and
sends to the env-configured address when both vars are set.
