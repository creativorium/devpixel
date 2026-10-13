import test from "node:test";
import assert from "node:assert/strict";
import {
  allProjectStatuses,
  projectStatuses,
  statuses,
  statusDefinition,
  taskCreateInput,
  taskMoveInput,
  type Task,
} from "../src/lib/workspace/model";
import { dashboardStats } from "../src/lib/workspace/insights";
import { describeActivity } from "../src/lib/workspace/activity";

const custom = {
  id: "custom_00000000-0000-4000-8000-000000000001",
  label: "Client approval",
  color: "#123456",
};
const configured = [
  ...statuses.slice(0, 3),
  custom,
  { ...statuses[3], label: "Shipped" },
];
test("project status definitions support renamed completion and extra open columns", () => {
  assert.deepEqual(projectStatuses({ statuses: configured }), configured);
  assert.deepEqual(projectStatuses(), statuses);
  assert.deepEqual(
    projectStatuses({ statuses: [...statuses, statuses[0]] }),
    statuses,
  );
  assert.deepEqual(
    projectStatuses({ statuses: [custom, ...statuses.slice(1)] }),
    statuses,
  );
  assert.equal(statusDefinition(custom.id, configured).label, custom.label);
  assert.equal(statusDefinition("unrecognized", configured).color, "#64748b");
  assert.ok(
    allProjectStatuses([{ statuses: configured }]).some(
      (s) => s.id === custom.id,
    ),
  );
});
test("task validation accepts a custom status ID, not arbitrary values", () => {
  const id = "00000000-0000-4000-8000-000000000002";
  assert.ok(
    taskMoveInput.safeParse({ id, status: custom.id, position: 1 }).success,
  );
  assert.ok(
    taskCreateInput.safeParse({
      projectId: id,
      title: "Example",
      status: custom.id,
    }).success,
  );
  assert.equal(
    taskMoveInput.safeParse({ id, status: "random", position: 1 }).success,
    false,
  );
});
test("custom stages count as open work and use readable activity names", () => {
  const tasks = [
    { status: custom.id, assignee: null, due_date: null, priority: "medium" },
    { status: "done", assignee: null, due_date: null, priority: "medium" },
  ] as Task[];
  const stats = dashboardStats(tasks, [], "2026-10-14", configured);
  assert.equal(stats.open, 1);
  assert.equal(stats.byStatus[custom.id], 1);
  assert.equal(stats.workload[0].byStatus[custom.id], 1);
  assert.equal(
    describeActivity("status", { from: custom.id, to: "done" }, [], configured),
    "moved this from Client approval to Shipped",
  );
});
