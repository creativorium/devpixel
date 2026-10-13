"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Supabase Realtime in the browser: pushes new chat messages and notifications
// instantly. Row level security still applies, so people only receive rows they
// may read. If the connection fails, the existing polling keeps things working.

const RealtimeContext = createContext<SupabaseClient | null>(null);

export function RealtimeProvider({
  config,
  children,
}: {
  config: { url: string; key: string } | null;
  children: React.ReactNode;
}) {
  const [client] = useState(() =>
    config && typeof window !== "undefined"
      ? createBrowserClient(config.url, config.key)
      : null,
  );
  return <RealtimeContext value={client}>{children}</RealtimeContext>;
}

/**
 * Calls `onChange` whenever a row in `table` matching `filter` (PostgREST syntax,
 * e.g. "channel_id=eq.<id>") is inserted or updated.
 */
export function useRealtime(
  table: "messages" | "notifications",
  filter: string | null,
  onChange: () => void,
) {
  const client = useContext(RealtimeContext);
  const handler = useRef(onChange);
  useEffect(() => {
    handler.current = onChange;
  });
  useEffect(() => {
    if (!client || !filter) return;
    const channel = client
      .channel(`ws-${table}-${filter}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        () => handler.current(),
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [client, table, filter]);
}
