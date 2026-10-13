import test from "node:test";
import assert from "node:assert/strict";
import {
  dashboardStats,
  mentionedEmails,
  mentionToken,
  monthGrid,
  parseMonth,
  shiftMonth,
} from "../src/lib/workspace/insights";
import { displayNameInput, type Task } from "../src/lib/workspace/model";
import { parseInline } from "../src/lib/workspace/note-format";

const task = (over: Partial<Task>): Task => ({
  id: Math.random().toString(),
  project_id: "p",
  title: "t",
  details: "",
  status: "todo",
  priority: "medium",
  assignee: null,
  due_date: null,
  position: 0,
  created_by: "a@x.co",
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
  completed_at: null,
  ...over,
});

test("month grid is Monday-first and covers the whole month", () => {
  const weeks = monthGrid("2026-10");
  assert.equal(weeks[0]![0], "2026-09-28"); // 1 Oct 2026 is a Thursday
  assert.ok(weeks.every((w) => w.length === 7));
  assert.ok(weeks.flat().includes("2026-10-31"));
  assert.ok(weeks.at(-1)!.at(-1)! >= "2026-10-31");
  assert.equal(
    monthGrid("2027-02")
      .flat()
      .filter((d) => d.startsWith("2027-02")).length,
    28,
  );
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(parseMonth("2026-13", "2026-10-14"), "2026-10");
  assert.equal(parseMonth("bad", "2026-10-14"), "2026-10");
  assert.equal(parseMonth("2027-03", "2026-10-14"), "2027-03");
});

test("dashboard counts open, overdue, due soon and done this week", () => {
  const team = [
    { email: "a@x.co", display_name: "A" },
    { email: "b@x.co", display_name: "B" },
  ];
  const today = "2026-10-14";
  const stats = dashboardStats(
    [
      task({ assignee: "a@x.co", due_date: "2026-10-10", priority: "urgent" }),
      task({
        assignee: "a@x.co",
        status: "in_progress",
        due_date: "2026-10-16",
      }),
      task({ status: "review" }),
      task({
        status: "done",
        assignee: "b@x.co",
        completed_at: "2026-10-12T05:00:00Z",
      }),
      task({ status: "done", completed_at: "2026-09-01T05:00:00Z" }),
    ],
    team,
    today,
  );
  assert.equal(stats.total, 5);
  assert.equal(stats.open, 3);
  assert.equal(stats.overdue, 1);
  assert.equal(stats.dueThisWeek, 1);
  assert.equal(stats.doneLast7, 1);
  assert.deepEqual(stats.byStatus, {
    todo: 1,
    in_progress: 1,
    review: 1,
    done: 2,
  });
  const a = stats.workload.find((w) => w.email === "a@x.co")!;
  assert.equal(a.total, 2);
  assert.equal(a.overdue, 1);
  assert.equal(stats.workload.find((w) => w.email === null)!.total, 1);
  assert.equal(stats.byPriority.find((p) => p.priority === "urgent")!.count, 1);
  assert.deepEqual(
    stats.upcoming.map((t) => t.due_date),
    ["2026-10-10", "2026-10-16"],
  );
});

test("mentions round-trip through the stored token", () => {
  const token = mentionToken({
    email: "rohiladeta@gmail.com",
    display_name: "Rohil [R&D]",
  });
  assert.equal(token, "@[Rohil R&D](rohiladeta@gmail.com)");
  const text = `Hi ${token} and @[Nego](abetnego.kristiawan@gmail.com), see https://x.co`;
  assert.deepEqual(mentionedEmails(text), [
    "rohiladeta@gmail.com",
    "abetnego.kristiawan@gmail.com",
  ]);
  const parts = parseInline(text);
  assert.deepEqual(
    parts.filter((p) => p.type === "mention"),
    [
      { type: "mention", text: "Rohil R&D", email: "rohiladeta@gmail.com" },
      { type: "mention", text: "Nego", email: "abetnego.kristiawan@gmail.com" },
    ],
  );
  assert.ok(parts.some((p) => p.type === "link"));
  // A plain email or a bare @word is not a mention.
  assert.ok(
    parseInline("mail rohil_a_b@x.co or @rohil").every(
      (p) => p.type !== "mention",
    ),
  );
  assert.equal(
    mentionToken({ email: "someone@x.co", display_name: "" }),
    "@[someone](someone@x.co)",
  );
});

test("display names are trimmed and limited", () => {
  assert.equal(displayNameInput.parse("  Nego  "), "Nego");
  assert.equal(displayNameInput.safeParse("   ").success, false);
  assert.equal(displayNameInput.safeParse("x".repeat(81)).success, false);
});
