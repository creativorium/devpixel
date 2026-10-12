import { z } from "zod";

export const statuses = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
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
