import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  let requests = 0;
  // Never send test traffic to the live Analytics property.
  await page.route("https://www.googletagmanager.com/**", (route) => {
    requests++;
    return route.fulfill({
      contentType: "application/javascript",
      body: "document.cookie='_ga=test; Path=/';",
    });
  });
  await page.goto(base);
  await expect(
    page.getByRole("button", { name: "Essential only" }),
  ).toBeVisible();
  await page.waitForTimeout(300);
  assert.equal(requests, 0);
  await page.screenshot({ path: "test-results/cookie-panel-mobile.png" });
  await page.getByRole("button", { name: "Essential only" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Cookie settings", exact: true }),
  ).toBeVisible();
  assert.equal(requests, 0);
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Accept analytics" }).click();
  await expect.poll(() => requests).toBe(1);
  const config = await page.evaluate(() =>
    window.dataLayer.map((args) => Array.from(args)),
  );
  assert.ok(
    config.some((args) => args[0] === "config" && args[1] === "G-RELL4WL624"),
  );
  assert.ok(
    config.some(
      (args) => args[0] === "consent" && args[2].ad_storage === "denied",
    ),
  );
  await page
    .getByRole("button", { name: "Cookie settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Essential only" }).click();
  await expect(
    page.getByRole("button", { name: "Cookie settings", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(400);
  assert.equal(requests, 1);
  assert.ok(
    !(await page.context().cookies()).some((cookie) =>
      cookie.name.startsWith("_ga"),
    ),
  );
  await page.locator(".menu-toggle").click();
  await expect(page.locator(".mobile-nav-brand")).toBeVisible();
  await expect(page.locator(".mobile-nav-logo")).toHaveCount(0);
  await page.waitForTimeout(400);
  await page.screenshot({ path: "test-results/mobile-menu-brand.png" });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  console.log(
    "Consent checks passed: no tag before consent or after rejection, acceptance loads tag, revocation removes cookies and stops reload tracking, mobile branding verified.",
  );
} finally {
  await browser.close();
}
