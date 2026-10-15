"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/workspace/session";
import { isAdmin } from "@/lib/workspace/model";
import {
  timeLogInput,
  type TimeLog,
  type TimeReportRow,
} from "@/lib/workspace/time-logs";

export async function setTimeTracking(projectId: string, enabled: boolean) {
  const { supabase, me } = await requireMember();
  if (
    !isAdmin(me) ||
    !z.uuid().safeParse(projectId).success ||
    typeof enabled !== "boolean"
  )
    return { error: "Only admins can change time logging." };
  const { data, error } = await supabase
    .from("projects")
    .update({ time_tracking_enabled: enabled })
    .eq("id", projectId)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      error:
        "Could not update time logging. Apply the time logs migration first.",
    };
  revalidatePath(`/teams/p/${projectId}`, "layout");
  return { ok: true };
}

export async function getTaskTime(taskId: string) {
  const { supabase } = await requireMember();
  if (!z.uuid().safeParse(taskId).success)
    return { enabled: false, rows: [] as TimeLog[] };
  const { data: enabled, error: flagError } = await supabase.rpc(
    "task_time_enabled",
    { task: taskId },
  );
  if (flagError || !enabled) return { enabled: false, rows: [] as TimeLog[] };
  const rows: TimeLog[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from("task_time_logs")
      .select("*")
      .eq("task_id", taskId)
      .order("work_date", { ascending: false })
      .order("id")
      .range(offset, offset + 999);
    if (error)
      return {
        enabled: true,
        rows: [] as TimeLog[],
        error: "Could not load time logs.",
      };
    rows.push(...(data as TimeLog[]));
    if (data.length < 1000) break;
  }
  return { enabled: true, rows };
}

export async function saveTimeLog(value: unknown, editing: boolean) {
  const { supabase } = await requireMember();
  const parsed = timeLogInput.safeParse(value);
  if (!parsed.success)
    return {
      error:
        parsed.error.issues.some(issue => issue.path[0] === "note")
          ? "Notes must be 2000 characters or fewer. You can also leave them blank."
          : "Enter a valid work date and a duration between 1 minute and 24 hours.",
    };
  const input = parsed.data;
  const fields = {
    work_date: input.workDate,
    minutes: input.minutes,
    note: input.note,
  };
  const query = editing
    ? supabase
        .from("task_time_logs")
        .update(fields)
        .eq("id", input.id)
        .eq("task_id", input.taskId)
    : supabase
        .from("task_time_logs")
        .insert({ id: input.id, task_id: input.taskId, ...fields });
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data)
    return {
      error:
        error?.code === "23514" && !input.note
          ? "Blank notes need the optional time-log notes database update. Add a note for now, or ask an admin to apply it."
          : "Could not save. Check whether time logging is still enabled and you have access. Refresh before retrying if the connection failed.",
    };
  revalidatePath("/teams/dashboard");
  return { ok: true };
}

export async function deleteTimeLog(id: string) {
  const { supabase } = await requireMember();
  if (!z.uuid().safeParse(id).success) return { error: "Unknown time log." };
  const { data, error } = await supabase
    .from("task_time_logs")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    return {
      error:
        "Could not remove this log. Check your access and project setting.",
    };
  revalidatePath("/teams/dashboard");
  return { ok: true };
}

export async function getTimeReport(
  from: string,
  to: string,
  projectId?: string,
) {
  const { supabase } = await requireMember();
  if (
    (projectId !== undefined && !z.uuid().safeParse(projectId).success) ||
    !z.iso.date().safeParse(from).success ||
    !z.iso.date().safeParse(to).success ||
    from > to ||
    Date.parse(to) - Date.parse(from) > 366 * 86400000
  )
    return {
      error: "Choose a date range of up to one year.",
      rows: [] as TimeReportRow[],
    };
  const rows: TimeReportRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    let query = supabase
      .from("task_time_logs")
      .select("*, tasks!inner(title,project_id,projects(name))")
      .gte("work_date", from)
      .lte("work_date", to)
      .order("work_date", { ascending: false })
      .order("id")
      .range(offset, offset + 999);
    if (projectId) query = query.eq("tasks.project_id", projectId);
    const { data, error } = await query;
    if (error)
      return {
        error:
          "Could not load time logs. Check the time logs migration and try again.",
        rows: [] as TimeReportRow[],
      };
    rows.push(...(data as unknown as TimeReportRow[]));
    if (data.length < 1000) break;
  }
  return { rows };
}
