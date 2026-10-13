import {
  addDays,
  statuses,
  type Member,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "./model";

// Pure helpers for the calendar and dashboard views (dates are Bali calendar days).

/** "2026-10" from ?m=…, falling back to the month of `today`. */
export function parseMonth(value: string | undefined, today: string) {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
    ? value
    : today.slice(0, 7);
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Monday-first weeks covering the month, as YYYY-MM-DD strings. */
export function monthGrid(month: string): string[][] {
  const first = `${month}-01`;
  const weekday = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7; // Mon = 0
  let day = addDays(first, -weekday);
  const weeks: string[][] = [];
  do {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  } while (day.slice(0, 7) === month);
  return weeks;
}

export type DashboardStats = ReturnType<typeof dashboardStats>;

export function dashboardStats(tasks: Task[], team: Member[], today: string) {
  const open = tasks.filter((t) => t.status !== "done");
  const week = addDays(today, 7);
  const weekAgo = addDays(today, -7);
  const byStatus = Object.fromEntries(
    statuses.map((s) => [s.id, tasks.filter((t) => t.status === s.id).length]),
  ) as Record<TaskStatus, number>;
  const byPriority = (
    ["urgent", "high", "medium", "low"] as TaskPriority[]
  ).map((priority) => ({
    priority,
    count: open.filter((t) => t.priority === priority).length,
  }));
  const people = [
    ...team.map((m) => m.email),
    ...(open.some((t) => !t.assignee) ? [null] : []),
  ];
  const workload = people
    .map((email) => {
      const mine = open.filter((t) => t.assignee === email);
      return {
        email,
        total: mine.length,
        overdue: mine.filter((t) => t.due_date && t.due_date < today).length,
        byStatus: Object.fromEntries(
          statuses
            .filter((s) => s.id !== "done")
            .map((s) => [s.id, mine.filter((t) => t.status === s.id).length]),
        ) as Record<Exclude<TaskStatus, "done">, number>,
      };
    })
    .filter((row) => row.total > 0 || row.email !== null);
  return {
    total: tasks.length,
    open: open.length,
    overdue: open.filter((t) => t.due_date && t.due_date < today).length,
    dueThisWeek: open.filter(
      (t) => t.due_date && t.due_date >= today && t.due_date <= week,
    ).length,
    doneLast7: tasks.filter(
      (t) =>
        t.status === "done" &&
        t.completed_at &&
        t.completed_at.slice(0, 10) >= weekAgo,
    ).length,
    byStatus,
    byPriority,
    workload,
    upcoming: open
      .filter((t) => t.due_date && t.due_date <= addDays(today, 14))
      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
      .slice(0, 8),
  };
}

/** The stored form of an @mention; readable even as raw text. */
export function mentionToken(member: Member) {
  const name = (member.display_name || member.email.split("@")[0]!).replace(
    /[[\]()]/g,
    "",
  );
  return `@[${name}](${member.email})`;
}

export function mentionedEmails(text: string) {
  return [...text.matchAll(/@\[[^\]]{1,80}\]\(([^()\s]+@[^()\s]+)\)/g)].map(
    (m) => m[1]!.toLowerCase(),
  );
}
