# SEC-04 — Contact form lacks real bot/spam gate beyond honeypot — NO FIX NEEDED (TRACKED)

**Severity:** Medium · **Status:** No code fix required — already correctly accepted/tracked

## Why no fix was applied

`A01-2-REQUIREMENTS/07-contact-and-lead-capture.md` (EP-18-S5) already scopes real bot protection
(Cloudflare Turnstile) as an intentionally deferred P4 story, with its own acceptance criteria
covering exactly this residual-risk scenario. This defect exists to independently confirm that
deferral is a real, current exposure worth tracking at launch time — not to demand a fix that would
contradict the project's own already-made P4 scoping decision.

## What "closing" this defect actually means

Not a code change here. It means:
1. Adding this specific risk to a launch-readiness checklist so it's a conscious go/no-go item, not
   an implicit re-acceptance by omission.
2. When EP-18-S5 is eventually picked up (Turnstile integration), this defect can be marked resolved
   by that story's own completion — no separate remediation path exists or is needed.

## Verification

- [ ] Launch-readiness checklist explicitly lists "honeypot-only spam protection, Turnstile
      deferred to EP-18-S5" as a reviewed, accepted item — not silently absent from the checklist.
