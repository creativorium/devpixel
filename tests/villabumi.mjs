import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  let failProvider = false;
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") posts++;
  });
  await page.route("**/api/villabumi/booking*", (route) => {
    const currency = new URL(route.request().url()).searchParams.get(
      "currency",
    );
    return route.fulfill({
      status: failProvider ? 502 : 200,
      json: failProvider
        ? { error: "Provider unavailable" }
        : {
            currency,
            today: "2026-10-05",
            unavailable: [{ start: "2026-10-10", end: "2026-10-12" }],
            rates: [
              {
                season: "Low Season",
                detail: "Weekdays\nMinimum 3 nights",
                amount: currency === "IDR" ? 5415000 : 303,
              },
            ],
          },
    });
  });
  await page.goto(`${base}/showcase/villabumi`);
  await expect(page.locator(".bumi-calendar-month")).toHaveCount(6);
  await expect(page.locator('[data-date="2026-10-10"]')).toBeDisabled();
  await expect(page.locator('[data-date="2026-10-12"]')).toBeEnabled();
  await expect(page.locator('[data-date="2026-10-10"]')).toHaveAttribute(
    "data-boundary",
    "arrival",
  );
  await expect(page.locator('[data-date="2026-10-12"]')).toHaveAttribute(
    "data-boundary",
    "departure",
  );
  await page.locator('[data-date="2026-10-06"]').click();
  await page.locator('[data-date="2026-10-09"]').click();
  await expect(page.locator('input[name="arrival"]')).toHaveValue("2026-10-06");
  await expect(page.locator('input[name="departure"]')).toHaveValue(
    "2026-10-09",
  );
  await page.getByRole("button", { name: "Clear dates" }).click();
  await page.locator('[data-date="2026-10-08"]').click();
  await expect(page.locator('[data-date="2026-10-10"]')).toBeEnabled();
  await page.locator('[data-date="2026-10-13"]').click();
  await expect(
    page.getByRole("status").filter({ hasText: "crosses an unavailable" }),
  ).toBeVisible();
  await page.locator('[data-date="2026-10-10"]').click();
  await expect(page.locator('input[name="departure"]')).toHaveValue(
    "2026-10-10",
  );
  await page.getByRole("button", { name: "Next month", exact: true }).click();
  await expect(page.locator(".bumi-calendar-month h4").first()).toHaveText(
    "November 2026",
  );
  await page
    .getByRole("button", { name: "Previous month", exact: true })
    .click();
  await page.locator(".bumi-nightly-heading select").selectOption("IDR");
  await expect(page.locator(".bumi-nightly-rates td")).toHaveText("5,415,000");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.evaluate(() => document.fonts.ready);
    const expectedMonths = width > 1100 ? 6 : width > 760 ? 4 : 1;
    assert.equal(
      await page.locator(".bumi-calendar-month:visible").count(),
      expectedMonths,
      `${width}px visible months`,
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `${width}px overflow`,
    );
  }
  await page.setViewportSize({ width: 390, height: 950 });
  await page.locator(".bumi-calendar-months").evaluate((element) => {
    const touch = (x, y) =>
      new Touch({ identifier: 1, target: element, clientX: x, clientY: y });
    element.dispatchEvent(
      new TouchEvent("touchstart", {
        bubbles: true,
        touches: [touch(280, 400)],
      }),
    );
    element.dispatchEvent(
      new TouchEvent("touchend", {
        bubbles: true,
        changedTouches: [touch(120, 410)],
      }),
    );
  });
  await expect(page.locator(".bumi-calendar-month h4").first()).toHaveText(
    "November 2026",
  );
  await page
    .getByRole("button", { name: "Previous month", exact: true })
    .click();
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.locator('input[name="name"]').fill("Preview Guest");
  await page.locator('input[name="email"]').fill("guest@example.com");
  await page
    .locator('textarea[name="message"]')
    .fill("Testing a villa stay enquiry preview.");
  await page.getByRole("button", { name: "Preview enquiry" }).click();
  await expect(page.locator(".bumi-form-status")).toContainText(
    "does not send",
  );
  assert.equal(posts, 0);
  await expect(page.locator(".bumi-instagram-grid a")).toHaveCount(4);
  for (const link of await page
    .locator(".bumi-instagram a")
    .evaluateAll((es) => es.map((e) => e.href))) {
    assert.equal(link, "https://www.instagram.com/villabumibali/");
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  assert.ok(
    !(await (await page.request.get(`${base}/sitemap.xml`)).text()).includes(
      "/showcase/villabumi",
    ),
  );
  await page
    .locator(".bumi-booking")
    .screenshot({ path: "test-results/villabumi-booking-desktop.png" });
  await page.setViewportSize({ width: 390, height: 950 });
  await page
    .locator(".bumi-booking")
    .screenshot({ path: "test-results/villabumi-booking-mobile.png" });
  failProvider = true;
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".bumi-calendar-month")).toHaveCount(0);
  await expect(page.locator(".bumi-nightly-rates")).toHaveCount(0);
  failProvider = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator(".bumi-calendar-month")).toHaveCount(6);
  console.log(
    "Villa Bumi checks passed: date selection, booked nights, checkout boundary, USD/IDR, five widths, enquiry preview, Instagram links, noindex, and provider failure/retry.",
  );
} finally {
  await browser.close();
}
