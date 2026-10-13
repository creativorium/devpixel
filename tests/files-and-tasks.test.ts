import test from "node:test";
import assert from "node:assert/strict";
import {
  allowedMime,
  disposition,
  formatBytes,
  isImage,
  safeFileName,
  sniffImage,
} from "../src/lib/workspace/files";
import {
  dependencyInput,
  descendants,
  isAdmin,
  messageInput,
  openBlockers,
  taskAssignees,
} from "../src/lib/workspace/model";
import {
  continueList,
  insertLink,
  parseBlocks,
  togglePrefix,
  toggleWrap,
} from "../src/lib/workspace/note-format";

test("uploads accept safe types and reject disguised files", () => {
  assert.equal(allowedMime("shot.png", "image/png"), "image/png");
  assert.equal(allowedMime("photo.JPG", ""), "image/jpeg");
  assert.equal(allowedMime("brief.pdf", "application/pdf"), "application/pdf");
  assert.equal(allowedMime("notes.md", ""), "text/markdown");
  assert.equal(allowedMime("evil.svg", "image/svg+xml"), null);
  assert.equal(allowedMime("evil.png", "image/svg+xml"), null);
  assert.equal(allowedMime("page.html", "text/html"), null);
  assert.equal(allowedMime("run.exe", "application/octet-stream"), null);
  assert.equal(isImage("image/webp"), true);
  assert.equal(isImage("application/pdf"), false);
});

test("image bytes are checked, not just the name", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const webp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
  ]);
  const svg = new TextEncoder().encode("<svg onload=alert(1)>");
  assert.equal(sniffImage(png), "image/png");
  assert.equal(sniffImage(jpg), "image/jpeg");
  assert.equal(sniffImage(webp), "image/webp");
  assert.equal(sniffImage(svg), null);
});

test("stored names and downloads are safe", () => {
  assert.equal(
    safeFileName("Client Brief (final).PDF"),
    "Client-Brief-final.pdf",
  );
  assert.equal(safeFileName("../../etc/passwd"), "passwd");
  assert.equal(safeFileName(String.raw`..\..\win.ini`), "win.ini");
  assert.equal(safeFileName("   "), "file");
  assert.match(
    disposition('a"b.pdf', "application/pdf"),
    /^attachment; filename="a_b.pdf"/,
  );
  assert.match(disposition("shot.png", "image/png"), /^inline;/);
  assert.equal(formatBytes(2048), "2 KB");
  assert.equal(formatBytes(3_500_000), "3.3 MB");
});

test("chat messages need text or a file", () => {
  const channelId = "3f1c2b6a-6c1e-4f0a-9d7e-2b1a4c5d6e7f";
  assert.equal(
    messageInput.safeParse({ channelId, body: "  " }).success,
    false,
  );
  assert.equal(
    messageInput.safeParse({ channelId, body: "", attachmentIds: [channelId] })
      .success,
    true,
  );
});

test("assignees, blockers, subtasks and roles", () => {
  assert.deepEqual(
    taskAssignees({ assignees: ["a@x.co", "b@x.co"], assignee: "a@x.co" }),
    ["a@x.co", "b@x.co"],
  );
  assert.deepEqual(taskAssignees({ assignees: [], assignee: "a@x.co" }), [
    "a@x.co",
  ]);
  assert.deepEqual(taskAssignees({ assignee: null }), []);

  const all = [
    { id: "a", status: "done" },
    { id: "b", status: "todo" },
    { id: "c", status: "review" },
  ];
  const task = { blockers: [{ blocked_by: "a" }, { blocked_by: "b" }] };
  assert.deepEqual(
    openBlockers(task, all).map((t) => t.id),
    ["b"],
  );
  assert.deepEqual(openBlockers({}, all), []);

  const tree = [
    { id: "root", parent_id: null },
    { id: "s1", parent_id: "root" },
    { id: "s2", parent_id: "root" },
    { id: "s1a", parent_id: "s1" },
    { id: "other", parent_id: null },
  ];
  assert.deepEqual(
    descendants("root", tree)
      .map((t) => t.id)
      .sort(),
    ["s1", "s1a", "s2"],
  );
  assert.deepEqual(descendants("s2", tree), []);

  const id = "3f1c2b6a-6c1e-4f0a-9d7e-2b1a4c5d6e7f";
  assert.equal(
    dependencyInput.safeParse({ taskId: id, blockedBy: id }).success,
    false,
  );
  assert.equal(isAdmin({ email: "a", display_name: "", role: "admin" }), true);
  assert.equal(isAdmin({ email: "a", display_name: "" }), false);
  assert.equal(isAdmin(null), false);
});

test("note toolbar edits", () => {
  // Bold wraps the selection, and toggles off when already bold.
  const bold = toggleWrap("make this bold", 10, 14, "**");
  assert.equal(bold.text, "make this **bold**");
  assert.equal(bold.text.slice(bold.start, bold.end), "bold");
  assert.equal(
    toggleWrap(bold.text, bold.start, bold.end, "**").text,
    "make this bold",
  );
  // Empty selection inserts a placeholder that stays selected.
  const empty = toggleWrap("", 0, 0, "**", "bold text");
  assert.equal(empty.text, "**bold text**");
  assert.equal(empty.text.slice(empty.start, empty.end), "bold text");

  const link = insertLink("see site", 4, 8);
  assert.equal(link.text, "see [site](https://)");
  assert.equal(link.text.slice(link.start, link.end), "https://");

  assert.equal(togglePrefix("one\ntwo", 0, 7, "- ").text, "- one\n- two");
  assert.equal(togglePrefix("- one\n- two", 0, 11, "- ").text, "one\ntwo");
  assert.equal(togglePrefix("- item", 0, 0, "[ ] ").text, "[ ] item");
  assert.equal(togglePrefix("a\nb", 0, 3, "1. ").text, "1. a\n2. b");
});

test("Enter continues lists and ends them on an empty item", () => {
  const bullet = continueList("- one", 5)!;
  assert.equal(bullet.text, "- one\n- ");
  assert.equal(continueList("3. three", 8)!.text, "3. three\n4. ");
  assert.equal(continueList("[x] done", 8)!.text, "[x] done\n[ ] ");
  assert.equal(continueList("- ", 2)!.text, "");
  assert.equal(continueList("plain text", 10), null);
});

test("blank lines are kept between blocks but trimmed at the edges", () => {
  const blocks = parseBlocks("\nFirst\n\n\nSecond\n\n");
  assert.deepEqual(
    blocks.map((b) => b.type),
    ["p", "blank", "blank", "p"],
  );
});
