# TS-011 — Cross-Cutting Strategy: Security & Privacy

> **Inherits:** [TS-000 Master Strategy](TS-000-master-test-strategy.md) §4 ("Security / permission tests"), §7 (Public-permission audit gate).
> **Requirements source:** [`09-cms-seo-and-platform.md`](../A01-2-REQUIREMENTS/09-cms-seo-and-platform.md) EP-23-S2/S3/S4 (Public-role permissions), EP-26-S1 (revalidate-secret gating); [`07-contact-and-lead-capture.md`](../A01-2-REQUIREMENTS/07-contact-and-lead-capture.md) EP-18 (contact form). Functional (non-security) behavior for these same stories is owned by [TS-007](TS-007-contact-and-lead-capture.md) and [TS-009](TS-009-cms-seo-and-platform.md) — this plan owns the **exhaustive deny/allow enumeration and adversarial scenarios**, asserted once, here, per TS-000 §9's "don't duplicate the same assertion at every layer" rule.
> **Why this plan exists as its own document:** the requirements' own hard rule — "no content type ever grants Public `update`/`delete`; `contact-submission` is the only public write path and it is create-only" — is a security invariant that must be independently, exhaustively verifiable, not incidentally true because no story happened to test the missing case.
> **Risk tier:** Tier 1 (TS-000 §5 places "Strapi schema/permissions EP-23" at the top of the risk heat map).

---

## 1. Public-role permission matrix (exhaustive)

The single source of truth this plan tests against — any deviation from this table, in either direction (too wide *or* accidentally too narrow), is a defect:

| Content type | `find` | `findOne` | `create` | `update` | `delete` |
|---|---|---|---|---|---|
| `global` (singleType) | ✅ | n/a (singleType has no `findOne`) | ❌ | ❌ | ❌ |
| `case-study` | ✅ (published only) | ✅ (published only) | ❌ | ❌ | ❌ |
| `news-article` | ✅ (published only) | ✅ (published only) | ❌ | ❌ | ❌ |
| `service` | ✅ (published only) | ✅ (published only) | ❌ | ❌ | ❌ |
| `team-member` | ✅ (published only) | ✅ (published only) | ❌ | ❌ | ❌ |
| `partner` | ✅ (published only) | ✅ (published only) | ❌ | ❌ | ❌ |
| `testimonial` | ✅ (published only) | ✅ (published only) | ❌ | ❌ | ❌ |
| `contact-submission` | ❌ | ❌ | ✅ | ❌ | ❌ |

