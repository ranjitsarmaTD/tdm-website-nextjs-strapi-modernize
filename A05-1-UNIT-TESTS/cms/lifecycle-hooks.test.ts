import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import strapiBootstrap from "../../apps/cms/src/index";

type Handler = (event: { model: { uid: string }; action: string; result?: { slug?: string } }) => void;

function bootWithCapturedHandler(): Handler {
  let captured: Handler = () => {};
  const strapi = {
    db: {
      lifecycles: {
        subscribe: (handler: Handler) => {
          captured = handler;
        },
      },
    },
  };
  strapiBootstrap.bootstrap({ strapi });
  return captured;
}

describe("apps/cms/src/index.ts lifecycle hook — EP-26-S2", () => {
  const originalFetch = global.fetch;
  const originalSecret = process.env.STRAPI_REVALIDATE_SECRET;

  beforeEach(() => {
    process.env.STRAPI_REVALIDATE_SECRET = "test-secret";
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.STRAPI_REVALIDATE_SECRET = originalSecret;
  });

  it("happy path — publishing a case-study fires the revalidate webhook with the correct payload", async () => {
    const handler = bootWithCapturedHandler();
    handler({ model: { uid: "api::case-study.case-study" }, action: "afterCreate", result: { slug: "acme-corp" } });
    await new Promise((r) => setTimeout(r, 0));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/revalidate"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-revalidate-secret": "test-secret" }),
        body: JSON.stringify({ contentType: "case-study", slug: "acme-corp" }),
      })
    );
  });

  it("failure/error — a rejected webhook call does not throw or block the caller", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const handler = bootWithCapturedHandler();

    expect(() =>
      handler({ model: { uid: "api::testimonial.testimonial" }, action: "afterDelete", result: { slug: "acme" } })
    ).not.toThrow();
  });

  it("edge/boundary — contact-submission is explicitly excluded from the lifecycle subscription", async () => {
    const handler = bootWithCapturedHandler();
    handler({ model: { uid: "api::contact-submission.contact-submission" }, action: "afterCreate", result: {} });
    await new Promise((r) => setTimeout(r, 0));

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
