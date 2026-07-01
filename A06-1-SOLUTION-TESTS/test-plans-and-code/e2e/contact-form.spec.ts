/**
 * contact-form.spec.ts
 *
 * Illustrative Playwright coverage for /contact — the single highest-value
 * conversion surface on the site (the only <form> anywhere on the legacy
 * site). Translates 3 acceptance-criteria scenarios from
 * A01-2-REQUIREMENTS/07-contact-and-lead-capture.md:
 *
 *   1. EP-18-S1 Scenario "Happy path" — all legacy-equivalent fields render
 *      and accept input, with the Company field keyed "company" (not the
 *      legacy "subject").
 *   2. EP-18-S2 Scenario "Failure/error" — an invalid/missing required field
 *      blocks client-side submission with an inline error.
 *   3. EP-18-S2 Scenario "Happy path" combined with EP-18-S3's server
 *      contract — a fully valid submission is accepted and the visitor sees
 *      a success state (persistence itself is verified independently by
 *      integration/strapi-permissions.test.ts, not re-asserted here).
 *
 * NOT YET EXECUTED against a live environment — see
 * testing-results/run-20260701-090000/campaign-report.md. Requires a running
 * apps/web with POST /api/contact wired to a real (or test-mode) Strapi
 * instance; this spec intentionally does not assert on Strapi's internal
 * state, only on what the browser observes.
 */

import { test, expect } from "@playwright/test";

test.describe("Contact form — EP-18-S1 / EP-18-S2 / EP-18-S3", () => {
  test("all five legacy-equivalent fields render and accept input, Company keyed as company (EP-18-S1)", async ({
    page,
  }) => {
    await page.goto("/contact");

    const form = page.locator("form.contact-form, [data-testid='contact-form']");
    await expect(form).toBeVisible();

    const name = form.getByLabel("Name", { exact: true });
    const email = form.getByLabel("Email", { exact: true });
    const phone = form.getByLabel("Phone Number", { exact: true });
    const company = form.getByLabel("Company", { exact: true });
    const message = form.getByLabel("Message", { exact: true });

    await name.fill("Jordan Rivers");
    await email.fill("jordan.rivers@example.invalid");
    await phone.fill("+1 555-0100");
    await company.fill("Acme Analytics");
    await message.fill("Interested in a Data Engineering engagement.");

    await expect(name).toHaveValue("Jordan Rivers");
    // The UI label is "Company" but the underlying form control must be
    // keyed "company", not the legacy "subject" — assert the DTO name, not
    // just the visible label, per EP-18-S1's explicit normalization note.
    await expect(company).toHaveAttribute("name", "company");
  });

  test("a malformed email blocks submission with an inline error (EP-18-S2 failure/error)", async ({
    page,
  }) => {
    await page.goto("/contact");

    const form = page.locator("form.contact-form, [data-testid='contact-form']");
    await form.getByLabel("Name", { exact: true }).fill("Jordan Rivers");
    await form.getByLabel("Email", { exact: true }).fill("not-an-email");
    await form.getByLabel("Message", { exact: true }).fill("Hello there.");

    await form.getByRole("button", { name: /submit/i }).click();

    await expect(
      form.getByText(/enter a valid email/i).or(form.locator("[data-field-error='email']"))
    ).toBeVisible();

    // The form must not have navigated away or shown a success state.
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("a fully valid submission is accepted and the visitor sees a success state (EP-18-S2 / EP-18-S3 happy path)", async ({
    page,
  }) => {
    const runId = Date.now();
    await page.goto("/contact");

    const form = page.locator("form.contact-form, [data-testid='contact-form']");
    await form.getByLabel("Name", { exact: true }).fill("Jordan Rivers");
    await form.getByLabel("Email", { exact: true }).fill(`e2e-test+${runId}@example.invalid`);
    await form.getByLabel("Message", { exact: true }).fill(
      "Interested in learning more about the AI Bootcamp for our data team."
    );

    // A human visitor never touches the visually-hidden honeypot field.
    const honeypot = form.locator("input[name='honeypot'], [aria-hidden='true'] input");
    await expect(honeypot).toBeHidden();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/contact") && res.request().method() === "POST"),
      form.getByRole("button", { name: /submit/i }).click(),
    ]);

    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);

    await expect(
      page.getByText(/thank you|message sent|we.?ll be in touch/i)
    ).toBeVisible();
  });
});
