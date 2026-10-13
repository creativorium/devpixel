import test from "node:test";
import assert from "node:assert/strict";
import {
  parseBlocks,
  parseInline,
  projectColor,
  todoProgress,
  toggleTodo,
} from "../src/lib/workspace/note-format";
import { addDays, workspaceToday } from "../src/lib/workspace/model";

test("parseBlocks recognises Notion-style blocks", () => {
  const body = [
    "# Brief",
    "Plain paragraph",
    "## Goals",
    "- Direct bookings",
    "* Live rates",
    "1. Design",
    "2) Build",
    "[ ] Collect photos",
    "- [x] Domain",
    "> Client quote",
    "---",
    "```",
    "npm run build",
    "```",
    "",
  ].join("\n");
  assert.deepEqual(
    parseBlocks(body).map((b) => b.type),
    [
      "h1",
      "p",
      "h2",
      "bullet",
      "bullet",
      "number",
      "number",
      "todo",
      "todo",
      "quote",
      "divider",
      "code",
    ],
  );
  const todos = parseBlocks(body).filter((b) => b.type === "todo");
  assert.deepEqual(
    todos.map((t) => t.type === "todo" && t.done),
    [false, true],
  );
  assert.deepEqual(todoProgress(parseBlocks(body)), { total: 2, done: 1 });
  assert.equal(parseBlocks("#nospace")[0]!.type, "p");
  assert.deepEqual(parseBlocks("\r\n\r\n"), []);
});

test("toggleTodo flips only the targeted checkbox", () => {
  const body = "Intro [ ] not a todo\n[ ] One\n- [x] Two";
  const once = toggleTodo(body, 1);
  assert.equal(once, "Intro [ ] not a todo\n[x] One\n- [x] Two");
  assert.equal(toggleTodo(once, 2), "Intro [ ] not a todo\n[x] One\n- [ ] Two");
  assert.equal(toggleTodo(body, 99), body);
});

test("parseInline keeps only safe http(s) links", () => {
  assert.deepEqual(parseInline("a **b** `c` _d_"), [
    { type: "text", text: "a " },
    { type: "bold", text: "b" },
    { type: "text", text: " " },
    { type: "code", text: "c" },
    { type: "text", text: " " },
    { type: "italic", text: "d" },
  ]);
  assert.deepEqual(parseInline("[site](https://devnpixel.com)"), [
    { type: "link", text: "site", href: "https://devnpixel.com" },
  ]);
  const js = parseInline("[x](javascript:alert(1))");
  assert.ok(js.every((p) => p.type === "text"));
  assert.ok(
    parseInline("<img src=x onerror=alert(1)>").every((p) => p.type === "text"),
  );
});

test("dates use the Bali calendar day", () => {
  // 20:00 UTC on 12 Oct is already 13 Oct in Bali (UTC+8).
  assert.equal(workspaceToday(new Date("2026-10-12T20:00:00Z")), "2026-10-13");
  assert.equal(addDays("2026-12-29", 7), "2027-01-05");
  assert.equal(projectColor("abc"), projectColor("abc"));
});
