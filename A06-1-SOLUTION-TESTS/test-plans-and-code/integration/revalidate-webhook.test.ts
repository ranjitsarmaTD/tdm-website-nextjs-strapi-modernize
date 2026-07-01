/**
 * revalidate-webhook.test.ts
 *
 * Illustrative REST-client integration coverage for the on-demand ISR
 * revalidation webhook. Mirrors acceptance criteria from
 * A01-2-REQUIREMENTS/09-cms-seo-and-platform.md:
 *
 *   - EP-26-S1 "Happy path"     — a correctly authenticated request revalidates
 *                                  the right path(s).
 *   - EP-26-S1 "Failure/error"  — a missing/incorrect secret header is rejected (401).
 *   - EP-26-S1 "Edge/boundary"  — an unrecognized contentType is a clean 400,
 *                                  never an unhandled exception.
 *   - EP-26-S2 "Happy path"     — publishing a case study in Strapi triggers a
 *                                  webhook POST to apps/web's /api/revalidate.
 *   - EP-26-S2 "Failure/error"  — the webhook call failing does not roll back
 *                                  or block the underlying Strapi write.
 *   - EP-26-S2 "Edge/boundary"  — deleting an entry fires the same webhook
 *                                  pattern as create/update.
 *
 * NOT YET EXECUTED against a live environment — see
 * testing-results/run-20260701-090000/campaign-report.md. The EP-26-S1 tests
 * target apps/web's POST /api/revalidate directly; the EP-26-S2 tests target
 * apps/cms directly and observe a local HTTP listener standing in for
 * apps/web, so this file exercises both ends of the same contract without
 * requiring the full stack to be up simultaneously.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";

const WEB_BASE_URL = process.env.WEB_BASE_URL ?? "http://localhost:3000";
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL ?? "http://localhost:1337";
const REVALIDATE_SECRET = process.env.STRAPI_REVALIDATE_SECRET ?? "test-only-secret-not-a-real-value";

describe("EP-26-S1 — POST /api/revalidate endpoint (apps/web)", () => {
  it("a correctly authenticated request revalidates the mapped path(s) (happy path)", async () => {
    const res = await fetch(`${WEB_BASE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": REVALIDATE_SECRET,
      },
      body: JSON.stringify({ contentType: "case-study", slug: "acme-corp" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.revalidated).toEqual(
      expect.arrayContaining([expect.stringContaining("/case-studies/acme-corp")])
    );
  });

  it("a missing or incorrect secret header is rejected (failure/error)", async () => {
    const noHeader = await fetch(`${WEB_BASE_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "case-study", slug: "acme-corp" }),
    });
    expect(noHeader.status).toBe(401);

    const wrongHeader = await fetch(`${WEB_BASE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": "clearly-wrong-secret",
      },
      body: JSON.stringify({ contentType: "case-study", slug: "acme-corp" }),
    });
    expect(wrongHeader.status).toBe(401);
  });

  it("an unrecognized contentType is a clean 400, never a 500 (edge/boundary)", async () => {
    const res = await fetch(`${WEB_BASE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": REVALIDATE_SECRET,
      },
      body: JSON.stringify({ contentType: "not-a-real-content-type", slug: "whatever" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/not-a-real-content-type/i);
  });
});

describe("EP-26-S2 — Strapi lifecycle hooks call the webhook best-effort", () => {
  let listener: http.Server;
  let receivedCalls: Array<{ headers: http.IncomingHttpHeaders; body: string }> = [];
  let listenerUrl: string;

  beforeEach(async () => {
    receivedCalls = [];
    listener = http.createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        receivedCalls.push({ headers: req.headers, body });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ revalidated: true }));
      });
    });
    await new Promise<void>((resolve) => listener.listen(0, resolve));
    const address = listener.address() as AddressInfo;
    listenerUrl = `http://127.0.0.1:${address.port}`;
    // In a real run, apps/cms's REVALIDATE_WEBHOOK_URL env var would be
    // pointed at `listenerUrl` for the duration of this test so the
    // lifecycle hook calls this stand-in instead of the real apps/web.
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => listener.close(() => resolve()));
  });

  it("publishing a case study triggers a webhook POST with the slug + secret header (happy path)", async () => {
    // Illustrative: assumes apps/cms is running with REVALIDATE_WEBHOOK_URL
    // pointed at listenerUrl (see beforeEach note) and an admin token is
    // available to publish an entry via the REST API.
    const adminToken = process.env.STRAPI_ADMIN_API_TOKEN;
    expect(adminToken, "requires STRAPI_ADMIN_API_TOKEN + live apps/cms pointed at the test listener").toBeDefined();

    await fetch(`${STRAPI_BASE_URL}/api/case-studies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        data: { title: "Webhook Test Case Study", publishedAt: new Date().toISOString() },
      }),
    });

    await new Promise((resolve) => setTimeout(resolve, 500)); // best-effort call is async/non-blocking

    expect(receivedCalls.length).toBeGreaterThan(0);
    const call = receivedCalls[0];
    expect(call.headers["x-revalidate-secret"]).toBe(REVALIDATE_SECRET);
    expect(call.body).toContain("case-study");
  });

  it("the webhook target being unreachable does not block or roll back the Strapi write (failure/error)", async () => {
    const adminToken = process.env.STRAPI_ADMIN_API_TOKEN;
    expect(adminToken, "requires STRAPI_ADMIN_API_TOKEN + live apps/cms").toBeDefined();

    // Point the webhook at a closed port to simulate apps/web being down.
    await listener.close();

    const res = await fetch(`${STRAPI_BASE_URL}/api/case-studies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        data: { title: "Webhook Failure Test Case Study", publishedAt: new Date().toISOString() },
      }),
    });

    // The Strapi write itself must still succeed even though the webhook
    // it fires afterward cannot be delivered.
    expect(res.status).toBe(200);
  });

  it("deleting an entry fires the same webhook call pattern as create/update (edge/boundary)", async () => {
    const adminToken = process.env.STRAPI_ADMIN_API_TOKEN;
    expect(adminToken, "requires STRAPI_ADMIN_API_TOKEN + live apps/cms pointed at the test listener").toBeDefined();

    const createRes = await fetch(`${STRAPI_BASE_URL}/api/testimonials`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        data: { authorName: "Webhook Delete Test", publishedAt: new Date().toISOString() },
      }),
    });
    const created = (await createRes.json())?.data;

    receivedCalls = []; // reset after the create-triggered call

    await fetch(`${STRAPI_BASE_URL}/api/testimonials/${created.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(receivedCalls.length).toBeGreaterThan(0);
    expect(receivedCalls[0].body).toContain("testimonial");
  });
});
