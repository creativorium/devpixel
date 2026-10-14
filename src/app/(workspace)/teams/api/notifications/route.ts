import { NextResponse } from "next/server";
import { requireMember } from "@/lib/workspace/session";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

export type Notification = {
  id: number;
  actor: string;
  kind: "mention" | "assigned" | "comment" | "direct";
  project_id: string | null;
  task_id: string | null;
  channel_id: string | null;
  preview: string;
  created_at: string;
  read_at: string | null;
};

// The signed-in member's latest notifications (RLS limits rows to their own).
export async function GET() {
  const { supabase } = await requireMember();
  const [list, unread] = await Promise.all([
    supabase
      .from("notifications")
      .select(
        "id, actor, kind, project_id, task_id, channel_id, preview, created_at, read_at",
      )
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
  ]);
  if (list.error || unread.error) {
    return NextResponse.json(
      { error: "Could not load notifications. Please try again." },
      { status: 503, headers },
    );
  }
  return NextResponse.json(
    { items: (list.data ?? []) as Notification[], unread: unread.count ?? 0 },
    { headers },
  );
}
