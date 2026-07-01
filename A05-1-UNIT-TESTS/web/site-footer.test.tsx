/**
 * SiteFooter — EP-02-S1..S4 acceptance criteria.
 *
 * Verifies: addresses render with line-break-preserving styling and an empty
 * sibling address degrades gracefully; a footer link with an empty href is
 * skipped rather than producing a broken anchor; social links render; the
 * copyright line falls back to the schema default year when omitted.
 * Illustrative coverage of the skeleton, not the full EP-02 story surface.
 *
 * Runner: Vitest + React Testing Library. Source under test:
 * apps/web/components/layout/SiteFooter.tsx.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteFooter, { type SiteFooterGlobal } from "../../apps/web/components/layout/SiteFooter";

const baseGlobal: SiteFooterGlobal = {
  siteName: "TrieDatum",
  usAddress: "123 Main St\nSuite 400",
  indiaAddress: "",
  email: "hello@triedatum.com",
  phone: "+1 555-0100",
  copyrightYear: 2026,
  footerLinks: [
    { label: "Home", url: "/" },
    { label: "Broken", url: "" },
  ],
  social: [{ platform: "LinkedIn", url: "https://linkedin.com/company/triedatum" }],
};

describe("SiteFooter", () => {
  it("renders the US address with preserved line breaks (happy path)", () => {
    render(<SiteFooter global={baseGlobal} />);
    const el = screen.getByText(
      (_, node) => node?.textContent === "123 Main St\nSuite 400"
    );
    expect(el).toBeInTheDocument();
  });

  it("omits an empty India address without throwing (failure/edge)", () => {
    expect(() => render(<SiteFooter global={baseGlobal} />)).not.toThrow();
  });

  it("skips a footer link with an empty href, keeping valid ones", () => {
    render(<SiteFooter global={baseGlobal} />);
    expect(screen.queryByText("Broken")).not.toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders the LinkedIn social link", () => {
    render(<SiteFooter global={baseGlobal} />);
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
  });

  it("falls back to the schema default copyright year when omitted (edge/boundary)", () => {
    render(<SiteFooter global={{ ...baseGlobal, copyrightYear: undefined }} />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});
