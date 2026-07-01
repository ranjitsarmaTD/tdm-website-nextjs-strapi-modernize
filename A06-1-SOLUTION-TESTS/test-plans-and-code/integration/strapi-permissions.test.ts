/**
 * strapi-permissions.test.ts
 *
 * Illustrative REST-client integration coverage for the Strapi Public-role
 * permission matrix. Mirrors acceptance criteria from
 * A01-2-REQUIREMENTS/09-cms-seo-and-platform.md:
 *
 *   - EP-23-S2 "Happy path"        — anonymous GET on a published entry succeeds.
 *   - EP-23-S2 "Failure/error"     — anonymous GET on a draft entry is rejected (404).
 *   - EP-23-S2 "Edge/boundary"     — the `global` single type exposes only `find`.
 *   - EP-23-S3 "Happy path"        — anonymous POST creates a contact-submission.
 *   - EP-23-S3 "Failure/error"     — anonymous GET/PUT/DELETE on contact-submission
 *                                    are all rejected (403).
 *   - EP-23-S3 "Edge/boundary"     — no content type anywhere grants Public
 *                                    update or delete.
 *
 * NOT YET EXECUTED against a live Strapi instance — see
 * testing-results/run-20260701-090000/campaign-report.md. Requires a running
 * apps/cms (default http://localhost:1337) with the 8 content types from
 * EP-23-S1 registered, at least one published + one draft entry per
 * read-oriented type, and an admin/API token available ONLY for this test
 * file's setup/teardown fixtures (never used for the assertions themselves,
 * which must run fully unauthenticated to match the Public role under test).
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL ?? "http://localhost:1337";
const ADMIN_API_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN; // setup/teardown only, never used for assertions

const READ_ORIENTED_TYPES = [
  "case-studies",
  "news-articles",
  "services",
  "team-members",
  "partners",
  "testimonials",
] as const;

const ALL_CONTENT_TYPES = [...READ_ORIENTED_TYPES, "global", "contact-submissions"] as const;

async function anonymousRequest(path: string, init?: RequestInit) {
  return fetch(`${STRAPI_BASE_URL}/api/${path}`, init);
}

async function adminSeedEntry(collection: string, data: Record<string, unknown>, published: boolean) {
  const res = await fetch(`${STRAPI_BASE_URL}/api/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_API_TOKEN}`,
    },
    body: JSON.stringify({ data: { ...data, publishedAt: published ? new Date().toISOString() : null } }),
  });
  const body = await res.json();
  return body?.data;
}

let publishedCaseStudy: { id: number; attributes: { slug: string } } | undefined;
let draftNewsArticle: { id: number; attributes: { slug: string } } | undefined;
let seededContactSubmissionId: number | undefined;

beforeAll(async () => {
  if (!ADMIN_API_TOKEN) return; // fixtures skipped when no live target is configured; see campaign report
  publishedCaseStudy = await adminSeedEntry(
    "case-studies",
    { title: "Permission Test Case Study", summary: "fixture" },
    true
  );
  draftNewsArticle = await adminSeedEntry(
    "news-articles",
    { title: "Permission Test Draft Article", excerpt: "fixture" },
    false
  );
});

afterAll(async () => {
  if (!ADMIN_API_TOKEN) return;
  // Teardown intentionally omitted from this illustrative pass — a real run
  // would delete publishedCaseStudy / draftNewsArticle / any seeded
  // contact-submission via the admin token here.
});

describe("EP-23-S2 — Public role read access to published entries", () => {
  it("GET on a published case-study succeeds anonymously (happy path)", async () => {
    expect(publishedCaseStudy, "requires STRAPI_ADMIN_API_TOKEN + live apps/cms").toBeDefined();
    const res = await anonymousRequest(`case-studies/${publishedCaseStudy!.attributes.slug}`);
    expect(res.status).toBe(200);
  });

  it("GET on a draft news-article is rejected as not found (failure/error)", async () => {
    expect(draftNewsArticle, "requires STRAPI_ADMIN_API_TOKEN + live apps/cms").toBeDefined();
    const res = await anonymousRequest(`news-articles/${draftNewsArticle!.attributes.slug}`);
    expect(res.status).toBe(404);
  });

  it("the global single type is readable anonymously via find only (edge/boundary)", async () => {
    const res = await anonymousRequest("global");
    expect(res.status).toBe(200);
    // Strapi singleTypes expose exactly one collection-level route ("find");
    // there is no findOne/:id route to probe for a single type.
    const notFoundOnId = await anonymousRequest("global/1");
    expect(notFoundOnId.status).not.toBe(200);
  });
});

describe("EP-23-S3 — Public role is create-only on contact-submission; no update/delete anywhere", () => {
  it("anonymous POST creates a contact-submission entry (happy path)", async () => {
    const res = await anonymousRequest("contact-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          name: "Integration Test",
          email: "integration-test@example.invalid",
          message: "Automated integration test submission.",
        },
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    seededContactSubmissionId = body?.data?.id;
    expect(seededContactSubmissionId).toBeDefined();
  });

  it("anonymous GET, PUT, and DELETE on contact-submission are all rejected (failure/error)", async () => {
    const getRes = await anonymousRequest("contact-submissions");
    expect(getRes.status).toBe(403);

    if (seededContactSubmissionId) {
      const putRes = await anonymousRequest(`contact-submissions/${seededContactSubmissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { name: "Tampered" } }),
      });
      expect(putRes.status).toBe(403);

      const deleteRes = await anonymousRequest(`contact-submissions/${seededContactSubmissionId}`, {
        method: "DELETE",
      });
      expect(deleteRes.status).toBe(403);
    }
  });

  it("no content type in the schema grants Public update or delete (edge/boundary)", async () => {
    for (const type of ALL_CONTENT_TYPES) {
      const putRes = await anonymousRequest(`${type}/1`, { method: "PUT" });
      const deleteRes = await anonymousRequest(`${type}/1`, { method: "DELETE" });
      expect([401, 403]).toContain(putRes.status);
      expect([401, 403]).toContain(deleteRes.status);
    }
  });
});
