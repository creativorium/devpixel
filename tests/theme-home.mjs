import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000");
  await expect(page.locator(".hero-room .room-canvas")).toHaveAttribute(
    "aria-busy",
    "false",
    { timeout: 30000 },
  );
  assert.equal(await page.locator(".hero-room .room-controls").count(), 0);
  assert.equal(
    await page.locator(".hero-room canvas").evaluate((el) => el.width),
    Math.round(
      (await page.locator(".hero-room .room-canvas").boundingBox()).width,
    ),
  );
  await page.screenshot({
    path: "test-results/home-room-light.png",
    fullPage: true,
  });
  const light = await page.locator(".hero-room").screenshot();
  await page.getByRole("switch", { name: "Dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".hero-room .room-experience")).toHaveClass(
    /room-night/,
  );
  await page.waitForTimeout(100);
  assert.ok(!light.equals(await page.locator(".hero-room").screenshot()));
  await page.screenshot({
    path: "test-results/home-room-dark.png",
    fullPage: true,
  });
  await page.reload();
  await expect(page.getByRole("switch", { name: "Dark mode" })).toBeChecked();
  await page.goto("http://localhost:3000/invoice");
  await expect(page.getByLabel("Item title", { exact: true })).toBeVisible();
  await page
    .getByLabel("Client / company", { exact: true })
    .fill("Pixel Client");
  await page
    .getByRole("textbox", { name: "Sub-description", exact: true })
    .fill("Responsive layouts\nDesign system and handoff");
  await page.getByLabel("Rate (IDR)", { exact: true }).fill("100000");
  await page.getByRole("switch", { name: "Apply tax" }).check();
  await page.getByLabel("Tax (%)", { exact: true }).fill("11");
  await expect(page.locator(".grand-total")).toContainText("111,000");
  await page.getByRole("switch", { name: "Apply tax" }).uncheck();
  await expect(page.locator(".grand-total")).toContainText("100,000");
  await expect(page.getByLabel("Tax (%)", { exact: true })).toBeDisabled();
  assert.equal(await page.locator(".paper-totals").getByText(/Tax/).count(), 0);
  await expect(page.locator(".item-subdescription")).toContainText(
    "Design system and handoff",
  );
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Apply tax" }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("textbox", { name: "Sub-description", exact: true }),
  ).toHaveValue("Responsive layouts\nDesign system and handoff");
  assert.equal(
    await page
      .locator(".invoice-paper")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(255, 255, 255)",
  );
  await page.screenshot({
    path: "test-results/invoice-dark.png",
    fullPage: true,
  });
  for (const route of ["/", "/about", "/services", "/contact", "/invoice"]) {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("http://localhost:3000" + route);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    );
  }
  await page.goto("http://localhost:3000");
  await page.screenshot({
    path: "test-results/home-dark-mobile.png",
    fullPage: true,
  });
  await expect(page.locator(".hero-room .room-canvas")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(".hero-room").scrollIntoViewIfNeeded();
  const before = await page.locator(".hero-room").screenshot();
  await page.waitForTimeout(800);
  assert.ok(
    !before.equals(await page.locator(".hero-room").screenshot()),
    "Automatic orbit changes the room view",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Theme, fine homepage room, automatic orbit, mobile layouts, invoice sub-description, tax switch and persistence checks passed.",
  );
} finally {
  await browser.close();
}
