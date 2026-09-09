import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/contact/route";
import { contactSchema } from "../src/lib/contact";

const valid = {
  name: "Test Client",
  email: "client@example.com",
  service: "Advertising",
  budget: "Let’s discuss",
  message: "Please help us with a launch campaign.",
  website: "",
};
let sequence = 0;
function request(body: unknown = valid, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      "x-forwarded-for": `192.0.2.${++sequence}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
test("contact endpoint validates requests and reports an unconfigured sender honestly", async () => {
  const key = process.env.RESEND_API_KEY;
  const sender = process.env.CONTACT_FROM_EMAIL;
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_FROM_EMAIL;
  try {
    assert.equal(
      (await POST(request(valid, { origin: "https://untrusted.example" })))
        .status,
      403,
    );
    assert.equal(
      (await POST(request(valid, { "content-type": "text/plain" }))).status,
      415,
    );
    assert.equal(
      (await POST(request({ ...valid, email: "invalid" }))).status,
      400,
    );
    assert.equal(
      (await POST(request({ ...valid, website: "spam.example" }))).status,
      400,
    );
    assert.equal((await POST(request("{bad json"))).status, 400);
    assert.equal((await POST(request("x".repeat(25000)))).status, 413);
    assert.equal((await POST(request(valid))).status, 503);
    assert.equal(
      contactSchema.safeParse({ ...valid, to: "other@example.com" }).success,
      false,
    );
    assert.equal(
      contactSchema.safeParse({
        ...valid,
        name: "Name\nBcc: other@example.com",
      }).success,
      false,
    );
    for (let i = 0; i < 5; i++)
      await POST(request(valid, { "x-forwarded-for": "198.51.100.20" }));
    assert.equal(
      (await POST(request(valid, { "x-forwarded-for": "198.51.100.20" })))
        .status,
      429,
    );
  } finally {
    if (key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = key;
    if (sender === undefined) delete process.env.CONTACT_FROM_EMAIL;
    else process.env.CONTACT_FROM_EMAIL = sender;
  }
});
test("email delivery uses a fixed recipient and only confirms provider acceptance; no real email is sent by this test", async () => {
  const originalFetch = globalThis.fetch;
  const key = process.env.RESEND_API_KEY;
  const sender = process.env.CONTACT_FROM_EMAIL;
  process.env.RESEND_API_KEY = "test-only-placeholder";
  process.env.CONTACT_FROM_EMAIL = "DevnPixel <website@devnpixel.com>";
  let calls = 0;
  try {
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(String(url), "https://api.resend.com/emails");
      const payload = JSON.parse(String(options?.body));
      assert.deepEqual(payload.to, ["code@devnpixel.com"]);
      assert.equal(payload.reply_to, valid.email);
      assert.ok(payload.text.includes(valid.message));
      assert.equal(payload.html, undefined);
      return Response.json({ id: "mock-message-id" });
    };
    assert.equal((await POST(request())).status, 200);
    assert.equal(calls, 1);
    globalThis.fetch = async () =>
      Response.json({ error: "private provider detail" }, { status: 403 });
    const failed = await POST(request());
    assert.equal(failed.status, 502);
    assert.ok(!(await failed.text()).includes("private provider detail"));
    globalThis.fetch = async () => {
      throw new Error("network failure");
    };
    assert.equal((await POST(request())).status, 502);
  } finally {
    globalThis.fetch = originalFetch;
    if (key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = key;
    if (sender === undefined) delete process.env.CONTACT_FROM_EMAIL;
    else process.env.CONTACT_FROM_EMAIL = sender;
  }
});
