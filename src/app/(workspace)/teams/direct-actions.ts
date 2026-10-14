"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/workspace/session";
import { z } from "zod";
import { BUCKET } from "@/lib/workspace/files";

export async function addConversationMembers(id: string, emails: string[]) {
  const { supabase, team } = await requireMember();
  if (
    !z.uuid().safeParse(id).success ||
    !Array.isArray(emails) ||
    !emails.length ||
    emails.length > 4 ||
    emails.some((email) => !team.some((m) => m.email === email))
  )
    return { error: "Choose up to four existing teammates." };
  const { error } = await supabase.rpc("add_conversation_members", {
    conversation: id,
    emails,
  });
  if (error)
    return {
      error:
        "Could not add people. Check the five-person limit, your access and migration 24.",
    };
  revalidatePath("/teams", "layout");
  return { ok: true };
}
export async function deletePrivateConversation(id: string) {
  const { supabase, me } = await requireMember();
  if (!z.uuid().safeParse(id).success)
    return { error: "Unknown conversation." };
  const { data: chat } = await supabase
    .from("channels")
    .select("direct_members")
    .eq("id", id)
    .maybeSingle();
  if (!chat?.direct_members?.includes(me.email))
    return { error: "Conversation not available." };
  const { data: files, error: filesError } = await supabase
    .from("attachments")
    .select("path")
    .eq("channel_id", id);
  if (filesError)
    return { error: "Could not check chat attachments. Try again." };
  if (files?.length) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove(files.map((f) => f.path));
    if (error)
      return {
        error:
          "Could not remove chat attachments. Ask their uploader or a participating admin to delete this chat.",
      };
  }
  const { error } = await supabase.rpc("delete_private_conversation", {
    conversation: id,
  });
  if (error)
    return {
      error: "Could not delete the chat. Check access and apply migration 24.",
    };
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function startPrivateConversation(emails: string[]) {
  const { supabase, me, team } = await requireMember();
  if (
    !Array.isArray(emails) ||
    emails.length < 1 ||
    emails.length > 4 ||
    emails.some(
      (email) =>
        email === me.email || !team.some((member) => member.email === email),
    )
  ) {
    return {
      error: "Choose up to four teammates (five people including you).",
    };
  }
  if (emails.length === 1) return startDirectMessage(emails[0]);
  const { data, error } = await supabase.rpc("start_private_conversation", {
    other_emails: emails,
  });
  if (error || typeof data !== "string")
    return {
      error:
        "Could not open the group. Apply the private groups migration and try again.",
    };
  revalidatePath("/teams", "layout");
  return { id: data };
}

export async function startDirectMessage(email: string) {
  const { supabase, me, team } = await requireMember();
  if (email === me.email || !team.some((member) => member.email === email)) {
    return { error: "Choose another team member." };
  }
  const { data, error } = await supabase.rpc("start_direct_message", {
    other_email: email,
  });
  if (error || typeof data !== "string") {
    return {
      error:
        "Could not open the chat. Check that the direct messages migration has been applied, then try again.",
    };
  }
  revalidatePath("/teams", "layout");
  return { id: data };
}
