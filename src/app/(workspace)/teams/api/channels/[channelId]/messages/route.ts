import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getMessageChanges } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export const dynamic = "force-dynamic";

const query = z.object({
  channelId: z.uuid(),
  since: z.iso.datetime({ offset: true }),
});
const headers = { "Cache-Control": "private, no-store" };

// Polled by open chats every few seconds; returns messages changed after `since`.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> },
) {
  await requireMember();
  const input = query.safeParse({
    channelId: (await params).channelId,
    since: request.nextUrl.searchParams.get("since"),
  });
  if (!input.success)
    return NextResponse.json({ messages: [] }, { status: 400, headers });
  const messages = await getMessageChanges(
    input.data.channelId,
    input.data.since,
  );
  return NextResponse.json({ messages }, { headers });
}
