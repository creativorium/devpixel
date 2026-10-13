"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  channelInput,
  messageInput,
  noteInput,
  type Message,
  positionBetween,
  projectInput,
  taskCreateInput,
  taskMoveInput,
  taskUpdateInput,
} from "@/lib/workspace/model";
import { requireMember } from "@/lib/workspace/session";

// Every action re-checks membership: Server Actions are reachable by direct POST.

export type ActionResult = { ok: true } | { ok: false; message: string };
const failed = (message: string): ActionResult => ({ ok: false, message });
const uuid = z.uuid();

export async function createProject(formData: FormData) {
  const { supabase } = await requireMember();
  const input = projectInput.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!input.success) redirect("/teams?error=project");
  const { data, error } = await supabase
    .from("projects")
    .insert(input.data)
    .select("id")
    .single();
  if (error || !data) redirect("/teams?error=project");
  revalidatePath("/teams", "layout");
  redirect(`/teams/p/${data.id}`);
}

export async function setProjectArchived(projectId: string, archived: boolean) {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(projectId).success) return failed("Unknown project.");
  const { error } = await supabase
    .from("projects")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", projectId);
  if (error) return failed("Could not update the project.");
  revalidatePath("/teams", "layout");
  return { ok: true } as const;
}

export async function createTask(
  projectId: string,
  status: string,
  title: string,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = taskCreateInput.safeParse({ projectId, status, title });
  if (!input.success)
    return failed("Give the task a title (up to 200 characters).");
  const { data: last } = await supabase
    .from("tasks")
    .select("position")
    .eq("project_id", input.data.projectId)
    .eq("status", input.data.status)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase.from("tasks").insert({
    project_id: input.data.projectId,
    title: input.data.title,
    status: input.data.status,
    position: positionBetween(last?.position),
  });
  if (error) return failed("Could not add the task.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function updateTask(formData: FormData): Promise<ActionResult> {
  const { supabase, team } = await requireMember();
  const input = taskUpdateInput.safeParse({
    id: formData.get("id"),
    title: formData.get("title") ?? "",
    details: formData.get("details") ?? "",
    priority: formData.get("priority"),
    assignee: formData.get("assignee") ?? "",
    dueDate: formData.get("dueDate") ?? "",
  });
  if (!input.success) return failed("Check the title, priority and due date.");
  const { id, dueDate, assignee, ...fields } = input.data;
  if (assignee && !team.some((m) => m.email === assignee))
    return failed("Assign the task to a team member.");
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...fields, assignee, due_date: dueDate })
    .eq("id", id)
    .select("project_id")
    .single();
  if (error || !data) return failed("Could not save the task.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function moveTask(
  id: string,
  status: string,
  position: number,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = taskMoveInput.safeParse({ id, status, position });
  if (!input.success) return failed("Could not move the task.");
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: input.data.status, position: input.data.position })
    .eq("id", input.data.id)
    .select("project_id")
    .single();
  if (error || !data) return failed("Could not move the task.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(id).success) return failed("Unknown task.");
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .select("project_id")
    .single();
  if (error || !data) return failed("Could not delete the task.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function createNote(projectId: string) {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(projectId).success) redirect("/teams");
  const { data, error } = await supabase
    .from("notes")
    .insert({ project_id: projectId, title: "Untitled note" })
    .select("id")
    .single();
  if (error || !data) redirect(`/teams/p/${projectId}/notes?error=create`);
  revalidatePath("/teams", "layout");
  redirect(`/teams/p/${projectId}/notes/${data.id}?edit=1`);
}

export async function saveNote(
  id: string,
  title: string,
  body: string,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = noteInput.safeParse({ title, body });
  if (!uuid.safeParse(id).success || !input.success)
    return failed(
      "Give the note a title (notes can hold up to 100,000 characters).",
    );
  const { data, error } = await supabase
    .from("notes")
    .update(input.data)
    .eq("id", id)
    .select("project_id")
    .single();
  if (error || !data) return failed("Could not save the note.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function deleteNote(id: string) {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(id).success) redirect("/teams");
  const { data } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .select("project_id")
    .single();
  if (!data) redirect("/teams");
  revalidatePath("/teams", "layout");
  redirect(`/teams/p/${data.project_id}/notes`);
}

export async function createChannel(formData: FormData) {
  const { supabase } = await requireMember();
  const input = channelInput.safeParse({
    name: formData.get("name") ?? "",
    topic: formData.get("topic") ?? "",
  });
  if (!input.success) redirect("/teams?error=channel");
  const { data: existing } = await supabase
    .from("channels")
    .select("id")
    .eq("name", input.data.name)
    .maybeSingle();
  if (existing) redirect(`/teams/c/${existing.id}`);
  const { data, error } = await supabase
    .from("channels")
    .insert(input.data)
    .select("id")
    .single();
  if (error || !data) redirect("/teams?error=channel");
  revalidatePath("/teams", "layout");
  redirect(`/teams/c/${data.id}`);
}

export type SendResult =
  { ok: true; message: Message } | { ok: false; message: string };

export async function sendMessage(
  channelId: string,
  body: string,
): Promise<SendResult> {
  const { supabase } = await requireMember();
  const input = messageInput.safeParse({ channelId, body });
  if (!input.success)
    return { ok: false, message: "Messages need 1–4,000 characters." };
  // author defaults to the signed-in email; RLS rejects anything else.
  const { data, error } = await supabase
    .from("messages")
    .insert({ channel_id: input.data.channelId, body: input.data.body })
    .select("*")
    .single();
  if (error || !data) return { ok: false, message: "Could not send." };
  return { ok: true, message: data as Message };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(id).success) return failed("Unknown message.");
  // Soft delete so other open chats see the removal on their next poll.
  const { data, error } = await supabase
    .from("messages")
    .update({ body: "", deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) return failed("You can only delete your own messages.");
  return { ok: true };
}
