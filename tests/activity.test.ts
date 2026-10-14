import test from "node:test";
import assert from "node:assert/strict";
import { describeActivity } from "../src/lib/workspace/activity";

const team = [
  { email: "a@x.co", display_name: "Ayu" },
  { email: "b@x.co", display_name: "" },
];

test("activity lines read naturally", () => {
  assert.equal(describeActivity("time_logged", { minutes: 240, work_date: "2026-10-14", note: "Deploy to production" }, team), "logged 4h 0m for 2026-10-14: Deploy to production");
  assert.equal(describeActivity("created", {}, team), "created this task");
  assert.equal(
    describeActivity("status", { from: "todo", to: "in_progress" }, team),
    "moved this from To do to In progress",
  );
  assert.equal(
    describeActivity("assignees", { to: ["a@x.co", "b@x.co"] }, team),
    "assigned Ayu, b@x.co",
  );
  assert.equal(
    describeActivity("assignees", { to: [] }, team),
    "removed all assignees",
  );
  assert.equal(
    describeActivity("labels", { to: ["bug", "client"] }, team),
    "set labels: Bug, Client request",
  );
  assert.equal(
    describeActivity("due", { to: null }, team),
    "removed the due date",
  );
  assert.equal(
    describeActivity("due", { to: "2026-10-20" }, team),
    "set the due date to 2026-10-20",
  );
  assert.equal(describeActivity("mystery", {}, team), "updated this task");
});
