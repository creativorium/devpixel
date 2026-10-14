import test from "node:test";
import assert from "node:assert/strict";
import {
  durationLabel,
  timeRange,
  timeLogInput,
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
test("time logs require a valid date, whole minutes and work note", () => {
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
    { note: " " },
    { workDate: "2026-02-30" },
  ])
    assert.equal(
      timeLogInput.safeParse({ ...input, ...change }).success,
      false,
    );
});
