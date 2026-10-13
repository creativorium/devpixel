import { NextResponse } from "next/server";
import { z } from "zod";
import { requireMember } from "@/lib/workspace/session";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

export type FeedItem =
  | {
      kind: "comment";
      id: string;
      author: string;
      body: string;
      at: string;
      edited: boolean;
    }
  | {
      kind: "activity";
      id: string;
      author: string;
      type: string;
      detail: Record<string, unknown>;
      at: string;
    };

// A task's comments and change history, oldest first.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { supabase } = await requireMember();
  const taskId = (await params).taskId;
  if (!z.uuid().safeParse(taskId).success)
    return NextResponse.json({ items: [] }, { status: 400, headers });
  const [comments, activity] = await Promise.all([
    supabase
      .from("task_comments")
      .select("id, author, body, created_at, edited_at")
      .eq("task_id", taskId)
      .order("created_at")
      .limit(200),
    supabase
      .from("task_activity")
      .select("id, actor, kind, detail, created_at")
      .eq("task_id", taskId)
      .neq("kind", "comment")
      .order("created_at")
      .limit(200),
  ]);
  if (comments.error && activity.error)
    return NextResponse.json({ items: [], unavailable: true }, { headers });
  const items: FeedItem[] = [
    ...(comments.data ?? []).map((c) => ({
      kind: "comment" as const,
      id: c.id as string,
      author: c.author as string,
      body: c.body as string,
      at: c.created_at as string,
      edited: Boolean(c.edited_at),
    })),
    ...(activity.data ?? []).map((a) => ({
      kind: "activity" as const,
      id: String(a.id),
      author: a.actor as string,
      type: a.kind as string,
      detail: (a.detail ?? {}) as Record<string, unknown>,
      at: a.created_at as string,
    })),
  ].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  return NextResponse.json({ items }, { headers });
}
