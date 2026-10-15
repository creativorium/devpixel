import test from "node:test";
import assert from "node:assert/strict";
import {
  durationLabel,
  timeRange,
  timeLogInput,
  taskLoggedMinutes,
} from "../src/lib/workspace/time-logs";

test("time reports use Monday weeks and correct calendar month boundaries", () => {
  assert.deepEqual(timeRange("2026-10-14", "week"), {
    from: "2026-10-12",
    to: "2026-10-18",
  });
  assert.deepEqual(timeRange("2026-11-01", "week"), {
    from: "2026-10-26",
    to: "2026-11-01",
  });
  assert.deepEqual(timeRange("2024-02-14", "month"), {
    from: "2024-02-01",
    to: "2024-02-29",
  });
  assert.deepEqual(timeRange("2026-12-31", "month"), {
    from: "2026-12-01",
    to: "2026-12-31",
  });
  assert.equal(durationLabel(125), "2h 5m");
});
test("time logs require valid dates and duration while allowing empty notes", () => {
  const input = {
    id: "00000000-0000-4000-8000-000000000001",
    taskId: "00000000-0000-4000-8000-000000000002",
    workDate: "2026-10-13",
    minutes: 90,
    note: "Built the form",
  };
  assert.equal(timeLogInput.safeParse(input).success, true);
  for (const change of [
    { minutes: 0 },
    { minutes: 1441 },
    { minutes: 1.5 },
    { note: "x".repeat(2001) },
    { workDate: "2026-02-30" },
  ])
    assert.equal(
      timeLogInput.safeParse({ ...input, ...change }).success,
      false,
    );
  for (const note of ["", "   ", undefined]) {
    const result = timeLogInput.parse({ ...input, note });
    assert.equal(result.note, "");
  }
});

test("task card time includes its own logs and nested subtasks exactly once", () => {
  const main = { id: "main", logged_minutes: 30 };
  const tasks = [main,
    { id: "child", parent_id: "main", logged_minutes: 60 },
    { id: "nested", parent_id: "child", logged_minutes: 15 },
    { id: "empty", parent_id: "main" },
    { id: "other", logged_minutes: 500 },
  ];
  assert.equal(taskLoggedMinutes(main, tasks), 105);
  assert.equal(taskLoggedMinutes(tasks[1]!, tasks), 75);
  assert.equal(taskLoggedMinutes(tasks[3]!, tasks), 0);
  assert.equal(taskLoggedMinutes({ id: "main" }, tasks), 75);
  assert.equal(taskLoggedMinutes(main, tasks.filter(t => t.id !== "nested")), 90);
  assert.equal(taskLoggedMinutes(main, [...tasks, { ...main, parent_id: "nested" }]), 105);
});
