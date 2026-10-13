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

export type TaskInProject = Task & { projects: { name: string } };

/** All tasks in active projects (for the workspace calendar and dashboard). */
export async function getAllTasks() {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("tasks")
    .select("*, projects!inner(name, archived_at)")
    .is("projects.archived_at", null)
    .order("position");
  return (data ?? []) as TaskInProject[];
}

export type Mentioned =
  | {
      kind: "message";
      id: string;
      at: string;
      text: string;
      author: string;
      channelId: string;
      channelName: string;
    }
  | {
      kind: "task";
      id: string;
      at: string;
      text: string;
      author: string;
      projectId: string;
      projectName: string;
    };

/** Recent chat messages and open task descriptions that @mention this member. */
export async function getMentions(email: string, limit = 8) {
  const { supabase } = await requireMember();
  const token = `%](${email})%`;
  const [messages, tasks] = await Promise.all([
    supabase
      .from("messages")
      .select("id, body, author, created_at, channel_id, channels(name)")
      .is("deleted_at", null)
      .ilike("body", token)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("tasks")
      .select(
        "id, title, created_by, updated_at, project_id, projects!inner(name, archived_at)",
      )
      .neq("status", "done")
      .is("projects.archived_at", null)
      .ilike("details", token)
      .order("updated_at", { ascending: false })
      .limit(limit),
  ]);
  const found: Mentioned[] = [
    ...(
      (messages.data ?? []) as unknown as {
        id: string;
        body: string;
        author: string;
        created_at: string;
        channel_id: string;
        channels: { name: string } | null;
      }[]
    ).map((m) => ({
      kind: "message" as const,
      id: m.id,
      at: m.created_at,
      text: m.body,
      author: m.author,
      channelId: m.channel_id,
      channelName: m.channels?.name ?? "",
    })),
    ...(
      (tasks.data ?? []) as unknown as {
        id: string;
        title: string;
        created_by: string;
        updated_at: string;
        project_id: string;
        projects: { name: string };
      }[]
    ).map((t) => ({
      kind: "task" as const,
      id: t.id,
      at: t.updated_at,
      text: t.title,
      author: t.created_by,
      projectId: t.project_id,
      projectName: t.projects.name,
    })),
  ];
  return found.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
}
