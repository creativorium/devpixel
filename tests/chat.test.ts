import test from "node:test";
import assert from "node:assert/strict";
import {
  channelInput,
  channelSlug,
  dayLabel,
  messageInput,
  startsGroup,
  workspaceDay,
  type Message,
} from "../src/lib/workspace/model";

const msg = (author: string, created_at: string): Message => ({
  id: created_at,
  channel_id: "c",
  author,
  body: "hi",
  created_at,
  updated_at: created_at,
  deleted_at: null,
});

test("channel names become Slack-style slugs", () => {
  assert.equal(channelSlug("Client Feedback!"), "client-feedback");
  assert.equal(channelSlug("  --Villa  Bumi--  "), "villa-bumi");
  assert.equal(channelInput.parse({ name: "Design Team" }).name, "design-team");
  assert.equal(channelInput.safeParse({ name: "!!!" }).success, false);
  assert.ok(channelSlug("a".repeat(60)).length <= 40);
});

test("messages must have content and stay within 4000 characters", () => {
  const channelId = "3f1c2b6a-6c1e-4f0a-9d7e-2b1a4c5d6e7f";
  assert.equal(messageInput.parse({ channelId, body: "  hey  " }).body, "hey");
  assert.equal(
    messageInput.safeParse({ channelId, body: "   " }).success,
    false,
  );
  assert.equal(
    messageInput.safeParse({ channelId, body: "x".repeat(4001) }).success,
    false,
  );
});

test("consecutive messages group like Slack", () => {
  const a = msg("a@x.co", "2026-10-13T02:00:00Z");
  assert.equal(startsGroup(undefined, a), true);
  assert.equal(startsGroup(a, msg("a@x.co", "2026-10-13T02:04:00Z")), false);
  assert.equal(startsGroup(a, msg("a@x.co", "2026-10-13T02:06:00Z")), true);
  assert.equal(startsGroup(a, msg("b@x.co", "2026-10-13T02:01:00Z")), true);
  // 15:59 and 16:01 UTC straddle midnight in Bali (UTC+8).
  assert.equal(
    startsGroup(
      msg("a@x.co", "2026-10-13T15:59:00Z"),
      msg("a@x.co", "2026-10-13T16:01:00Z"),
    ),
    true,
  );
});

test("day labels use the Bali calendar", () => {
  assert.equal(workspaceDay("2026-10-13T16:30:00Z"), "2026-10-14");
  assert.equal(dayLabel("2026-10-14", "2026-10-14"), "Today");
  assert.equal(dayLabel("2026-10-13", "2026-10-14"), "Yesterday");
  assert.equal(dayLabel("2026-10-01", "2026-10-14"), "Thursday 1 October");
});
