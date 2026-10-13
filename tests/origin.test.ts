import test from "node:test";
import assert from "node:assert/strict";
import { publicOrigin, publicUrl } from "../src/lib/workspace/origin";

const req = (url: string, headers: Record<string, string>) =>
  new Request(url, { headers });

test("auth redirects use the public host, not Netlify's internal URL", () => {
  const internal = "https://main--devnpixel.netlify.app/teams/auth/google";
  assert.equal(
    publicOrigin(req(internal, { "x-forwarded-host": "www.devnpixel.com" })),
    "https://www.devnpixel.com",
  );
  assert.equal(
    publicOrigin(req(internal, { host: "devnpixel.com" })),
    "https://devnpixel.com",
  );
  assert.equal(
    publicUrl(
      "/teams/auth/google/callback",
      req(internal, { host: "www.devnpixel.com" }),
    ).href,
    "https://www.devnpixel.com/teams/auth/google/callback",
  );
  assert.equal(
    publicOrigin(
      req(internal, { host: "deploy-preview-14--devnpixel.netlify.app" }),
    ),
    "https://deploy-preview-14--devnpixel.netlify.app",
  );
});

test("local development keeps http and the port", () => {
  assert.equal(
    publicOrigin(
      req("http://localhost:3000/teams", { host: "localhost:3000" }),
    ),
    "http://localhost:3000",
  );
});

test("unknown or forged hosts fall back to the real site", () => {
  for (const host of [
    "evil.example",
    "www.devnpixel.com.evil.example",
    "devnpixel.netlify.app.evil.io",
    "",
  ])
    assert.equal(
      publicOrigin(req("https://main--devnpixel.netlify.app/", { host })),
      "https://www.devnpixel.com",
    );
  // Public hosts are always https, even if a proxy claims otherwise.
  assert.equal(
    publicOrigin(
      req("https://x/", {
        host: "www.devnpixel.com",
        "x-forwarded-proto": "http",
      }),
    ),
    "https://www.devnpixel.com",
  );
});
