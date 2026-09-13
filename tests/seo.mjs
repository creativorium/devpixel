import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const canonical = "https://www.devnpixel.com";
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.route("**/*.googletagmanager.com/**", (route) => route.abort());
  await page.goto(`${base}/blog`);
  const links = await page
    .locator(".journal-card h2 a")
    .evaluateAll((es) => es.map((e) => e.getAttribute("href")));
  assert.equal(links.length, 7);
  const titles = new Set();
  for (const path of [
    "/",
    "/services",
    "/about",
    "/contact",
    "/work",
    "/blog",
    ...links,
  ]) {
    assert.equal((await page.goto(base + path)).status(), 200);
    assert.equal(
      new URL(await page.locator('link[rel="canonical"]').getAttribute("href"))
        .href,
      new URL(canonical + path).href,
    );
    await expect(page.locator("h1")).toHaveCount(1);
    const title = await page.title();
    assert.ok(!titles.has(title));
    titles.add(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /\S+/,
    );
    assert.equal(
      new URL(
        await page.locator('meta[property="og:url"]').getAttribute("content"),
      ).href,
      new URL(canonical + path).href,
    );
    if (links.includes(path)) {
      const data = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((es) =>
          es.flatMap((e) => JSON.parse(e.textContent)["@graph"] || []),
        );
      assert.ok(
        data.some(
          (d) =>
            d["@type"] === "BlogPosting" &&
            d.mainEntityOfPage === canonical + path,
        ),
      );
      assert.ok(data.some((d) => d["@type"] === "BreadcrumbList"));
      await expect(
        page.locator('.article-cta a[href^="/services/"]'),
      ).toHaveCount(1);
    }
  }
  const sitemap = await (await page.request.get(`${base}/sitemap.xml`)).text();
  for (const link of links) assert.ok(sitemap.includes(canonical + link));
  assert.ok(!sitemap.includes("/invoice"));
  assert.ok(!sitemap.includes("/threedanimation"));
  for (const asset of ["favicon.png", "logo.png", "apple-touch-icon.png"]) {
    const response = await page.request.get(`${base}/${asset}`);
    assert.equal(response.status(), 200);
    assert.ok(response.headers()["content-type"].includes("image/png"));
  }
  for (const width of [320, 390, 800, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/work", "/blog", links[0]]) {
      await page.goto(base + path);
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${width}px overflow on ${path}`,
      );
      if (width < 760 && (path === "/" || path === "/work")) {
        const frames = await page
          .locator(".project-card .art-client")
          .evaluateAll((elements) =>
            elements.map((el) => {
              const rect = el.getBoundingClientRect();
              return {
                ratio: rect.width / rect.height,
                fit: getComputedStyle(el.querySelector("img")).objectFit,
              };
            }),
          );
        assert.equal(frames.length, 2);
        for (const frame of frames) {
          assert.ok(Math.abs(frame.ratio - 1.44) < 0.02);
          assert.equal(frame.fit, "contain");
        }
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/blog`);
  await page.screenshot({
    path: "test-results/journal-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/work");
  await page
    .locator(".project-grid")
    .screenshot({ path: "test-results/portfolio-mobile.png" });
  for (const prefix of ["/de", "/id", "/ja", "/zh"]) {
    for (const path of links.slice(0, 2)) {
      assert.equal((await page.goto(base + prefix + path)).status(), 200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        canonical + prefix + path,
      );
      assert.ok((await page.locator("main").innerText()).length > 300);
    }
  }
  await page.goto(base + links[0]);
  await page.screenshot({ path: "test-results/article-mobile.png" });
  assert.equal(
    (await page.goto(`${base}/blog/not-a-real-article`)).status(),
    404,
  );
  console.log(
    "SEO checks passed: unique metadata, canonical host, 7 static articles, structured data, sitemap, icons, responsive layouts, and 404.",
  );
} finally {
  await browser.close();
}
