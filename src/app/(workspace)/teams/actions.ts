"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  channelInput,
  dependencyInput,
  projectRenameInput,
  importedNoteInput,
  isAdmin,
  displayNameInput,
  taskDueInput,
  messageInput,
  noteInput,
  type Message,
  positionBetween,
  projectInput,
  taskCreateInput,
  taskMoveInput,
  taskUpdateInput,
} from "@/lib/workspace/model";
import { BUCKET } from "@/lib/workspace/files";
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
  parentId: string | null = null,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = taskCreateInput.safeParse({
    projectId,
    status,
    title,
    parentId,
  });
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
    ...(input.data.parentId ? { parent_id: input.data.parentId } : {}),
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
    assignees: formData.getAll("assignees").map(String).filter(Boolean),
    labels: formData.getAll("labels").map(String),
    dueDate: formData.get("dueDate") ?? "",
  });
  if (!input.success) return failed("Check the title, priority and due date.");
  const { id, dueDate, assignees, ...fields } = input.data;
  if (assignees.some((email) => !team.some((m) => m.email === email)))
    return failed("Assign the task to team members.");
  const { data, error } = await supabase
    .from("tasks")
    // `assignee` keeps the first person for older views and reports.
    .update({
      ...fields,
      assignees,
      assignee: assignees[0] ?? null,
      due_date: dueDate,
    })
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
  if (error?.message.includes("Blocked by unfinished tasks"))
    return failed(
      "This task is blocked. Finish the tasks it waits for before moving it out of To do.",
    );
  if (error || !data) return failed("Could not move the task.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(id).success) return failed("Unknown task.");
  await removeFiles(supabase, "task_id", id);
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
  const { supabase, me } = await requireMember();
  if (!isAdmin(me)) redirect("/teams?error=admin");
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
  attachmentIds: string[] = [],
): Promise<SendResult> {
  const { supabase } = await requireMember();
  const input = messageInput.safeParse({ channelId, body, attachmentIds });
  if (!input.success)
    return {
      ok: false,
      message: "Write a message (up to 4,000 characters) or attach a file.",
    };
  // author defaults to the signed-in email; RLS rejects anything else.
  const { data, error } = await supabase
    .from("messages")
    .insert({ channel_id: input.data.channelId, body: input.data.body })
    .select("*")
    .single();
  if (error || !data) return { ok: false, message: "Could not send." };
  if (input.data.attachmentIds.length === 0)
    return { ok: true, message: { ...(data as Message), attachments: [] } };

  // Link the sender's own unsent uploads in this channel (RLS: uploader only).
  await supabase
    .from("attachments")
    .update({ message_id: data.id })
    .in("id", input.data.attachmentIds)
    .eq("channel_id", input.data.channelId)
    .is("message_id", null);
  // Touch the message so other open chats re-fetch it with its files.
  const { data: full } = await supabase
    .from("messages")
    .update({ body: input.data.body })
    .eq("id", data.id)
    .select("*, attachments(id, name, mime, size, uploaded_by, created_at)")
    .single();
  return { ok: true, message: (full ?? data) as Message };
}

/** Removes attachment rows and their stored files. */
async function removeFiles(
  supabase: Awaited<ReturnType<typeof requireMember>>["supabase"],
  column: "id" | "task_id" | "message_id",
  value: string,
) {
  const { data } = await supabase
    .from("attachments")
    .delete()
    .eq(column, value)
    .select("path");
  const paths = (data ?? []).map((row) => row.path as string);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  return paths.length;
}

export async function deleteAttachment(id: string): Promise<ActionResult> {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(id).success) return failed("Unknown file.");
  const removed = await removeFiles(supabase, "id", id);
  if (!removed) return failed("Could not remove the file.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function createNoteFromText(
  projectId: string,
  title: string,
  body: string,
): Promise<ActionResult & { id?: string }> {
  const { supabase } = await requireMember();
  const input = importedNoteInput.safeParse({ projectId, title, body });
  if (!input.success)
    return failed("Text files can hold up to 100,000 characters.");
  const { data, error } = await supabase
    .from("notes")
    .insert({
      project_id: input.data.projectId,
      title: input.data.title,
      body: input.data.body,
    })
    .select("id")
    .single();
  if (error || !data) return failed("Could not import the file.");
  revalidatePath("/teams", "layout");
  return { ok: true, id: data.id as string };
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
  await removeFiles(supabase, "message_id", id);
  return { ok: true };
}

