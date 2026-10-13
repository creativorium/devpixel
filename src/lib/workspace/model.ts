import { z } from "zod";

export const statuses = [
  { id: "todo", label: "To do", color: "#8a8a83" },
  { id: "in_progress", label: "In progress", color: "#3f8fc4" },
  { id: "review", label: "Review", color: "#c9952c" },
  { id: "done", label: "Done", color: "#4fa36b" },
] as const;
export type TaskStatus = (typeof statuses)[number]["id"];
export const statusIds = statuses.map((s) => s.id) as [
  TaskStatus,
  ...TaskStatus[],
];

export const priorities = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof priorities)[number];

export type Member = { email: string; display_name: string };
export type Project = {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  archived_at: string | null;
};
export type Task = {
  id: string;
  project_id: string;
  title: string;
  details: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  due_date: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
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
  status: z.enum(statusIds).default("todo"),
});

export const taskUpdateInput = z.object({
  id,
  title: requiredText(200),
  details: optionalText(10000).default(""),
  priority: z.enum(priorities),
  assignee: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v || null)
    .pipe(z.email().nullable()),
  dueDate: z
    .string()
    .trim()
    .transform((v) => v || null)
    .pipe(z.iso.date().nullable()),
});

export const taskMoveInput = z.object({
  id,
  status: z.enum(statusIds),
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
  id: string;
  name: string;
  topic: string;
  created_by: string;
  created_at: string;
};
export type Message = {
  id: string;
  channel_id: string;
  author: string;
  body: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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

export const messageInput = z.object({
  channelId: id,
  body: z.string().trim().min(1).max(4000),
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
