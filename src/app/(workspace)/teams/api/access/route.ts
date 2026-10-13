import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireMember } from "@/lib/workspace/session";

const input = z.object({ kind: z.enum(["project", "channel"]), id: z.uuid() });
const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  const { supabase } = await requireMember();
  const parsed = input.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) return NextResponse.json({}, { status: 400, headers });
  const { data, error } = await supabase
    .from(parsed.data.kind === "project" ? "projects" : "channels")
    .select("id")
    .eq("id", parsed.data.id)
    .maybeSingle();
  return NextResponse.json(
    { allowed: Boolean(data) },
    { status: error ? 503 : data ? 200 : 404, headers },
  );
}
