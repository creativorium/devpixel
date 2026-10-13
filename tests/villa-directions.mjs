import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const villas = [
  ["sora-uluwatu-villa", "cinema"],
  ["batu-pererenan-house", "architecture"],
  ["lumen-ubud-villa", "warmth"],
  ["azul-amed-villa", "coast"],
  ["arca-uluwatu-estate", "estate"],
];
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  const errors = [];
  let posts = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.method() === "POST") posts++;
  });
  for (const [slug, direction] of villas) {
    const response = await page.goto(`${base}/showcase/${slug}`);
    assert.equal(response.status(), 200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(`.villa-opening-${direction}`)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1100 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${slug}: no overflow at ${width}px`,
      );
    }
    if (direction === "cinema") {
      await expect(page.locator(".villa-chapter")).toHaveCount(3);
      await page.locator(".villa-chapter").last().scrollIntoViewIfNeeded();
      await expect(
        page.locator('.villa-chapter-nav a[aria-current="step"]'),
      ).toHaveAttribute("href", "#villa-moment-2");
      await expect(page.locator(".villa-journey-photo.is-active")).toHaveCount(
        1,
      );
      await page
        .locator('.villa-chapter-nav a[href="#villa-moment-0"]')
        .click();
      await expect(
        page.locator('.villa-chapter-nav a[aria-current="step"]'),
      ).toHaveAttribute("href", "#villa-moment-0");
    } else if (direction === "architecture") {
      await expect(page.locator(".villa-index-controls button")).toHaveCount(3);
      await page.locator(".villa-index-controls button").last().click();
      await expect(page.locator("#villa-index-panel-2")).toBeVisible();
      await expect(page.locator("#villa-index-panel-0")).toBeHidden();
      await expect(
        page.locator(".villa-index-controls button").last(),
      ).toHaveAttribute("aria-pressed", "true");
    } else if (direction === "coast") {
      await expect(page.locator(".villa-coast-card")).toHaveCount(3);
      await page.getByRole("button", { name: "Next coastal moment" }).click();
      await expect(page.locator(".villa-coast-controls > span")).toHaveText(
        "02 / 03",
      );
      await page.getByRole("button", { name: "Next coastal moment" }).click();
      await expect(page.locator(".villa-coast-controls > span")).toHaveText(
        "03 / 03",
      );
      await expect(
        page.getByRole("button", { name: "Next coastal moment" }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: "Previous coastal moment" })
        .click();
      await expect(page.locator(".villa-coast-controls > span")).toHaveText(
        "02 / 03",
      );
    } else if (direction === "estate") {
      await expect(page.locator(".villa-estate-details details")).toHaveCount(
        3,
      );
      await page.locator(".villa-estate-details summary").last().click();
      await expect(
        page.locator(".villa-estate-details details[open]"),
      ).toHaveCount(1);
      await expect(
        page.locator(".villa-estate-details details").last(),
      ).toHaveAttribute("open", "");
      await expect(page.locator(".villa-estate-photo").last()).toHaveClass(
        /is-active/,
      );
    } else {
      await expect(
        page.locator(".villa-journey-warmth .villa-chapter-mobile-photo"),
      ).toHaveCount(3);
      await expect(
        page.locator(".villa-journey-warmth .villa-journey-stage"),
      ).toBeHidden();
    }
    const dates = page.locator('#request input[type="date"]');
    await dates.first().fill("2027-06-10");
    await dates.last().fill("2027-06-13");
    await page.locator('#request button[type="submit"]').click();
    await expect(page.locator('#request [role="status"]')).toContainText(
      "3 nights",
    );
    await expect(page.locator('#request [role="status"]')).toContainText(
      "Nothing has been",
    );
    const galleryButton = slug.startsWith("sora")
      ? page.locator(".villa-gallery > button")
      : page.locator(".v-gallery-grid button").first();
    await galleryButton.click();
    await expect(page.locator("dialog[open]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page
      .locator(".villa-opening-photo img")
      .evaluate((img) => img.decode());
    await page.screenshot({ path: `test-results/${slug}-desktop.png` });
    await page.setViewportSize({ width: 390, height: 950 });
    await page
      .locator(".villa-opening-photo img")
      .evaluate((img) => img.decode());
    await page.screenshot({ path: `test-results/${slug}-mobile.png` });
    const photoSelector =
      direction === "architecture"
        ? ".villa-index-photo"
        : direction === "coast"
          ? ".villa-coast-photo"
          : direction === "estate"
            ? ".villa-estate-frame"
            : ".villa-chapter-mobile-photo";
    await page
      .locator(`${photoSelector}:visible`)
      .first()
      .scrollIntoViewIfNeeded();
    await expect(
      page.locator(`${photoSelector}:visible`).first(),
    ).toBeVisible();
    if (direction === "coast") {
      await page
        .locator(".villa-coast-track")
        .evaluate((element) =>
          element.scrollTo({ left: 0, behavior: "instant" }),
        );
      await expect(page.locator(".villa-coast-controls > span")).toHaveText(
        "01 / 03",
      );
      await page.getByRole("button", { name: "Next coastal moment" }).click();
      await expect(page.locator(".villa-coast-controls > span")).toHaveText(
        "02 / 03",
      );
      await page.getByRole("button", { name: "Next coastal moment" }).click();
      await expect(page.locator(".villa-coast-controls > span")).toHaveText(
        "03 / 03",
      );
    }
    await page.setViewportSize({ width: 1440, height: 1100 });
  }
  await page.goto(`${base}/showcase`);
  await page.getByRole("button", { name: /^Villa/ }).click();
  await expect(page.locator(".showcase-card img")).toHaveCount(5);
  for (const thumbnail of await page.locator(".showcase-card img").all()) {
    await thumbnail.scrollIntoViewIfNeeded();
    assert.ok(
      (await thumbnail.getAttribute("src")).includes("villa-directions"),
      "Each villa uses its refreshed thumbnail",
    );
    await thumbnail.evaluate((img) => img.decode());
    assert.ok(
      await thumbnail.evaluate((img) => img.naturalWidth > 0),
      "Thumbnail image loads",
    );
  }
  assert.equal(posts, 0, "Concept stay forms never submit bookings");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(`${base}/showcase/sora-uluwatu-villa`);
  assert.ok(
    await page
      .locator(".villa-opening")
      .evaluate(
        (element) => element.getAnimations({ subtree: true }).length > 0,
      ),
    "Entrance motion plays",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(
      () =>
        page
          .locator(".villa-opening")
          .evaluate(
            (element) => element.getAnimations({ subtree: true }).length,
          ),
      { message: "Changing motion preference stops animations" },
    )
    .toBe(0);
  await page.goto(`${base}/showcase/rimba-ubud-retreat`);
  await expect(page.locator(".villa-direction")).toHaveCount(0);
  await page.goto(`${base}/showcase/villabumi`);
  await expect(page.locator(".villa-opening")).toHaveCount(0);
  await expect(page.locator(".bumi-hero")).toBeVisible();
  const noJS = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 1100 },
  });
  await noJS.goto(`${base}/showcase/sora-uluwatu-villa`);
  await expect(noJS.locator("h1")).toBeVisible();
  await noJS.locator(".villa-chapter").last().scrollIntoViewIfNeeded();
  await expect(noJS.locator(".villa-chapter h2").last()).toBeVisible();
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    "Villa direction checks passed: five unique concepts, five widths, five distinct story interactions, stay forms, galleries, reduced motion, no-JS content, and Bumi/category isolation.",
  );
} finally {
  await browser.close();
}