**Invariants asserted by this matrix, independent of any single row:**
- Exactly one content type (`contact-submission`) grants any public write action, and that action is exactly `create`.
- No content type, including `contact-submission` itself, ever grants `update` or `delete` to Public — read access never implies write access, and this is checked even for rows that are all-`❌` (a row can't "drift" into an unintended grant unnoticed).
- Draft-state entries are unreachable by `find`/`findOne` for every collection type that has `draftAndPublish` enabled (EP-23-S4, TS-009 §3).

## 2. Test matrix — permission matrix (EP-23-S2/S3/S4)

| Scenario | Layer | Assertion |
|---|---|---|
| Happy — anonymous read on published entry | I | `GET` on each of `case-study`, `news-article`, `service`, `team-member`, `partner`, `testimonial` (`find` and `findOne`) and `global` (`find` only) succeeds 200 for a published entry, run once per type as a parametrized suite — not six hand-copied near-duplicate tests. |
| Failure — anonymous read on draft entry | I | `GET` `findOne` on a draft-state entry for each of the 6 collection types responds 404, never 200 with a "draft" flag exposed. |
| Failure — anonymous write anywhere except `create` on `contact-submission` | SEC | A parametrized sweep: for **every** content type × {`create`, `update`, `delete`} except `(contact-submission, create)`, the anonymous request responds 403/404 (Strapi's standard unauthorized shape), never 200/201. This is the matrix's core adversarial assertion — one test loop over the full cross-product, not spot checks. |
| Failure — anonymous read on `contact-submission` | SEC | `GET`/`findOne` on `contact-submission` responds 403/404 for an unauthenticated client, confirming submissions are write-only from the anonymous side (no way to enumerate or scrape other visitors' submitted contact data). |
| Edge — a future content type added without an explicit permission decision | SEC | A newly scaffolded content type defaults to **no** Public grants until a CMS Engineer explicitly configures it (Strapi's own default-deny behavior) — asserted as a regression guard so the matrix in §1 can't silently grow a 9th row with an unreviewed grant. |
| Edge — `draftAndPublish`-disabled `contact-submission` has no draft/published distinction to leak | I | Because `contact-submission` has `draftAndPublish` OFF by design (EP-23-S4), there is no draft-state variant to accidentally expose — this is asserted as a configuration check (the toggle is off), not a runtime behavior test, since there's nothing to run against. |

## 3. Contact-form and revalidate-webhook security scenarios

These are the security-specific slices of EP-18 and EP-26-S1; their functional counterparts (field mapping, success-shaped responses, path-mapping correctness) are owned by TS-007 §3 and TS-009 §3 respectively and are not re-asserted here.

| Scenario | Layer | Assertion |
|---|---|---|
| Honeypot-populated request never reaches Strapi | SEC | A `POST /api/contact` with the honeypot field populated results in **zero** `contact-submission` writes and a success-shaped response (never revealing the anti-spam mechanism to the calling bot) — the server, not the client, owns this rejection (cross-ref TS-007 §3 EP-18-S3). |
| Malformed/spoofed payload rejected server-side even if client checks are bypassed | SEC | A direct `POST /api/contact` (bypassing the browser entirely) with a missing `message` or malformed `email` is rejected 400-level with no Strapi write — proving server-side validation is not merely a UX nicety layered on top of client-side checks. |
| Unauthenticated direct Strapi write attempt bypassing `apps/web`'s API route | SEC | A `POST` directly to Strapi's `/api/contact-submissions` REST endpoint (skipping `apps/web/app/api/contact/route.ts` entirely) still only succeeds via the Public role's `create` grant and is still subject to Strapi's own field-level validation — this proves the security boundary is Strapi's permission system, not merely `apps/web`'s route handler, since a determined caller can always skip the Next.js layer. |
| Injection-style payloads in free-text fields | SEC | `message`/`name`/`company` fields containing script tags or SQL-metacharacter-like strings are persisted as literal text (Strapi's ORM parameterizes queries) and rendered escaped wherever an admin views them in the Strapi admin panel — never executed or interpreted. |
| Revalidate endpoint: missing/incorrect secret | SEC | `POST /api/revalidate` with no secret header, or an incorrect value, responds 401 and performs **no** revalidation call, regardless of whether the request body's `contentType`/`slug` are otherwise well-formed (cross-ref TS-009 §3 EP-26-S1's functional path-mapping test, not re-asserted here). |
| Revalidate endpoint: secret comparison is not shortcut-able | SEC | The secret comparison uses a constant-time or otherwise non-early-exit comparison approach (or is at minimum reviewed for this property) so response-timing cannot be used to brute-force the secret byte-by-byte — a review checklist item, not necessarily an automatable timing test at this stage. |
| Revalidate endpoint is not discoverable/guessable as a general-purpose cache-buster | SEC | The endpoint requires both a correct secret **and** a recognized `contentType`, so it cannot be used by an outside caller who has somehow guessed or leaked the secret to revalidate arbitrary, unrelated paths outside the content-type-to-path mapping (EP-26-S1's own AC already scopes this — asserted here as the security framing of that same constraint). |

## 4. Assumptions & residual risk (documented, not silently accepted)

| Item | Status |
|---|---|
| Cloudflare Turnstile bot protection is deferred (P4); honeypot is the only active anti-spam control at launch | Documented residual risk per EP-18-S5 (TS-007 §3) — this plan's honeypot scenarios above are the extent of pre-launch spam-defense verification; a sophisticated scripted bot that fills every visible field correctly *and* leaves the honeypot untouched is an accepted gap, not a test failure. |
| No rate-limiting story is currently specified for `POST /api/contact` or `POST /api/revalidate` | Flagged here as an open item for the engineering agents to raise as a follow-on story if abuse is observed post-launch — this plan does not invent a rate-limit requirement the analyst-authored requirements set does not specify, per this document set's own scope discipline. |
| API token lifecycle management (rotation, scoping beyond `Public`) is explicitly out of scope for EP-23 (per its own "Out of scope" note) | Not tested here; owned by EP-27's deployment documentation per the requirements' own carve-out. |

## 5. Traceability stub (rolls up to TS-COVERAGE)

| Story | Covered by |
|---|---|
| EP-23-S2 | exhaustive Public read-grant matrix (§1–§2) |
| EP-23-S3 | exhaustive Public create-only / no-update-delete matrix (§1–§2), including the anonymous-read-on-contact-submission denial |
| EP-23-S4 | draft/publish permission-boundary check (§2) |
| EP-18-S2/S3 | honeypot server-side enforcement + injection-safety (§3) — functional scenarios cross-ref TS-007 §3 |
| EP-26-S1 | revalidate secret-gating adversarial scenarios (§3) — functional path-mapping cross-ref TS-009 §3 |
