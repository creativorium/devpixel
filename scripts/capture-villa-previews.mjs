import { chromium } from "@playwright/test";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const slugs = [
  "sora-uluwatu-villa",
  "batu-pererenan-house",
  "lumen-ubud-villa",
  "azul-amed-villa",
  "arca-uluwatu-estate",
];
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  for (const slug of slugs) {
    const response = await page.goto(`${base}/showcase/${slug}`);
    if (response.status() !== 200)
      throw new Error(`${slug}: HTTP ${response.status()}`);
    await page.evaluate(() => document.fonts.ready);
    await page
      .locator(".villa-opening-photo img")
      .evaluate((img) => img.decode());
    await page.screenshot({
      path: `public/showcase/previews/villa-directions/${slug}.jpg`,
      type: "jpeg",
      quality: 82,
    });
    console.log(`Captured ${slug}`);
  }
} finally {
  await browser.close();
}
