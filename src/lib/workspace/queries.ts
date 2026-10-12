import { cache } from "react";
import { z } from "zod";
import type { Note, Project, Task } from "./model";
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
