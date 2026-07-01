/**
 * homepage.spec.ts
 *
 * Illustrative Playwright coverage for the TDWebsite2 homepage ("/").
 * Translates 3 acceptance-criteria scenarios already written in
 * A01-2-REQUIREMENTS into runnable steps:
 *
 *   1. EP-01-S1 Scenario 1 (happy path)  — desktop nav renders the legacy
 *      link set on every route, with the active route indicated.
 *   2. EP-04-S1 Scenario 1 (happy path)  — the 6-slide fade hero renders in
 *      legacy order with byte-identical copy.
 *   3. EP-04-S2 Scenario 1 (happy path)  — each hero slide's CTA pair routes
 *      to its correct destination (slide 4 -> /services, "Contact us" -> /contact).
 *
 * NOT YET EXECUTED against a live environment — see
 * testing-results/run-20260701-090000/campaign-report.md. This spec is
 * written to the specified behavior of a running apps/web (+ apps/cms for
 * the CMS-driven sections it also touches, e.g. Services) and is ready to
 * run the moment that stack exists with the minimum seed fixture described
 * in TP-E2E-page-journeys.md §5.
 */

import { test, expect } from "@playwright/test";

const EXPECTED_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "#case-studies-dropdown" }, // dropdown trigger, not a direct link
  { label: "Bootcamp", href: "/bootcamp" },
  { label: "Partnership", href: "/partnership" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

const EXPECTED_HERO_SLIDES = [
  {
    headline: "Trusted AI powered by SQL Ontology based Semantic Layer",
    learnMoreHref: "/case-studies/case9",
  },
  {
    headline: "Stop Searching Dashboards. Start Talking to Your Data with AI Agents",
    learnMoreHref: "/case-studies/case7",
  },
  {
    headline: "Architecting Data Ecosystems for the Next Generation of Intelligence",
    learnMoreHref: "/services#dataEng",
  },
  {
    headline: "Unlock Legacy Systems with AI-Powered Modernization",
    learnMoreHref: "/services",
  },
  {
    headline: "Engineering the Future of Trusted AI",
    learnMoreHref: "/about",
  },
  {
    headline: "AI Bootcamp Programs",
    learnMoreHref: "/bootcamp",
  },
];

test.describe("Homepage — EP-01-S1 / EP-04-S1 / EP-04-S2", () => {
  test("desktop nav renders the legacy link set with the active route indicated (EP-01-S1 Scenario 1)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const nav = page.locator("nav.main-menu, [data-testid='site-header-nav']");
    await expect(nav).toBeVisible();

    for (const link of EXPECTED_NAV_LINKS) {
      if (link.href.startsWith("#")) continue; // dropdown trigger, asserted separately
      const navLink = nav.getByRole("link", { name: link.label, exact: true });
      await expect(navLink).toHaveAttribute("href", link.href);
    }

    const homeLink = nav.getByRole("link", { name: "Home", exact: true });
    await expect(homeLink).toHaveClass(/active/);
  });

  test("hero slider renders all 6 slides in legacy order with cross-fade (EP-04-S1 Scenario 1)", async ({
    page,
  }) => {
    await page.goto("/");

    const heroSlider = page.locator("#heroSlide19, [data-testid='hero-slider']");
    await expect(heroSlider).toBeVisible();

    const slides = heroSlider.locator(".swiper-slide");
    await expect(slides).toHaveCount(EXPECTED_HERO_SLIDES.length);

    for (let i = 0; i < EXPECTED_HERO_SLIDES.length; i++) {
      const slide = slides.nth(i);
      await expect(slide.locator("h1.hero-title")).toHaveText(
        EXPECTED_HERO_SLIDES[i].headline
      );
    }

    // Verify the configured Swiper effect is "fade", not slide/translate.
    const swiperEffect = await heroSlider.getAttribute("data-slider-options");
    expect(swiperEffect).toContain('"effect":"fade"');
  });

  test("hero slide 4's CTA pair routes to /services and /contact (EP-04-S2 Scenario 1)", async ({
    page,
  }) => {
    await page.goto("/");

    const heroSlider = page.locator("#heroSlide19, [data-testid='hero-slider']");
    const slide4 = heroSlider.locator(".swiper-slide").nth(3);
    await expect(slide4).toContainText("Unlock Legacy Systems with AI-Powered Modernization");

    const learnMore = slide4.getByRole("link", { name: "Learn more", exact: true });
    await expect(learnMore).toHaveAttribute("href", "/services");

    const contactUs = slide4.getByRole("link", { name: "Contact us", exact: true });
    await expect(contactUs).toHaveAttribute("href", "/contact");

    await learnMore.click();
    await expect(page).toHaveURL(/\/services$/);
  });
});
