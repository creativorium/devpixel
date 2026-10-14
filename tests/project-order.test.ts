import assert from "node:assert/strict";
import { test } from "node:test";
import {
  moveProject,
  orderedProjects,
  parseProjectOrder,
} from "../src/lib/workspace/project-order";

test("saved project order tolerates missing and new projects without leaking hidden entries", () => {
  const projects = [{ id: "a" }, { id: "b" }, { id: "new" }];
  assert.deepEqual(orderedProjects(projects, ["hidden", "b", "a"]), [
    projects[1],
    projects[0],
    projects[2],
  ]);
  assert.deepEqual(
    projects.map((p) => p.id),
    ["a", "b", "new"],
  );
});
test("project moves support both directions and ignore invalid drag targets", () => {
  const order = ["a", "b", "c"];
  assert.deepEqual(moveProject(order, "c", "a"), ["c", "a", "b"]);
  assert.deepEqual(moveProject(order, "a", "c", true), ["b", "c", "a"]);
  assert.deepEqual(moveProject(order, "a", "a"), order);
  assert.deepEqual(moveProject(order, "other", "a"), order);
  assert.deepEqual(order, ["a", "b", "c"]);
});
test("malformed stored ordering falls back safely", () => {
  assert.deepEqual(parseProjectOrder("bad JSON"), []);
  assert.deepEqual(parseProjectOrder('["a",2]'), []);
  assert.deepEqual(parseProjectOrder('["a","a","b"]'), ["a", "b"]);
});
