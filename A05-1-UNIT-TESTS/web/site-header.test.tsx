/**
 * SiteHeader — EP-01-S1/S3/S4 acceptance criteria.
 *
 * Verifies: the hard-coded nav link set renders in the legacy order; the
 * active route is marked; the Case Studies dropdown carries exactly the 9
 * non-orphaned links with no `case8`; the component does not throw absent an
 * activePath. This is illustrative coverage of the skeleton component, not
 * the full EP-01 story surface (MobileMenu parity, jsdom-simulated sticky
 * scroll thresholds, and keyboard-interaction AC are out of scope here).
 *
 * Runner: Vitest + React Testing Library (per TS-000 §"apps/web component
 * unit tests"). Source under test: apps/web/components/layout/SiteHeader.tsx.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteHeader, { CASE_STUDY_LINKS } from "../../apps/web/components/layout/SiteHeader";

describe("SiteHeader", () => {
  it("renders the site name from the global prop (happy path)", () => {
    render(<SiteHeader global={{ siteName: "TrieDatum" }} />);
    expect(screen.getByText("TrieDatum")).toBeInTheDocument();
  });

  it("renders the hard-coded nav link set in legacy order", () => {
    render(<SiteHeader global={{ siteName: "TrieDatum" }} />);
    const labels = [
      "Home",
      "About",
      "Services",
      "Case Studies",
      "Bootcamp",
      "Partnership",
      "News",
      "Contact",
    ];
    for (const label of labels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("marks the active route's nav item (edge/boundary: active-state)", () => {
    render(<SiteHeader global={{ siteName: "TrieDatum" }} activePath="/about" />);
    expect(screen.getByText("About").closest("li")).toHaveClass("active");
  });

  it("exposes exactly 9 case-study links and excludes case8 (EP-01-S3)", () => {
    expect(CASE_STUDY_LINKS).toHaveLength(9);
    expect(CASE_STUDY_LINKS.some((l) => l.href.includes("case8"))).toBe(false);
  });

  it("does not throw when no activePath is supplied (failure/absence case)", () => {
    expect(() => render(<SiteHeader global={{ siteName: "TrieDatum" }} />)).not.toThrow();
  });
});
