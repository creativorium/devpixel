import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3017";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.route("**/*googletagmanager.com/**", (r) => r.abort());
  const page = await context.newPage();
  await page.goto(base + "/invoice");
  await page.getByLabel("Client / company", { exact: true }).fill("Client A");
  await page
    .getByLabel("Sub-description", { exact: true })
    .fill("Website development\nPayment integration");
  await page
    .getByRole("button", { name: "Create snapshot link", exact: true })
    .click();
  const field = page.getByLabel(
    "Last generated snapshot link (not updated by later edits)",
  );
  await expect(field).toBeVisible();
  const a = await field.inputValue();
  await page.getByLabel("Client / company", { exact: true }).fill("Client B");
  await page
    .getByRole("button", { name: "Create snapshot link", exact: true })
    .click();
  await expect(field).not.toHaveValue(a);
  const b = await field.inputValue();
  assert.notEqual(a, b);
  const recipient = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const viewer = await recipient.newPage();
  const requests = [];
  viewer.on("request", (r) => requests.push(r.url()));
  const response = await viewer.goto(a);
  await expect(viewer.locator(".invoice-paper")).toContainText("Client A");
  await expect(viewer.locator(".item-subdescription")).toHaveText(
    "Website development\nPayment integration",
  );
  assert.ok(
    response
      .headers()
      ["content-security-policy"].includes("connect-src 'none'"),
  );
  assert.equal(response.headers()["referrer-policy"], "no-referrer");
  assert.ok(response.headers()["x-robots-tag"].includes("noindex"));
  await expect(
    viewer.locator("input,textarea,.site-header,.cookie-widget"),
  ).toHaveCount(0);
  assert.ok(
    requests.every(
      (url) => !url.includes("#") && !url.includes("googletagmanager"),
    ),
  );
  assert.equal(await viewer.evaluate(() => localStorage.length), 0);
  assert.ok(
    await viewer.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  const size = await viewer
    .locator(".item-subdescription")
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  assert.ok(size >= 11);
  await viewer.goto(b);
  await expect(viewer.locator(".invoice-paper")).toContainText("Client B");
  await expect(viewer.locator(".invoice-paper")).not.toContainText("Client A");
  await viewer.emulateMedia({ media: "print" });
  await expect(viewer.locator(".invoice-share-info")).toBeHidden();
  await viewer.emulateMedia({ media: "screen" });
  await viewer.screenshot({
    path: "test-results/invoice-shared-mobile.png",
    fullPage: true,
  });
  await viewer.goto(base + "/invoice/view#v1.invalid");
  await expect(viewer.locator("main [role='alert']")).toBeVisible();
  for (const prefix of ["", "/de", "/id", "/ja", "/zh"]) {
    await page.goto(base + prefix + "/work/jw-trading-academy");
    await expect(page.locator("h1")).toHaveText("JW Trading Academy");
    await expect(
      page.locator('a[href="https://jwtradingacademy.com/"]'),
    ).toBeVisible();
    assert.ok(
      await page
        .locator(".art-jw img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    );
  }
  await page.goto(base + "/work");
  await expect(page.locator(".project-card")).toHaveCount(4);
  await expect(page.locator(".project-card").first()).toContainText(
    "JW Trading Academy",
  );
  console.log(
    "Sharing and portfolio checks passed: two independent invoices, read-only recipient, private request URLs, no analytics/storage, print/mobile, invalid links, and all five case-study routes.",
  );
  await recipient.close();
  await context.close();
} finally {
  await browser.close();
}
