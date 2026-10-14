import { z } from "zod";
import type { Attachment } from "./files";

export const statuses = [
  { id: "todo", label: "To do", color: "#e87ba4" },
  { id: "in_progress", label: "In progress", color: "#2a78d6" },
  { id: "review", label: "Review", color: "#eda100" },
  { id: "done", label: "Done", color: "#1baf7a" },
] as const;
export type TaskStatus = string;
export type StatusDefinition = { id: string; label: string; color: string };
export const statusIdInput = z
  .string()
  .regex(
    /^(todo|in_progress|review|done|custom_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/,
  );
export const statusDefinitionInput = z.object({
  id: statusIdInput,
  label: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export function projectStatuses(
  project?: { statuses?: unknown } | null,
): StatusDefinition[] {
  const parsed = z
    .array(statusDefinitionInput)
    .min(4)
    .max(20)
    .safeParse(project?.statuses);
  if (!parsed.success) return [...statuses];
  const ids = parsed.data.map((s) => s.id);
  const names = parsed.data.map((s) => s.label.toLowerCase());
  if (
    new Set(ids).size !== ids.length ||
    new Set(names).size !== names.length ||
    !statuses.every((s) => ids.includes(s.id))
  )
    return [...statuses];
  return parsed.data;
}
export function statusDefinition(
  id: string,
  options: readonly StatusDefinition[] = statuses,
): StatusDefinition {
  return (
    options.find((s) => s.id === id) ?? {
      id,
      label: "Other status",
      color: "#64748b",
    }
  );
}
export function allProjectStatuses(
  projects: { statuses?: unknown }[],
): StatusDefinition[] {
  return [
    ...statuses,
    ...projects.flatMap((p) =>
      projectStatuses(p).filter((s) => s.id.startsWith("custom_")),
    ),
  ];
}
export const statusIds = statuses.map((s) => s.id) as [
  TaskStatus,
  ...TaskStatus[],
];

export const priorities = ["low", "medium", "high", "urgent"] as const;

/** Task categories, ClickUp-style. Text always accompanies the colour. */
export const labels = [
  { id: "bug", label: "Bug", color: "#c2410c" },
  { id: "blocker", label: "Blocker", color: "#b42318" },
  { id: "feature", label: "Feature", color: "#2a78d6" },
  { id: "improvement", label: "Improvement", color: "#0f8a5f" },
  { id: "design", label: "Design", color: "#7a3fd1" },
  { id: "content", label: "Content", color: "#8a6100" },
  { id: "client", label: "Client request", color: "#be3a7a" },
] as const;
export type TaskLabel = (typeof labels)[number]["id"];
export const labelIds = labels.map((l) => l.id) as [TaskLabel, ...TaskLabel[]];

/** Everyone on a task (new list, falling back to the original single assignee). */
export function taskAssignees(task: {
  assignees?: string[];
  assignee: string | null;
}) {
  if (task.assignees && task.assignees.length) return task.assignees;
  return task.assignee ? [task.assignee] : [];
}

/** Ids of unfinished tasks this task waits for. */
export function openBlockers(
  task: { blockers?: { blocked_by: string }[] },
  all: { id: string; status: string }[],
) {
  const ids = new Set((task.blockers ?? []).map((b) => b.blocked_by));
  return all.filter((t) => ids.has(t.id) && t.status !== "done");
}

/** All descendants of a task (subtasks, their subtasks, ...). */
export function descendants<
  T extends { id: string; parent_id?: string | null },
>(id: string, all: T[]): T[] {
  const out: T[] = [];
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    for (const t of all)
      if (t.parent_id === current && !out.includes(t)) {
        out.push(t);
        queue.push(t.id);
      }
  }
  return out;
}

export const dependencyInput = z
  .object({ taskId: z.uuid(), blockedBy: z.uuid() })
  .refine((d) => d.taskId !== d.blockedBy);
export const projectRenameInput = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
});
export type TaskPriority = (typeof priorities)[number];

export type Member = {
  email: string;
  display_name: string;
  role?: "admin" | "member";
};
export const isAdmin = (member: Member | null | undefined) =>
  member?.role === "admin";
