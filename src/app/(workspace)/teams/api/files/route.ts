import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  allowedMime,
  BUCKET,
  isImage,
  MAX_FILE_BYTES,
  safeFileName,
  sniffImage,
  type Attachment,
} from "@/lib/workspace/files";
import { requireMember } from "@/lib/workspace/session";

export const dynamic = "force-dynamic";

const target = z.union([
  z.object({ taskId: z.uuid(), channelId: z.undefined() }),
  z.object({ channelId: z.uuid(), taskId: z.undefined() }),
]);
const headers = { "Cache-Control": "private, no-store" };
const fail = (message: string, status = 400) =>
  NextResponse.json({ message }, { status, headers });

// Upload one file for a task or a chat channel. Storage and table rows are both
// protected by RLS, so only team members can write or read them.
export async function POST(request: Request) {
  const { supabase } = await requireMember();
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_FILE_BYTES + 64 * 1024)
    return fail("Files can be up to 4 MB.", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Upload one file at a time.");
  }
  const file = form.get("file");
  const where = target.safeParse({
    taskId: form.get("taskId") ?? undefined,
    channelId: form.get("channelId") ?? undefined,
  });
  if (!(file instanceof File) || !where.success)
    return fail("Upload one file at a time.");
  if (file.size === 0 || file.size > MAX_FILE_BYTES)
    return fail("Files can be up to 4 MB.", 413);

  let mime = allowedMime(file.name, file.type);
  if (!mime)
    return fail(
      "That file type is not allowed. Use images, PDF, text, CSV, Office files or ZIP.",
      415,
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (isImage(mime)) {
    const real = sniffImage(bytes);
    if (!real) return fail("That image could not be read.", 415);
    mime = real;
  }

  const name = file.name.trim().slice(0, 200) || "file";
  const folder = where.data.taskId
    ? `tasks/${where.data.taskId}`
    : `channels/${where.data.channelId}`;
  const path = `${folder}/${randomUUID()}-${safeFileName(name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (uploadError)
    return fail(
      "Could not store the file. Check the attachments migration has been run (WORKSPACE.md).",
      503,
    );

  const { data, error } = await supabase
    .from("attachments")
    .insert({
      path,
      name,
      mime,
      size: file.size,
      task_id: where.data.taskId ?? null,
      channel_id: where.data.channelId ?? null,
    })
    .select("id, name, mime, size, uploaded_by, created_at")
    .single();
  if (error || !data) {
    await supabase.storage.from(BUCKET).remove([path]);
    return fail("Could not save the file details.", 503);
  }
  return NextResponse.json(
    { attachment: data as Attachment },
    { status: 201, headers },
  );
}
