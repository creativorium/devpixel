import assert from "node:assert/strict";
import { test } from "node:test";
import {
  billingSchema,
  invoiceFromTasks,
  linkedTaskIds,
} from "../src/lib/workspace/billing";
const tasks = [
  {
    id: "parent",
    title: "Booking feature",
    parent_id: null,
    status: "todo",
    details: "PRIVATE NOTE",
  },
  { id: "child", title: "Date picker", parent_id: "parent", status: "done" },
  {
    id: "grandchild",
    title: "Mobile calendar",
    parent_id: "child",
    status: "todo",
  },
  { id: "other", title: "Payments", parent_id: null, status: "todo" },
];
const defaults = billingSchema.parse({
  client: "Example client",
  currency: "SGD",
});
test("parent and subtasks are grouped without double billing or private content", () => {
  const draft = invoiceFromTasks(
    "Villa",
    tasks,
    ["parent", "child"],
    true,
    defaults,
    () => "opaque-item-id",
  );
  assert.equal(draft.invoice.items.length, 1);
  assert.equal(draft.invoice.items[0].description, "Booking feature");
  assert.equal(
    draft.invoice.items[0].subDescription,
    "• Date picker\n• Mobile calendar",
  );
  assert.equal(draft.invoice.items[0].rate, 0);
  assert.equal(draft.invoice.project, "Villa");
  assert.equal(draft.invoice.client, "Example client");
  assert.equal(draft.invoice.currency, "SGD");
  assert.ok(!JSON.stringify(draft.invoice).includes("PRIVATE NOTE"));
  assert.deepEqual(draft.links[0].taskIds, ["parent", "child", "grandchild"]);
});
test("subtasks can be individually billed and removed items lose task references", () => {
  let id = 0;
  const draft = invoiceFromTasks(
    "Villa",
    tasks,
    ["parent", "child", "other"],
    false,
    defaults,
    () => String(id++),
  );
  assert.equal(draft.invoice.items.length, 3);
  assert.ok(draft.invoice.items.every((item) => !item.subDescription));
  draft.invoice.items.shift();
  assert.deepEqual(linkedTaskIds(draft.invoice, draft.links), [
    "child",
    "other",
  ]);
});
test("invalid selections and cyclic task trees cannot loop or duplicate items", () => {
  assert.equal(
    invoiceFromTasks("Villa", tasks, ["missing"], true, defaults, () => "id")
      .invoice.items.length,
    0,
  );
  const cyclic = [
    { id: "a", title: "A", parent_id: "b", status: "todo" },
    { id: "b", title: "B", parent_id: "a", status: "todo" },
  ];
  const bounded = invoiceFromTasks("Villa", cyclic, ["a"], true, defaults, () => "id");
  assert.equal(bounded.invoice.items.length, 1);
  assert.deepEqual(bounded.links[0].taskIds, ["a", "b"]);
});
