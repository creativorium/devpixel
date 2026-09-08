import test from "node:test";
import assert from "node:assert/strict";
import { newInvoice, totals, invoiceSchema } from "../src/lib/invoice";
test("discounts apply before tax and totals match the displayed lines", () => {
  const d = newInvoice();
  d.currency = "USD";
  d.items[0] = { ...d.items[0], quantity: 3, rate: 49.99, discount: 10 };
  d.discount = 5;
  d.tax = 11;
  d.taxEnabled = true;
  assert.deepEqual(totals(d), {
    lines: [134.97],
    subtotal: 134.97,
    discount: 6.75,
    tax: 14.1,
    total: 142.32,
  });
});
test("fixed fees ignore quantity and full discount produces a zero balance", () => {
  const d = newInvoice();
  d.items[0] = { ...d.items[0], unit: "fixed", quantity: 7, rate: 150000 };
  assert.equal(totals(d).subtotal, 150000);
  d.discount = 100;
  d.tax = 11;
  assert.equal(totals(d).total, 0);
});
test("imports reject invalid and unbounded values", () => {
  const d = newInvoice();
  assert.equal(invoiceSchema.safeParse(d).success, true);
  assert.equal(
    invoiceSchema.safeParse({ ...d, issued: "2026-02-30" }).success,
    false,
  );
  for (const value of [-1, 101, Infinity, NaN])
    assert.equal(invoiceSchema.safeParse({ ...d, tax: value }).success, false);
  assert.equal(
    invoiceSchema.safeParse({ ...d, currency: "INVALID" }).success,
    false,
  );
  assert.equal(invoiceSchema.safeParse({ ...d, items: [] }).success, false);
  assert.equal(
    invoiceSchema.safeParse({ ...d, client: "a".repeat(5001) }).success,
    false,
  );
});
test("tax switch excludes tax without forgetting the rate, and legacy backups remain compatible", () => {
  const data = newInvoice();
  data.items[0].rate = 100;
  data.tax = 11;
  assert.equal(totals(data).total, 100);
  data.taxEnabled = true;
  assert.equal(totals(data).total, 111);
  data.taxEnabled = false;
  assert.equal(totals(data).total, 100);
  assert.equal(data.tax, 11);
  const legacy = JSON.parse(JSON.stringify(data));
  delete legacy.taxEnabled;
  delete legacy.items[0].subDescription;
  const imported = invoiceSchema.parse(legacy);
  assert.equal(imported.taxEnabled, true);
  assert.equal(imported.items[0].subDescription, "");
  assert.equal(totals(imported).total, 111);
});
