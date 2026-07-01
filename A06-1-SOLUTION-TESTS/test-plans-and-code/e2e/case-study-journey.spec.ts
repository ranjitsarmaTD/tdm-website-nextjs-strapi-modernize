/**
 * case-study-journey.spec.ts
 *
 * Illustrative Playwright coverage for the homepage carousel -> listing ->
 * detail journey. Translates 3 acceptance-criteria scenarios from
 * A01-2-REQUIREMENTS/02-homepage.md and 08-news-case-studies-and-testimonials.md:
 *
 *   1. EP-11-S1 Scenario "Happy path" — the homepage carousel renders the 9
 *      legacy case studies in legacy order, autoplaying and looping.
 *   2. EP-11-S2 Scenario "Happy path" — "View All" routes to a real
 *      /case-studies listing page showing all 10 case studies (not just the
 *      9 shown in the carousel).
 *   3. EP-21-S2 Scenario "Happy path" — a visitor browses the listing page
 *      and clicks into a case study's detail page.
 *
 * NOT YET EXECUTED against a live environment — see
 * testing-results/run-20260701-090000/campaign-report.md. In particular,
 * the /case-studies listing route this journey depends on (EP-21-S2) was
 * confirmed absent from the real TDWebsite2 checkout at authoring time
 * (only /case-studies/[slug] exists) — the second test below is expected to
 * fail against today's build, and that failure is exactly the signal this
 * spec exists to raise, not a defect in the spec itself.
 */

import { test, expect } from "@playwright/test";

const EXPECTED_CAROUSEL_ORDER = [
  "case1",
  "case2",
  "case4",
  "case5",
  "case6",
  "case7",
  "case3",
  "case9",
  "case10",
];

test.describe("Case study journey — EP-11-S1 / EP-11-S2 / EP-21-S2", () => {
  test("homepage carousel renders the 9 legacy case studies in legacy order with autoplay/loop (EP-11-S1)", async ({
    page,
  }) => {
    await page.goto("/");

    const carousel = page.locator("#caseStudySlider, [data-testid='case-studies-carousel']");
    await expect(carousel).toBeVisible();

    const slides = carousel.locator(".swiper-slide[data-case-slug]");
    await expect(slides).toHaveCount(EXPECTED_CAROUSEL_ORDER.length);

    for (let i = 0; i < EXPECTED_CAROUSEL_ORDER.length; i++) {
      await expect(slides.nth(i)).toHaveAttribute(
        "data-case-slug",
        EXPECTED_CAROUSEL_ORDER[i]
      );
    }

    // case8 is deliberately absent from the homepage carousel per legacy
    // parity (EP-21-S4's disposition is tracked separately; this assertion
    // reflects disposition (a) — see the campaign report for its open status).
    await expect(carousel.locator("[data-case-slug='case8']")).toHaveCount(0);
  });

  test("'View All' routes to a real /case-studies listing showing all 10 case studies (EP-11-S2)", async ({
    page,
  }) => {
    await page.goto("/");

    const carousel = page.locator("#caseStudySlider, [data-testid='case-studies-carousel']");
    await carousel.getByRole("link", { name: /view all/i }).click();

    await expect(page).toHaveURL(/\/case-studies\/?$/);

    const cards = page.locator("[data-testid='case-study-card']");
    await expect(cards).toHaveCount(10);
  });

  test("visitor browses the listing and opens a case study's detail page (EP-21-S2)", async ({
    page,
  }) => {
    await page.goto("/case-studies");

    const firstCard = page.locator("[data-testid='case-study-card']").first();
    const title = await firstCard.locator("h3, [data-testid='case-study-title']").textContent();
    await firstCard.click();

    await expect(page).toHaveURL(/\/case-studies\/[a-z0-9-]+$/);
    await expect(page.locator("h1")).toHaveText(title?.trim() ?? /.+/);

    // Challenge/Solution/Results/Conclusion body sections carried over from
    // the legacy bold-label convention.
    await expect(page.getByText(/challenge/i)).toBeVisible();
    await expect(page.getByText(/solution/i)).toBeVisible();
    await expect(page.getByText(/results?/i)).toBeVisible();
  });
});
