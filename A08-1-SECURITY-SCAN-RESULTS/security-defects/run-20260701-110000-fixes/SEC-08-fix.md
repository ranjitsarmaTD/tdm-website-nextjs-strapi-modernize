# SEC-08 — No `.env.example` committed — DOCUMENTED ONLY

**Severity:** Low · **Status:** Documented only — not applied

## Why not applied

This is the smallest, fastest fix in this run (adding one new file at the repo root), but it still
falls outside `A08-1-SECURITY-SCAN-RESULTS/`, the only folder this task was scoped to touch — so it
is documented here rather than created directly.

## Fix to apply (follow-on task)

Add `.env.example` at the repo root:

```
# apps/web
STRAPI_URL=http://localhost:1337
NEXT_WEB_URL=http://localhost:3000
STRAPI_REVALIDATE_SECRET=
RESEND_API_KEY=
TURNSTILE_SITE_KEY=        # provisioned, not yet integrated — see EP-18-S5
TURNSTILE_SECRET_KEY=      # provisioned, not yet integrated — see EP-18-S5

# apps/cms
DATABASE_CLIENT=postgres
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
```

Confirm `.gitignore` already excludes `.env`/`.env.local` (add if missing) so the template and the
guard against committing real values ship together.

## Verification (once applied)

- [ ] `.env.example` exists at repo root with every variable referenced in code/requirements today.
- [ ] `.gitignore` excludes real `.env` files.
- [ ] EP-18-S5's acceptance criterion ("Turnstile variables present and documented in `.env.example`")
      is now satisfiable.
