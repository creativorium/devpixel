import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3012";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let analytics = 0;
  await page.route("**/*googletagmanager.com/**", (r) => {
    analytics++;
    return r.abort();
  });
  for (const locale of ["de", "zh", "ja", "id"]) {
    for (const path of [
      "",
      "/contact",
      "/work",
      "/about",
      "/services",
      "/services/development",
      "/privacy",
      "/terms",
      "/blog",
      "/blog/web-development-bali-small-business-guide",
    ]) {
      const url = "/" + locale + path;
      const response = await page.goto(base + url);
      assert.equal(response.status(), 200, url);
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        locale === "zh" ? "zh-Hans" : locale,
      );
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://www.devnpixel.com" + url,
      );
      assert.equal(
        await page.locator('link[rel="alternate"][hreflang]').count(),
        6,
      );
      assert.ok(
        !(await page.locator("main").innerText()).includes("????"),
        url + " corrupt encoding",
      );
    }
    for (const width of [320, 390, 800, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + "/" + locale);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        locale + " overflow " + width,
      );
      if (width < 761) {
        await page.locator(".menu-toggle").click();
        await expect(page.locator(".nav")).toHaveClass(/open/);
      }
      const talk = await page.locator(".nav-contact").boundingBox();
      const language = await page
        .locator(".language-switcher summary")
        .boundingBox();
      assert.ok(
        language.x >= talk.x + talk.width - 1,
        locale + " selector order",
      );
      assert.equal(language.height, talk.height);
      await page.locator(".language-switcher summary").click();
      await expect(page.locator(".language-options")).toBeVisible();
      const box = await page.locator(".language-options").boundingBox();
      assert.ok(
        box.x >= 0 && box.x + box.width <= width + 1,
        locale + " dropdown bounds",
      );
      await page.keyboard.press("Escape");
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/de/contact?service=development#main");
  await expect(page.locator('select[name="service"]')).toHaveValue(
    "Development",
  );
  await page.locator(".language-switcher summary").click();
  await page.locator('.language-options a[lang="ja"]').click();
  await expect(page).toHaveURL(base + "/ja/contact?service=development#main");
  await expect(page.locator('select[name="service"]')).toHaveValue(
    "Development",
  );
  assert.equal(analytics, 0, "analytics must remain off without consent");
  assert.deepEqual(errors, []);
  await page.goto(base + "/de");
  await page.screenshot({ path: "test-results/language-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".menu-toggle").click();
  await page.locator(".language-switcher summary").click();
  await page.screenshot({ path: "test-results/language-mobile.png" });
  console.log(
    "Native language checks passed: 40 routes, metadata, 4 viewport sizes, selector placement, form selection, query/hash preservation, consent, and no browser errors.",
  );
} finally {
  await browser.close();
}