export async function updateMyName(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, me } = await requireMember();
  const input = displayNameInput.safeParse(formData.get("displayName") ?? "");
  if (!input.success) return failed("Use 1–80 characters for your name.");
  // RLS only lets a member update their own row, and only display_name.
  const { data, error } = await supabase
    .from("members")
    .update({ display_name: input.data })
    .eq("email", me.email)
    .select("email")
    .maybeSingle();
  if (error || !data) return failed("Could not save your name.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function renameChannel(
  channelId: string,
  name: string,
  topic: string,
): Promise<ActionResult> {
  const { supabase, me } = await requireMember();
  if (!isAdmin(me)) return failed("Only admins can rename channels.");
  const input = channelInput.safeParse({ name, topic });
  if (!uuid.safeParse(channelId).success || !input.success)
    return failed("Use letters, numbers and dashes (up to 40) for the name.");
  const { data: clash } = await supabase
    .from("channels")
    .select("id")
    .eq("name", input.data.name)
    .neq("id", channelId)
    .maybeSingle();
  if (clash) return failed(`#${input.data.name} already exists.`);
  const { error } = await supabase
    .from("channels")
    .update(input.data)
    .eq("id", channelId);
  if (error) return failed("Could not rename the channel.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function setTaskDue(
  id: string,
  dueDate: string | null,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = taskDueInput.safeParse({ id, dueDate });
  if (!input.success) return failed("Could not change the due date.");
  const { error } = await supabase
    .from("tasks")
    .update({ due_date: input.data.dueDate })
    .eq("id", input.data.id);
  if (error) return failed("Could not change the due date.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function addDependency(
  taskId: string,
  blockedBy: string,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = dependencyInput.safeParse({ taskId, blockedBy });
  if (!input.success) return failed("Pick a different task.");
  const { error } = await supabase
    .from("task_dependencies")
    .insert({ task_id: input.data.taskId, blocked_by: input.data.blockedBy });
  if (error?.message.includes("block each other"))
    return failed("These tasks would block each other.");
  if (error && error.code !== "23505")
    return failed("Could not link the tasks.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function removeDependency(
  taskId: string,
  blockedBy: string,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = dependencyInput.safeParse({ taskId, blockedBy });
  if (!input.success) return failed("Unknown link.");
  const { error } = await supabase
    .from("task_dependencies")
    .delete()
    .eq("task_id", input.data.taskId)
    .eq("blocked_by", input.data.blockedBy);
  if (error) return failed("Could not remove the link.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function renameProject(
  id: string,
  name: string,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const input = projectRenameInput.safeParse({ id, name });
  if (!input.success) return failed("Project names need 1–120 characters.");
  const { error } = await supabase
    .from("projects")
    .update({ name: input.data.name })
    .eq("id", input.data.id);
  if (error) return failed("Could not rename the project.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function renameNote(
  id: string,
  title: string,
): Promise<ActionResult> {
  const { supabase } = await requireMember();
  const clean = title.trim();
  if (!uuid.safeParse(id).success || !clean || clean.length > 200)
    return failed("Page titles need 1–200 characters.");
  const { error } = await supabase
    .from("notes")
    .update({ title: clean })
    .eq("id", id);
  if (error) return failed("Could not rename the page.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

/** Deletes a page without redirecting (used from the sidebar). */
export async function removeNote(id: string): Promise<ActionResult> {
  const { supabase } = await requireMember();
  if (!uuid.safeParse(id).success) return failed("Unknown page.");
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) return failed("Could not delete the page.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}

export async function deleteChannel(id: string): Promise<ActionResult> {
  const { supabase, me } = await requireMember();
  if (!isAdmin(me)) return failed("Only admins can delete channels.");
  if (!uuid.safeParse(id).success) return failed("Unknown channel.");
  // Stored files first; the messages and file rows go with the channel.
  const { data: files } = await supabase
    .from("attachments")
    .select("path")
    .eq("channel_id", id);
  const paths = (files ?? []).map((f) => f.path as string);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  const { data, error } = await supabase
    .from("channels")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) return failed("Could not delete the channel.");
  revalidatePath("/teams", "layout");
  return { ok: true };
}
