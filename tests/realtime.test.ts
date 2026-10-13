import test from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subscribeToChanges } from "../src/lib/workspace/realtime";

test("concurrent bells and effect remounts own independent channels", async () => {
  // Match the SDK's topic reuse and prohibition on listeners after subscribe.
  class Channel {
    subscribed = false;
    listener = () => {};
    on(_event: string, options: unknown, listener: () => void) {
      assert.equal(this.subscribed, false, "listener added after subscribe");
      assert.deepEqual(options, {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: "recipient=eq.member@example.com",
      });
      this.listener = listener;
      return this;
    }
    subscribe() {
      this.subscribed = true;
      return this;
    }
  }
  const channels = new Map<string, Channel>();
  const removed: Channel[] = [];
  const finishRemoval: (() => void)[] = [];
  const client = {
    channel(topic: string) {
      if (!channels.has(topic)) channels.set(topic, new Channel());
      return channels.get(topic)!;
    },
    removeChannel(channel: Channel) {
      removed.push(channel);
      return new Promise<void>((resolve) =>
        finishRemoval.push(() => {
          for (const [topic, current] of channels)
            if (current === channel) channels.delete(topic);
          resolve();
        }),
      );
    },
  } as unknown as Pick<SupabaseClient, "channel" | "removeChannel">;
  const calls = [0, 0, 0];
  const mount = (index: number) =>
    subscribeToChanges(
      client,
      "notifications",
      "recipient=eq.member@example.com",
      () => {
        calls[index]++;
      },
    );

  const desktop = mount(0);
  const mobile = mount(1);
  assert.equal(channels.size, 2);
  for (const channel of channels.values()) channel.listener();
  assert.deepEqual(calls, [1, 1, 0]);

  desktop();
  const remount = mount(2); // Cleanup has started, but has not finished yet.
  assert.equal(channels.size, 3);
  finishRemoval.shift()!();
  assert.equal(channels.size, 2);
  for (const channel of channels.values()) channel.listener();
  assert.deepEqual(calls, [1, 2, 1]);

  mobile();
  remount();
  for (const finish of finishRemoval) finish();
  assert.equal(new Set(removed).size, 3);
  assert.equal(channels.size, 0);
});
