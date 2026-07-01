import { describe, it, expect } from "vitest";
import schema from "../../apps/cms/src/api/global/content-types/global/schema.json";

describe("global content-type schema — EP-23-S1", () => {
  it("is a singleType, per requirements §EP-23-S1 (exactly one entry, never zero or many)", () => {
    expect(schema.kind).toBe("singleType");
  });

  it("has draftAndPublish enabled, per EP-23-S4", () => {
    expect(schema.options.draftAndPublish).toBe(true);
  });

  it("carries every field footer_content.json held, per EP-02-S1's success metric (no data loss)", () => {
    const required = ["siteName", "usAddress", "indiaAddress", "email", "phone", "footerLinks", "social"];
    for (const field of required) {
      expect(schema.attributes).toHaveProperty(field);
    }
  });

  it("nests footerLinks as a repeatable shared.link component", () => {
    expect(schema.attributes.footerLinks).toMatchObject({
      type: "component",
      repeatable: true,
      component: "shared.link",
    });
  });

  it("nests social as a repeatable shared.social-link component", () => {
    expect(schema.attributes.social).toMatchObject({
      type: "component",
      repeatable: true,
      component: "shared.social-link",
    });
  });
});
