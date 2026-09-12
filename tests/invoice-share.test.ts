import test from "node:test";
import assert from "node:assert/strict";
import { newInvoice } from "../src/lib/invoice";
import {
  createInvoiceSnapshot,
  readInvoiceSnapshot,
} from "../src/lib/invoice-share";
test("independent snapshots preserve Unicode, item details and totals after draft edits", async () => {
  const d = newInvoice();
  d.client = "Client A — 日本語";
  d.items[0].subDescription = "Design review\nPayment integration";
  d.items[0].rate = 200;
  const a = await createInvoiceSnapshot(d);
  d.client = "Client B";
  d.items[0].rate = 500;
  const b = await createInvoiceSnapshot(d);
  assert.notEqual(a, b);
  const first = await readInvoiceSnapshot(a),
    second = await readInvoiceSnapshot(b);
  assert.equal(first.client, "Client A — 日本語");
  assert.equal(first.items[0].rate, 200);
  assert.equal(
    first.items[0].subDescription,
    "Design review\nPayment integration",
  );
  assert.equal(second.client, "Client B");
  assert.equal(second.items[0].rate, 500);
});
test("snapshot reader rejects invalid encodings, invalid invoice data and oversized decompressed payloads", async () => {
  await assert.rejects(readInvoiceSnapshot("v2.bad"));
  await assert.rejects(readInvoiceSnapshot("v1.notvalid"));
  await assert.rejects(readInvoiceSnapshot("v1." + "a".repeat(16001)));
  for (const data of [JSON.stringify({ version: 1 }), "a".repeat(250001)]) {
    const compressed = await new Response(
      new Blob([data]).stream().pipeThrough(new CompressionStream("gzip")),
    ).arrayBuffer();
    const payload = Buffer.from(compressed).toString("base64url");
    await assert.rejects(readInvoiceSnapshot("v1." + payload));
  }
});
