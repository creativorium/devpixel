import test from "node:test";
import assert from "node:assert/strict";
import { newInvoice } from "../src/lib/invoice";
import {
  boundedJson,
  invoiceHeaders,
  loadInvoice,
  ownerAuthorized,
  saveInvoice,
  validateStoredInvoice,
  type SheetRequest,
} from "../src/lib/invoice-store";
import { POST } from "../src/app/api/invoices/route";
import { GET } from "../src/app/api/invoices/[id]/route";

test("owner authentication rejects missing, short and incorrect passwords", () => {
  const secret = "a".repeat(43);
  assert.ok(ownerAuthorized(`Bearer ${secret}`, secret));
  assert.equal(ownerAuthorized(`Bearer ${"b".repeat(43)}`, secret), false);
  assert.equal(ownerAuthorized(null, secret), false);
  assert.equal(ownerAuthorized("Bearer short", "short"), false);
});

test("short links store independent invoices, find only the requested row and respect revocation", async () => {
  const rows: (string | number)[][] = [];
  const request: SheetRequest = async (range, values) => {
    if (values) {
      rows.push(...values);
      return { updates: { updatedRows: 1 } };
    }
    if (range === "Invoices!A1:I1") return { values: [invoiceHeaders] };
    if (range === "Invoices!A2:A")
      return { values: rows.map((row) => [row[0]]) };
    const row = Number(range.match(/A(\d+):/)?.[1]) - 2;
    return { values: [rows[row]] };
  };
  const data = { ...newInvoice(), client: "=UNTRUSTED() 日本語" };
  const a = await saveInvoice(data, request);
  data.client = "Second client";
  const b = await saveInvoice(data, request);
  assert.notEqual(a.id, b.id);
  assert.equal(a.id.length, 24);
  assert.ok(a.url.length < 60);
  assert.equal(rows[0][3], "=UNTRUSTED() 日本語");
  assert.equal(
    (await loadInvoice(a.id, request))?.client,
    "=UNTRUSTED() 日本語",
  );
  assert.equal((await loadInvoice(b.id, request))?.client, "Second client");
  rows[0][8] = "revoked";
  assert.equal(await loadInvoice(a.id, request), null);
  assert.equal(await loadInvoice("z".repeat(24), request), null);
  assert.equal(
    await loadInvoice("invalid", () => {
      throw new Error("Must not query Google");
    }),
    null,
  );
});

test("sheet setup, inconsistent rows and invoice size are validated", async () => {
  const data = { ...newInvoice(), client: "Client" };
  await assert.rejects(
    saveInvoice(data, async () => ({ values: [["wrong header"]] })),
  );
  const id = "a".repeat(24);
  assert.equal(
    await loadInvoice(id, async (range) => ({
      values: range === "Invoices!A2:A" ? [[id]] : [["other-id"]],
    })),
    null,
  );
  assert.throws(() => validateStoredInvoice(newInvoice()));
  assert.throws(() => validateStoredInvoice({ ...data, due: "2000-01-01" }));
  assert.throws(() =>
    validateStoredInvoice({
      ...data,
      items: Array.from({ length: 20 }, () => ({
        ...data.items[0],
        subDescription: "x".repeat(5000),
      })),
    }),
  );
});

test("API rejects unauthenticated creation and invalid identifiers without Google access", async () => {
  const response = await POST(
    new Request("https://www.devnpixel.com/api/invoices", {
      method: "POST",
      body: "{}",
    }),
  );
  assert.equal(response.status, 401);
  assert.match(response.headers.get("cache-control")!, /no-store/);
  const missing = await GET(
    new Request("https://www.devnpixel.com/api/invoices/bad"),
    { params: Promise.resolve({ id: "bad" }) },
  );
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get("x-robots-tag")!, /noindex/);
});

test("body reader limits streamed data even without Content-Length", async () => {
  await assert.rejects(boundedJson(new Response("x".repeat(100)), 20));
  assert.deepEqual(await boundedJson(new Response('{"ok":true}')), {
    ok: true,
  });
});
