import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000/threedanimation");
  await expect(
    page.getByRole("button", { name: "Rotate room left" }),
  ).toBeEnabled({ timeout: 30000 });
  await page.screenshot({
    path: "test-results/room-desktop.png",
    fullPage: true,
  });
  const day = await page.locator(".room-canvas").screenshot();
  await page.getByRole("button", { name: "After hours" }).click();
  await expect(page.locator(".room-experience")).toHaveClass(/room-night/);
  await page.waitForTimeout(100);
  assert.ok(
    !day.equals(await page.locator(".room-canvas").screenshot()),
    "Lighting changes the rendered image",
  );
  await page.screenshot({
    path: "test-results/room-night.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Daylight" }).click();
  await page.getByLabel("Pixel size").selectOption("4");
  assert.equal(
    await page.locator("canvas").evaluate((el) => el.width),
    Math.round((await page.locator(".room-canvas").boundingBox()).width / 4),
  );
  await page.getByLabel("Pixel size").selectOption("2");
  const initial = await page.locator(".room-canvas").screenshot();
  await page.getByRole("button", { name: "Rotate room left" }).click();
  await page.waitForTimeout(100);
  assert.ok(
    !initial.equals(await page.locator(".room-canvas").screenshot()),
    "Rotation changes the rendered image",
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Reset view" }).click();
  await page.evaluate(() => scrollTo(0, 800));
  assert.equal(
    Math.round((await page.locator(".site-header").boundingBox()).y),
    0,
  );
  assert.equal(
    await page
      .locator(".nav-contact")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(17, 17, 17)",
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(100);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `test-results/room-mobile-${width}.png`,
      fullPage: true,
    });
    await page.evaluate(() => scrollTo(0, 500));
    assert.equal(
      Math.round((await page.locator(".site-header").boundingBox()).y),
      0,
    );
    await page.getByRole("button", { name: "Menu +" }).click();
    await expect(page.locator(".nav-contact")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
  }
  // Exercise the explicit fallback without relying on the host GPU state.
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).startsWith("webgl")) return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto("http://localhost:3000/threedanimation");
  await expect(
    fallback.getByText("Room unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    fallback.getByRole("button", { name: "Zoom in", exact: true }),
  ).toBeDisabled();
  assert.deepEqual(errors, []);
  console.log(
    "Room checks passed: WebGL rendering, day/night, pixel resolution, rotation, zoom/reset, sticky desktop/mobile header, black CTA, responsive layout, and WebGL fallback.",
  );
} finally {
  await browser.close();
}