export type Project = {
  time_tracking_enabled?: boolean;
  visible_to?: string[] | null;
  statuses?: StatusDefinition[];
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  archived_at: string | null;
};
export type Task = {
  logged_minutes?: number;
  id: string;
  project_id: string;
  title: string;
  details: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  assignees?: string[];
  labels?: TaskLabel[];
  parent_id?: string | null;
  blockers?: { blocked_by: string }[];
  due_date: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  attachments?: Attachment[];
};
export type Note = {
  id: string;
  project_id: string;
  title: string;
  body: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

const id = z.uuid();
const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .transform((v) => v.trim());
const requiredText = (max: number) => z.string().trim().min(1).max(max);

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const projectInput = z.object({
  name: requiredText(120),
  description: optionalText(2000).default(""),
});

export const taskCreateInput = z.object({
  projectId: id,
  title: requiredText(200),
  status: statusIdInput.default("todo"),
  parentId: id.nullable().default(null),
});

export const taskUpdateInput = z.object({
  id,
  title: requiredText(200),
  details: optionalText(10000).default(""),
  priority: z.enum(priorities),
  assignees: z
    .array(z.string().trim().toLowerCase().pipe(z.email()))
    .max(5)
    .transform((list) => [...new Set(list)]),
  labels: z
    .array(z.enum(labelIds))
    .max(labelIds.length)
    .transform((list) => [...new Set(list)]),
  dueDate: z
    .string()
    .trim()
    .transform((v) => v || null)
    .pipe(z.iso.date().nullable()),
});

export const taskMoveInput = z.object({
  id,
  status: statusIdInput,
  position: z.number().finite(),
});

export const noteInput = z.object({
  title: requiredText(200),
  body: z.string().max(100000).default(""),
});

/** Today's date (YYYY-MM-DD) in the team's time zone (Bali), on server and browser alike. */
export function workspaceToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** A sort key that places a card between two neighbours (either may be missing). */
export function positionBetween(before?: number, after?: number): number {
  if (before === undefined && after === undefined) return 1024;
  if (before === undefined) return (after as number) - 1024;
  if (after === undefined) return before + 1024;
  return (before + after) / 2;
}

/** Only allow redirects back into the workspace, never to another origin. */
export function safeWorkspacePath(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/teams") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/teams";
  return value;
}

export function memberName(members: Member[], email: string | null) {
  if (!email) return "Unassigned";
  return members.find((m) => m.email === email)?.display_name || email;
}

export function initials(name: string) {
  return (
    name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "?"
  );
}

export type Channel = {
  direct_members?: string[] | null;
  visible_to?: string[] | null;
  id: string;
  name: string;
  topic: string;
  created_by: string;
  created_at: string;
};
export function privateChatName(channel: Channel, team: Member[], email: string) {
  return (channel.direct_members ?? []).filter(member => member !== email).map(member => memberName(team, member)).join(", ");
}
export type Message = {
  id: string;
  channel_id: string;
  author: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  attachments?: Attachment[];
};

/** "Client Feedback!" → "client-feedback" (Slack-style channel names). */
export function channelSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

export const channelInput = z.object({
  name: z
    .string()
    .transform(channelSlug)
    .pipe(z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/)),
  topic: optionalText(200).default(""),
});

export const messageInput = z
  .object({
    channelId: id,
    body: z.string().trim().max(4000),
    attachmentIds: z.array(id).max(10).default([]),
  })
  .refine((m) => m.body.length > 0 || m.attachmentIds.length > 0);

export const importedNoteInput = z.object({
  projectId: id,
  title: z.string().trim().min(1).max(200),
  body: z.string().max(100000),
});

/** Day key and label in the team's time zone, identical on server and browser. */
export function workspaceDay(iso: string) {
  return workspaceToday(new Date(iso));
}
export function dayLabel(day: string, today = workspaceToday()) {
  if (day === today) return "Today";
  if (day === addDays(today, -1)) return "Yesterday";
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** Slack-style grouping: same author within five minutes shares one header. */
export function startsGroup(previous: Message | undefined, message: Message) {
  if (!previous) return true;
  if (previous.author !== message.author) return true;
  if (workspaceDay(previous.created_at) !== workspaceDay(message.created_at))
    return true;
  return (
    new Date(message.created_at).getTime() -
      new Date(previous.created_at).getTime() >
    5 * 60 * 1000
  );
}

export const displayNameInput = z.string().trim().min(1).max(80);

export const taskDueInput = z.object({
  id,
  dueDate: z.iso.date().nullable(),
});
