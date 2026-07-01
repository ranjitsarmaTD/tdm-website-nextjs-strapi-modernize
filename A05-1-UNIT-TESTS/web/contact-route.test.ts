/**
 * POST /api/contact — EP-18-S2/S3/S4 acceptance criteria.
 *
 * Verifies: a valid payload is forwarded to Strapi's contact-submission
 * create endpoint with the legacy `subject` field renamed to `company`;
 * missing/malformed required fields are rejected with a 400 before any
 * Strapi call is made; a populated honeypot short-circuits to a
 * success-shaped response with no Strapi write; a failed Resend call never
 * affects the response already returned to the visitor. Illustrative
 * coverage of the skeleton route, not the full EP-18 story surface — real
 * Turnstile verification is explicitly deferred (EP-18-S5).
 *
 * Runner: Vitest. Source under test: apps/web/app/api/contact/route.ts.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../../apps/web/app/api/contact/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { id: 1 } }) })
    );
    delete process.env.RESEND_API_KEY;
  });

  it("persists a valid submission and maps subject -> company (happy path)", async () => {
    const res = await POST(
      makeRequest({ name: "Jane Doe", email: "jane@example.com", message: "Hello", company: "Acme" })
    );
    expect(res.status).toBe(201);

    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toContain("/api/contact-submissions");
    const sentBody = JSON.parse((call[1] as RequestInit).body as string);
    expect(sentBody.data.company).toBe("Acme");
  });

  it("rejects a missing message field with 400 and never calls Strapi (edge/boundary)", async () => {
    const res = await POST(makeRequest({ name: "Jane Doe", email: "jane@example.com" }));
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a malformed email with 400 (failure/error)", async () => {
    const res = await POST(
      makeRequest({ name: "Jane Doe", email: "not-an-email", message: "Hello" })
    );
    expect(res.status).toBe(400);
  });

  it("silently drops a honeypot-populated submission without calling Strapi", async () => {
    const res = await POST(
      makeRequest({ name: "Bot", email: "bot@example.com", message: "spam", honeypot: "filled" })
    );
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("still returns 201 when the best-effort Resend notification fails (EP-18-S4)", async () => {
    process.env.RESEND_API_KEY = "test-key";
    (fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) }) // Strapi write
      .mockRejectedValueOnce(new Error("resend down")); // notification

    const res = await POST(
      makeRequest({ name: "Jane Doe", email: "jane@example.com", message: "Hello" })
    );
    expect(res.status).toBe(201);
  });
});
