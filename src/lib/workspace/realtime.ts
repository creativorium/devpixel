import type { SupabaseClient } from "@supabase/supabase-js";

/** Each effect owns its channel, including while an old channel is leaving. */
export function subscribeToChanges(
  client: Pick<SupabaseClient, "channel" | "removeChannel">,
  table: "messages" | "notifications",
  filter: string,
  onChange: () => void,
) {
  // Supabase reuses channels by topic. Shared topics collide when the mobile
  // and desktop bells mount together, or an effect restarts before cleanup ends.
  const channel = client
    .channel(`ws-${table}-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter },
      onChange,
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
