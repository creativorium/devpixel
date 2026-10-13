import assert from "node:assert/strict";

// Run against a production server or the deployed site. This catches hosting
// routing failures that checking the build's generated files cannot detect.
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const sitemap = await fetch(new URL("/sitemap.xml", base));
assert.equal(sitemap.status, 200);
const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
  ([, url]) => new URL(url),
);
assert.ok(urls.length > 0, "Sitemap must contain public URLs");
const articles = urls.filter((url) => url.pathname.startsWith("/blog/"));
assert.equal(articles.length, 7, "Sitemap must include all English articles");

for (let offset = 0; offset < urls.length; offset += 8) {
  await Promise.all(
    urls.slice(offset, offset + 8).map(async ({ pathname }) => {
      const response = await fetch(new URL(pathname, base), {
        signal: AbortSignal.timeout(30_000),
      });
      assert.equal(response.status, 200, `${pathname} must return HTTP 200`);
      const html = await response.text();
      assert.match(
        html,
        /<h1[\s>]/,
        `${pathname} must render its page content`,
      );
      assert.ok(
        !/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html),
        `${pathname} must be indexable`,
      );
      if (pathname.startsWith("/blog/")) {
        assert.match(html, /"BlogPosting"/, `${pathname} needs article markup`);
        assert.ok(
          html.includes(`href="https://www.devnpixel.com${pathname}"`),
          `${pathname} needs its canonical URL`,
        );
      }
    }),
  );
}

for (const pathname of [
  "/blog/not-a-real-article",
  "/id/blog/not-a-real-article",
]) {
  const response = await fetch(new URL(pathname, base));
  assert.equal(response.status, 404, `${pathname} must remain HTTP 404`);
  await response.body?.cancel();
}
console.log(
  `SEO route checks passed: ${urls.length} sitemap pages, seven English articles, and unknown article 404s.`,
);
