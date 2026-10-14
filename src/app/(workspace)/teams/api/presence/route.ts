import { NextResponse } from "next/server";
import { requireMember } from "@/lib/workspace/session";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const { supabase } = await requireMember();
  const { error } = await supabase.rpc("touch_member_presence");
  if (error) return NextResponse.json({}, { status: 503 });
  const result = await supabase.from("member_presence").select("email,seen_at");
  return NextResponse.json({ members: result.data, now: new Date().toISOString() }, { status: result.error ? 503 : 200, headers: { "Cache-Control": "private, no-store" } });
}
