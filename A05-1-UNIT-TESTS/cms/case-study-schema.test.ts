import { describe, it, expect } from "vitest";
import schema from "../../apps/cms/src/api/case-study/content-types/case-study/schema.json";

describe("case-study content-type schema — EP-23-S1", () => {
  it("is a collectionType with draftAndPublish enabled (EP-23-S4)", () => {
    expect(schema.kind).toBe("collectionType");
    expect(schema.options.draftAndPublish).toBe(true);
  });

  it("requires title and derives a unique uid slug from it", () => {
    expect(schema.attributes.title).toMatchObject({ type: "string", required: true });
    expect(schema.attributes.slug).toMatchObject({ type: "uid", targetField: "title" });
  });

  it("matches the ER model in requirements §5 (client, industry, richtext body, order, featured)", () => {
    expect(schema.attributes.client.type).toBe("string");
    expect(schema.attributes.industry.type).toBe("string");
    expect(schema.attributes.body.type).toBe("richtext");
    expect(schema.attributes.order.type).toBe("integer");
    expect(schema.attributes.featured.type).toBe("boolean");
  });

  it("nests exactly one shared.seo component, wired for EP-24-S1's generateMetadata story", () => {
    expect(schema.attributes.seo).toMatchObject({
      type: "component",
      repeatable: false,
      component: "shared.seo",
    });
  });
});
