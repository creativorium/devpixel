import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://localhost:3000";
async function load(path) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(30_000),
  });
  assert.equal(response.status, 200, `${path} must return HTTP 200`);
  return response.text();
}
function links(html) {
  return [...html.matchAll(/href="(\/showcase\/[^"?#]+)"/g)].map(
    ([, path]) => path,
  );
}

// Follow the actual links visitors see, including nested rental pages.
const demos = [...new Set(links(await load("/showcase")))];
assert.equal(demos.length, 30, "All showcase cards must link to demos");
const rentals = new Set();
for (let offset = 0; offset < demos.length; offset += 6) {
  await Promise.all(
    demos.slice(offset, offset + 6).map(async (path) => {
      const html = await load(path);
      assert.match(html, /<h1[\s>]/, `${path} must render its heading`);
      assert.ok(
        html.includes(`href="https://www.devnpixel.com${path}"`),
        `${path} must retain its canonical URL`,
      );
      for (const link of links(html)) {
        if (link.endsWith("/rentals")) rentals.add(link);
      }
    }),
  );
}
assert.equal(rentals.size, 5, "Rental demos must link to their rental pages");
for (const path of rentals) await load(path);
for (const path of [
  "/showcase/not-a-real-showcase",
  "/showcase/not-a-real-showcase/rentals",
  "/showcase/rimba-ubud-retreat/rentals",
]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 404, `${path} must remain HTTP 404`);
  await response.body?.cancel();
}
console.log(
  `Showcase route checks passed: ${demos.length} demos, ${rentals.size} rental pages, and invalid route 404s.`,
);
