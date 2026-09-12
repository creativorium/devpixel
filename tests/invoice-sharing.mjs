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
    "Last generated invoice link (not updated by later edits)",
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
  assert.equal(
    await viewer
      .locator(".invoice-paper")
      .evaluate((el) => getComputedStyle(el).borderTopWidth),
    "1px",
  );
  await viewer.goto(b);
  await expect(viewer.locator(".invoice-paper")).toContainText("Client B");
  await expect(viewer.locator(".invoice-paper")).not.toContainText("Client A");
  await viewer.emulateMedia({ media: "print" });
  await expect(viewer.locator(".invoice-share-info")).toBeHidden();
  assert.equal(
    await viewer
      .locator(".invoice-paper")
      .evaluate((el) => getComputedStyle(el).borderTopWidth),
    "0px",
  );
  await viewer.emulateMedia({ media: "screen" });
  await viewer.screenshot({
    path: "test-results/invoice-shared-mobile.png",
    fullPage: true,
  });
  await viewer.goto(base + "/invoice/view#v1.invalid");
  await expect(viewer.locator("main [role='alert']")).toBeVisible();
  // Mock the storage API: browser tests never need Google credentials or write real invoices.
  const shortId = "a".repeat(24),
    password = "test-owner-password-".repeat(3);
  let stored;
  await page.route("**/api/invoices", async (route) => {
    assert.equal(route.request().headers().authorization, `Bearer ${password}`);
    assert.ok(!route.request().url().includes(password));
    stored = route.request().postDataJSON();
    assert.ok(!JSON.stringify(stored).includes(password));
    await route.fulfill({
      status: 201,
      json: { id: shortId, url: base + "/i/" + shortId },
    });
  });
  await page.getByText("Create a short link", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save & copy short link" }),
  ).toBeDisabled();
  await page.getByLabel("Owner password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Save & copy short link" }).click();
  await expect(field).toHaveValue(base + "/i/" + shortId);
  assert.ok(
    !(
      await page.evaluate(
        () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
      )
    ).includes(password),
  );
  await viewer.route("**/api/invoices/" + shortId, (route) =>
    route.fulfill({ json: { invoice: stored } }),
  );
  const shortResponse = await viewer.goto(base + "/i/" + shortId);
  await expect(viewer.locator(".invoice-paper")).toContainText("Client B");
  assert.ok(
    shortResponse
      .headers()
      ["content-security-policy"].includes("connect-src 'self'"),
  );
  assert.equal(shortResponse.headers()["referrer-policy"], "no-referrer");
  assert.ok(shortResponse.headers()["x-robots-tag"].includes("noindex"));
  await expect(
    viewer.locator("input,textarea,.site-header,.cookie-widget"),
  ).toHaveCount(0);
  assert.equal(await viewer.evaluate(() => localStorage.length), 0);
  await viewer.route("**/api/invoices/" + shortId, (route) =>
    route.fulfill({ status: 404, json: { message: "Invoice unavailable." } }),
  );
  await viewer.reload();
  await expect(viewer.locator("main [role='alert']")).toHaveText(
    "Invoice unavailable.",
  );
  for (const prefix of ["", "/de", "/id", "/ja", "/zh"]) {
    await page.goto(base + prefix + "/work/jw-trading-academy");
    await expect(page.locator("h1")).toHaveText("JW Trading Academy");
    await expect(
      page.locator('a[href="https://jwtradingacademy.com/"]'),
    ).toBeVisible();
    assert.ok(
      await page
        .locator(".art-client img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    );
    await expect(page.locator("main")).toContainText("Vite");
    await page.goto(base + prefix + "/work/wonderland-bali");
    await expect(page.locator("h1")).toHaveText("Wonderland Bali");
    await expect(
      page.locator('a[href="https://wonderlandbali.com/"]'),
    ).toBeVisible();
    await expect(page.locator("main")).toContainText("Vite");
    await expect(page.locator("main")).toContainText("Search Console");
    await expect(page.locator(".art-client img")).toBeVisible();
  }
  await page.goto(base + "/work");
  await expect(page.locator(".project-card")).toHaveCount(5);
  await expect(page.locator(".project-card").first()).toContainText(
    "JW Trading Academy",
  );
  console.log(
    "Sharing and portfolio checks passed: independent snapshots, short-link creation/view/revocation with mocked storage, no persisted password, isolated viewers, paper border/print/mobile, invalid links, and both client case studies in all five languages.",
  );
  await recipient.close();
  await context.close();
} finally {
  await browser.close();
}
