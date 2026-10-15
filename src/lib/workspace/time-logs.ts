import { z } from "zod";

export const timeLogInput = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  workDate: z.iso.date(),
  minutes: z.number().int().min(1).max(1440),
  note: z.string().trim().max(2000).default(""),
});

/** Sum direct logs once per task, including every level of subtasks. */
export function taskLoggedMinutes(
  task: { id: string; logged_minutes?: number },
  tasks: { id: string; parent_id?: string | null; logged_minutes?: number }[],
) {
  let total = task.logged_minutes ?? 0;
  const visited = new Set([task.id]);
  const queue = [task.id];
  while (queue.length) {
    const parent = queue.pop()!;
    for (const child of tasks) {
      if (child.parent_id !== parent || visited.has(child.id)) continue;
      visited.add(child.id);
      total += child.logged_minutes ?? 0;
      queue.push(child.id);
    }
  }
  return total;
}
export type TimeLog = {
  id: string;
  task_id: string;
  author: string;
  work_date: string;
  minutes: number;
  note: string;
  created_at: string;
};
export type TimeReportRow = TimeLog & {
  tasks: {
    title: string;
    project_id: string;
    projects: { name: string } | null;
  } | null;
};
export function durationLabel(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
export function timeRange(date: string, period: "day" | "week" | "month") {
  const d = new Date(`${date}T12:00:00Z`);
  const end = new Date(d);
  if (period === "week") {
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    end.setTime(d.getTime());
    end.setUTCDate(end.getUTCDate() + 6);
  }
  if (period === "month") {
    d.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 1, 0);
  }
  return {
    from: d.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}
