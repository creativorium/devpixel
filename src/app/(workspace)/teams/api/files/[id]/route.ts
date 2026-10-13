import { NextResponse } from "next/server";
import { z } from "zod";
import { BUCKET, disposition, isImage } from "@/lib/workspace/files";
import { requireMember } from "@/lib/workspace/session";

export const dynamic = "force-dynamic";

// Streams a stored file to a signed-in member. Only real images are shown inline;
// everything else downloads, and a sandbox CSP stops any served file running script.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase } = await requireMember();
  const id = (await params).id;
  if (!z.uuid().safeParse(id).success)
    return new NextResponse("Not found", { status: 404 });

  const { data: row } = await supabase
    .from("attachments")
    .select("path, name, mime")
    .eq("id", id)
    .maybeSingle();
  if (!row) return new NextResponse("Not found", { status: 404 });

  const { data: blob, error } = await supabase.storage
    .from(BUCKET)
    .download(row.path);
  if (error || !blob) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(blob.stream(), {
    headers: {
      "Content-Type": isImage(row.mime) ? row.mime : "application/octet-stream",
      "Content-Length": String(blob.size),
      "Content-Disposition": disposition(row.name, row.mime),
      "Cache-Control": "private, max-age=3600",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
