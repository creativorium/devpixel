import test from "node:test";
import assert from "node:assert/strict";
import {
  emailSchema,
  initials,
  memberName,
  positionBetween,
  safeWorkspacePath,
  taskMoveInput,
  taskUpdateInput,
} from "../src/lib/workspace/model";

const id = "3f1c2b6a-6c1e-4f0a-9d7e-2b1a4c5d6e7f";

test("positionBetween orders cards between, before and after neighbours", () => {
  assert.equal(positionBetween(), 1024);
  assert.equal(positionBetween(2048), 3072);
  assert.equal(positionBetween(undefined, 1024), 0);
  const middle = positionBetween(1024, 2048);
  assert.ok(middle > 1024 && middle < 2048);
  // Repeated inserts at the same spot keep a strict order for a long time.
  let low = 0;
  const high = 1;
  for (let i = 0; i < 40; i++) {
    const next = positionBetween(low, high);
    assert.ok(next > low && next < high);
    low = next;
  }
});

test("safeWorkspacePath only allows same-origin workspace paths", () => {
  assert.equal(safeWorkspacePath("/teams/p/abc"), "/teams/p/abc");
  assert.equal(safeWorkspacePath(null), "/teams");
  assert.equal(safeWorkspacePath("https://evil.example/teams"), "/teams");
  assert.equal(safeWorkspacePath("//evil.example"), "/teams");
  assert.equal(safeWorkspacePath("/teams\\@evil.example"), "/teams");
  assert.equal(safeWorkspacePath("/invoice"), "/teams");
});

test("task inputs normalise blanks and reject bad values", () => {
  const ok = taskUpdateInput.parse({
    id,
    title: "  Build kanban  ",
    details: "",
    priority: "high",
    assignees: ["  Nego@DevnPixel.com ", "nego@devnpixel.com", "a@b.co"],
    labels: ["bug", "bug", "blocker"],
    dueDate: "",
  });
  assert.equal(ok.title, "Build kanban");
  assert.deepEqual(ok.assignees, ["nego@devnpixel.com", "a@b.co"]);
  assert.deepEqual(ok.labels, ["bug", "blocker"]);
  assert.equal(ok.dueDate, null);
  assert.deepEqual(
    taskUpdateInput.parse({ ...ok, assignees: [], dueDate: "2026-10-12" })
      .assignees,
    [],
  );
  assert.equal(
    taskUpdateInput.safeParse({ ...ok, labels: ["urgent-ish"] }).success,
    false,
  );
  assert.equal(
    taskUpdateInput.safeParse({
      ...ok,
      assignees: ["a@x.co", "b@x.co", "c@x.co", "d@x.co", "e@x.co", "f@x.co"],
    }).success,
    false,
  );
  assert.equal(
    taskUpdateInput.safeParse({ ...ok, priority: "whenever" }).success,
    false,
  );
  assert.equal(
    taskUpdateInput.safeParse({ ...ok, title: "   " }).success,
    false,
  );
  assert.equal(
    taskUpdateInput.safeParse({ ...ok, dueDate: "12/10/2026" }).success,
    false,
  );
  assert.equal(
    taskMoveInput.safeParse({ id, status: "archived", position: 1 }).success,
    false,
  );
  assert.equal(
    taskMoveInput.safeParse({ id, status: "done", position: NaN }).success,
    false,
  );
  assert.equal(
    taskMoveInput.safeParse({ id: "1", status: "done", position: 1 }).success,
    false,
  );
});

test("member helpers", () => {
  assert.equal(emailSchema.parse(" A@B.co "), "a@b.co");
  const team = [{ email: "a@b.co", display_name: "Ayu Putri" }];
  assert.equal(memberName(team, "a@b.co"), "Ayu Putri");
  assert.equal(memberName(team, "x@b.co"), "x@b.co");
  assert.equal(memberName(team, null), "Unassigned");
  assert.equal(initials("Ayu Putri"), "AP");
  assert.equal(initials("nego@devnpixel.com"), "ND");
});

test("direct Google sign-in builds a safe authorisation request", async () => {
  const { googleAuthUrl, hashNonce, newAttempt, parseAttempt, sameState } =
    await import("../src/lib/workspace/google");
  const attempt = newAttempt("/teams/p/1");
  const other = newAttempt("/teams");
  assert.notEqual(attempt.state, other.state);
  assert.notEqual(attempt.nonce, other.nonce);
  const url = googleAuthUrl(
    "client-id",
    "https://www.devnpixel.com/teams/auth/google/callback",
    attempt,
  );
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://www.devnpixel.com/teams/auth/google/callback",
  );
  assert.equal(url.searchParams.get("state"), attempt.state);
  // Google gets only the hash; the raw nonce stays in the httpOnly cookie.
  assert.equal(url.searchParams.get("nonce"), hashNonce(attempt.nonce));
  assert.notEqual(url.searchParams.get("nonce"), attempt.nonce);
  assert.deepEqual(parseAttempt(JSON.stringify(attempt)), attempt);
  assert.equal(parseAttempt("not json"), null);
  assert.equal(parseAttempt(JSON.stringify({ state: 1 })), null);
  assert.equal(parseAttempt(undefined), null);
  assert.equal(sameState(attempt.state, attempt.state), true);
  assert.equal(sameState(attempt.state, other.state), false);
  assert.equal(sameState(attempt.state, null), false);
});
