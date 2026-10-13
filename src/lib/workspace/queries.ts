import { cache } from "react";
import { z } from "zod";
import type { Channel, Message, Note, Project, Task } from "./model";
import { requireMember } from "./session";

const uuid = z.uuid();

export const getProject = cache(async (id: string) => {
  if (!uuid.safeParse(id).success) return null;
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as Project | null;
});

export async function getTasks(projectId: string) {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position");
  return (data ?? []) as Task[];
}

export const getNotes = cache(async (projectId: string) => {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("notes")
    .select("id, project_id, title, updated_by, updated_at")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  return (data ?? []) as Pick<
    Note,
    "id" | "project_id" | "title" | "updated_by" | "updated_at"
  >[];
});

export type NoteSummary = Pick<
  Note,
  "id" | "project_id" | "title" | "updated_by" | "updated_at"
>;
export type SidebarProject = Pick<Project, "id" | "name" | "archived_at"> & {
  notes: Pick<Note, "id" | "title">[];
};

/** Everything the sidebar needs, in one round trip. */
export const getSidebar = cache(async () => {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("projects")
    .select("id, name, archived_at, notes(id, title)")
    .order("created_at", { ascending: true })
    .order("title", { referencedTable: "notes" });
  return (data ?? []) as SidebarProject[];
});

export type TaskWithProject = Task & { projects: { name: string } | null };

/** Open tasks assigned to the signed-in member, across active projects. */
export async function getMyTasks(email: string) {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("tasks")
    .select("*, projects!inner(name, archived_at)")
    .eq("assignee", email)
    .neq("status", "done")
    .is("projects.archived_at", null)
    .order("due_date", { ascending: true, nullsFirst: false });
  return (data ?? []) as TaskWithProject[];
}

export async function getRecentNotes(limit = 6) {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("notes")
    .select("id, project_id, title, updated_by, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as NoteSummary[];
}

export async function getNote(projectId: string, noteId: string) {
  if (!uuid.safeParse(noteId).success) return null;
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("project_id", projectId)
    .maybeSingle();
  return data as Note | null;
}

export const getChannels = cache(async () => {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("channels")
    .select("id, name, topic, created_by, created_at")
    .order("name");
  return (data ?? []) as Channel[];
});

export const getChannel = cache(async (id: string) => {
  if (!uuid.safeParse(id).success) return null;
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("channels")
    .select("id, name, topic, created_by, created_at")
    .eq("id", id)
    .maybeSingle();
  return data as Channel | null;
});

export const MESSAGE_PAGE = 200;

/** The latest messages in a channel, oldest first. */
export async function getMessages(channelId: string) {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(MESSAGE_PAGE);
  return ((data ?? []) as Message[]).reverse();
}

/** Messages created, edited or deleted after a cursor (for polling). */
export async function getMessageChanges(channelId: string, since: string) {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .gt("updated_at", since)
    .order("updated_at")
    .limit(MESSAGE_PAGE);
  return (data ?? []) as Message[];
}
