import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const base = "http://localhost:3000";
const response = await page.goto(base);
assert.equal(response.status(), 200);
assert.equal(response.headers()["x-frame-options"], "DENY");
assert.equal(await page.locator("h1").count(), 1);
assert.equal(await page.locator('a[href="/invoice"]').count(), 0);
const serviceSlugs = [
  "brand-strategy",
  "web-design",
  "development",
  "advertising",
];
for (const slug of serviceSlugs) {
  assert.ok((await page.locator(`a[href="/services/${slug}"]`).count()) > 0);
}
assert.equal(
  await page
    .locator(".ticker-track")
    .evaluate((el) => getComputedStyle(el).animationName),
  "none",
);
await page.emulateMedia({ reducedMotion: "no-preference" });
await page.locator(".ticker").scrollIntoViewIfNeeded();
await page.mouse.move(0, 0);
const before = await page
  .locator(".ticker-track")
  .evaluate((el) => getComputedStyle(el).transform);
await page.waitForTimeout(150);
assert.notEqual(
  await page
    .locator(".ticker-track")
    .evaluate((el) => getComputedStyle(el).transform),
  before,
);
await page.getByRole("button", { name: "Pause service ticker" }).click();
assert.equal(
  await page
    .locator(".ticker-track")
    .evaluate((el) => getComputedStyle(el).animationPlayState),
  "paused",
);
await page.getByRole("button", { name: "Resume service ticker" }).click();
await page.emulateMedia({ reducedMotion: "reduce" });
for (const slug of serviceSlugs) {
  await page.goto(`${base}/services/${slug}`);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator(".service-deliverables article").count(), 4);
  await page.locator(".service-faq summary").first().click();
  assert.equal(await page.locator(".service-faq details[open]").count(), 1);
}
await page.locator(".service-hero .button").click();
await page.waitForURL("**/contact?service=advertising");
await expect(page.getByLabel("What do you need?")).toHaveValue("Advertising");
await page.goto(`${base}/about`);
assert.equal(await page.locator(".voxel-object").count(), 4);
await page.getByRole("button", { name: "Explode the open frame" }).click();
assert.equal(
  await page
    .getByRole("button", { name: "Assemble the open frame" })
    .getAttribute("aria-pressed"),
  "true",
);
await page.getByRole("button", { name: "Assemble the open frame" }).click();
await page.screenshot({
  path: "test-results/studio-desktop.png",
  fullPage: true,
});
await page.goto(base);
await page.screenshot({
  path: "test-results/home-desktop.png",
  fullPage: true,
});
await page.getByRole("link", { name: "Explore our work" }).click();
await page.waitForURL("**/work");
await page.getByRole("button", { name: "Web experience" }).click();
assert.equal(await page.locator(".project-card").count(), 1);
await page.locator(".project-card").click();
await page.waitForURL("**/work/offgrid");
assert.equal(await page.locator("h1").textContent(), "OFFGRID");
await page.goto(`${base}/contact`);
await page.getByLabel("Your name").fill("Test Client");
await page.getByLabel("Email address").fill("client@example.com");
await page
  .getByLabel("A little about your idea")
  .fill("A thoughtful new website for our studio.");
await expect(page.getByRole("button", { name: "Send enquiry" })).toBeDisabled();
await expect(page.locator('a[href="mailto:main@devnpixel.com"]')).toBeVisible();
await expect(
  page.getByRole("button", { name: "WhatsApp", exact: true }),
).toBeDisabled();
await page.goto(`${base}/invoice`);
await page
  .getByLabel("Client / company", { exact: true })
  .fill("Example Client");
await page.getByLabel("Rate (IDR)", { exact: true }).fill("150000");
await page.getByLabel("Quantity", { exact: true }).fill("2");
await page.getByRole("switch", { name: "Apply tax" }).check();
await page.getByLabel("Tax (%)", { exact: true }).fill("11");
assert.match(await page.locator(".grand-total").textContent(), /333,000/);
await page.waitForTimeout(500);
await page.reload();
assert.equal(
  await page.getByLabel("Client / company", { exact: true }).inputValue(),
  "Example Client",
);
assert.match(await page.locator(".grand-total").textContent(), /333,000/);
await page.getByRole("button", { name: "Add line item" }).click();
assert.equal(await page.locator(".invoice-item").count(), 2);
await page.getByRole("button", { name: "Remove item 2", exact: true }).click();
const downloadEvent = page.waitForEvent("download");
await page.getByRole("button", { name: "Export JSON" }).click();
const download = await downloadEvent;
await download.saveAs("test-results/invoice.json");
await page.getByRole("button", { name: "New invoice" }).click();
await page.getByRole("button", { name: "Replace draft" }).click();
assert.equal(
  await page.getByLabel("Client / company", { exact: true }).inputValue(),
  "",
);
await page
  .locator("input[type=file]")
  .setInputFiles("test-results/invoice.json");
await page
  .getByRole("status")
  .filter({ hasText: "Invoice imported" })
  .waitFor();
assert.equal(
  await page.getByLabel("Client / company", { exact: true }).inputValue(),
  "Example Client",
);
await page.screenshot({
  path: "test-results/invoice-desktop.png",
  fullPage: true,
});
await page.pdf({
  path: "test-results/invoice.pdf",
  format: "A4",
  printBackground: true,
});
await page.locator("input[type=file]").setInputFiles({
  name: "bad.json",
  mimeType: "application/json",
  buffer: Buffer.from('{"tax":-1}'),
});
await page
  .getByRole("status")
  .filter({ hasText: "Invalid invoice file" })
  .waitFor();
for (const width of [390, 320]) {
  await page.setViewportSize({ width, height: 844 });
  for (const path of [
    "/",
    "/work",
    "/about",
    "/contact",
    "/invoice",
    "/services",
    ...serviceSlugs.map((s) => `/services/${s}`),
  ]) {
    await page.goto(base + path);
    if (path === "/invoice") await page.locator(".invoice-paper").waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow at ${path}, ${width}px`,
    );
    if (width === 390)
      await page.screenshot({
        path: `test-results/mobile-${path.replaceAll("/", "-") || "home"}.png`,
        fullPage: true,
      });
  }
}
await page.goto(base);
await page.getByRole("button", { name: "Menu" }).click();
await page
  .getByRole("navigation")
  .getByRole("link", { name: "Work", exact: true })
  .click();
await page.waitForURL("**/work");
assert.equal(
  await page
    .getByRole("button", { name: "Menu" })
    .getAttribute("aria-expanded"),
  "false",
);
assert.match(
  await (await context.request.get(`${base}/sitemap.xml`)).text(),
  /https:\/\/devnpixel.com/,
);
assert.equal(
  (await context.request.get(`${base}/opengraph-image`)).status(),
  200,
);
assert.equal((await context.request.get(`${base}/missing-page`)).status(), 404);
assert.deepEqual(errors, []);
await page.setViewportSize({ width: 2200, height: 1000 });
await page.goto(base);
assert.equal(
  Math.round(
    await page
      .locator(".ticker")
      .evaluate((el) => el.getBoundingClientRect().width),
  ),
  2200,
);
console.log(
  "Browser checks passed: routes, headers, portfolio filter, contact configuration, invoice math/persistence/import/export/PDF, 320px and 390px layouts, mobile navigation, metadata.",
);
await browser.close();
