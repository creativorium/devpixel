import { NextResponse, type NextRequest } from "next/server";
import { requireMember } from "@/lib/workspace/session";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

export type SearchHit =
  | {
      kind: "task";
      id: string;
      title: string;
      status: string;
      projectId: string;
      project: string;
    }
  | {
      kind: "page";
      id: string;
      title: string;
      projectId: string;
      project: string;
    };

/** Escapes LIKE wildcards so a search for "50%" means the text "50%". */
const likeSafe = (q: string) => q.replace(/[\\%_]/g, (c) => `\\${c}`);

// Quick switcher search over task and page titles in active projects.
export async function GET(request: NextRequest) {
  const { supabase } = await requireMember();
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ hits: [] }, { headers });
  const pattern = `%${likeSafe(q)}%`;
  const [tasks, notes] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, status, project_id, projects!inner(name, archived_at)",
      )
      .ilike("title", pattern)
      .is("projects.archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("notes")
      .select("id, title, project_id, projects!inner(name, archived_at)")
      .ilike("title", pattern)
      .is("projects.archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);
  type Row = {
    id: string;
    title: string;
    status?: string;
    project_id: string;
    projects: { name: string };
  };
  const hits: SearchHit[] = [
    ...((tasks.data ?? []) as unknown as Row[]).map((t) => ({
      kind: "task" as const,
      id: t.id,
      title: t.title,
      status: t.status ?? "todo",
      projectId: t.project_id,
      project: t.projects.name,
    })),
    ...((notes.data ?? []) as unknown as Row[]).map((n) => ({
      kind: "page" as const,
      id: n.id,
      title: n.title,
      projectId: n.project_id,
      project: n.projects.name,
    })),
  ];
  return NextResponse.json({ hits }, { headers });
}
