"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { setTaskDue } from "@/app/(workspace)/teams/actions";
import { monthGrid, monthLabel, shiftMonth } from "@/lib/workspace/insights";
import { dayLabel, workspaceToday, type Task } from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import { Assignees } from "./task-store";
import { useTeam } from "./team-context";
import { useStatusLookup } from "./status-context";

export type CalendarTask = Task & { projectName?: string };

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_PER_DAY = 3;

// Month calendar of tasks by due date. Drag a task to another day (or to
// "Unscheduled") to change its due date. Narrow screens get an agenda list.
export default function TaskCalendar({
  tasks: serverTasks,
  month,
  basePath,
  showProject = false,
}: {
  tasks: CalendarTask[];
  month: string;
  basePath: string;
  showProject?: boolean;
}) {
  const { team } = useTeam();
  const getStatus = useStatusLookup();
  const [tasks, setDue] = useOptimistic(
    serverTasks,
    (current, change: { id: string; due: string | null }) =>
      current.map((t) =>
        t.id === change.id ? { ...t, due_date: change.due } : t,
      ),
  );
  const [, start] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showDone, setShowDone] = useState(false);
  const today = workspaceToday();
  const weeks = monthGrid(month);

  const visible = tasks.filter((t) => showDone || t.status !== "done");
  const byDay = new Map<string, CalendarTask[]>();
  for (const t of visible)
    if (t.due_date)
      byDay.set(t.due_date, [...(byDay.get(t.due_date) ?? []), t]);
  const unscheduled = visible.filter((t) => !t.due_date);
  const monthDays = weeks
    .flat()
    .filter((d) => d.slice(0, 7) === month && byDay.has(d));

  function move(id: string, due: string | null) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.due_date === due) return;
    setError("");
    start(async () => {
      setDue({ id, due });
      const result = await setTaskDue(id, due);
      if (!result.ok) setError(result.message);
    });
  }

  const dropProps = (due: string | null, key: string) => ({
    onDragOver: (event: React.DragEvent) => {
      if (!dragId) return;
      event.preventDefault();
      if (over !== key) setOver(key);
    },
    onDragLeave: (event: React.DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node))
        setOver(null);
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      const id = event.dataTransfer.getData("text/plain") || dragId;
      if (id) move(id, due);
      setDragId(null);
      setOver(null);
    },
  });

  const chip = (task: CalendarTask) => {
    const status = getStatus(task.status, task.project_id);
    return (
      <Link
        key={task.id}
        href={`/teams/p/${task.project_id}?task=${task.id}`}
        className={`ws-cal-task${task.status === "done" ? " done" : ""}${dragId === task.id ? " dragging" : ""}`}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("text/plain", task.id);
          event.dataTransfer.effectAllowed = "move";
          setDragId(task.id);
        }}
        onDragEnd={() => {
          setDragId(null);
          setOver(null);
        }}
        style={
          showProject
            ? { borderLeft: `3px solid ${projectColor(task.project_id)}` }
            : undefined
        }
        title={`${task.title} · ${status.label}${task.projectName ? ` · ${task.projectName}` : ""}`}
      >
        <span
          className="ws-dot"
          style={{ background: status.color }}
          aria-label={status.label}
        />
        <span className="ws-ellipsis">{task.title}</span>
      </Link>
    );
  };

  return (
    <div className="ws-cal">
      <div className="ws-cal-bar">
        <div className="ws-cal-nav">
          <Link
            className="ws-button ghost small"
            href={`${basePath}?m=${shiftMonth(month, -1)}`}
            aria-label="Previous month"
          >
            ←
          </Link>
          <h2>{monthLabel(month)}</h2>
          <Link
            className="ws-button ghost small"
            href={`${basePath}?m=${shiftMonth(month, 1)}`}
            aria-label="Next month"
          >
            →
          </Link>
          {month !== today.slice(0, 7) && (
            <Link className="ws-button ghost small" href={basePath}>
              Today
            </Link>
          )}
        </div>
        <label className="ws-check">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(event) => setShowDone(event.target.checked)}
          />
          Show done
        </label>
      </div>
      {error && (
        <p className="ws-notice error" role="alert">
          {error}
        </p>
      )}

      <div className="ws-cal-layout">
        <div className="ws-cal-grid" role="grid" aria-label={monthLabel(month)}>
          <div className="ws-cal-row ws-cal-weekdays" role="row">
            {weekdays.map((d) => (
              <span key={d} role="columnheader">
                {d}
              </span>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={week[0]} className="ws-cal-row" role="row">
              {week.map((day) => {
                const items = byDay.get(day) ?? [];
                const outside = day.slice(0, 7) !== month;
                return (
                  <div
                    key={day}
                    role="gridcell"
                    aria-label={dayLabel(day, today)}
                    className={`ws-cal-day${outside ? " outside" : ""}${day === today ? " today" : ""}${over === day ? " over" : ""}`}
                    {...dropProps(day, day)}
                  >
                    <span className="ws-cal-date">{Number(day.slice(8))}</span>
                    {items.slice(0, MAX_PER_DAY).map(chip)}
                    {items.length > MAX_PER_DAY && (
                      <details className="ws-cal-more">
                        <summary>+{items.length - MAX_PER_DAY} more</summary>
                        {items.slice(MAX_PER_DAY).map(chip)}
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <aside
          className={`ws-cal-side${over === "none" ? " over" : ""}`}
          aria-label="Unscheduled tasks"
          {...dropProps(null, "none")}
        >
          <h3>
            Unscheduled <span className="ws-meta">{unscheduled.length}</span>
          </h3>
          <p className="ws-meta">Drag onto a day to set a due date.</p>
          {unscheduled.map(chip)}
        </aside>
      </div>

      {/* Agenda for small screens */}
      <ol className="ws-agenda" aria-label={`${monthLabel(month)} agenda`}>
        {monthDays.length === 0 && (
          <li className="ws-meta">No due dates this month.</li>
        )}
        {monthDays.map((day) => (
          <li key={day}>
            <h3 className={day === today ? "today" : ""}>
              {dayLabel(day, today)}
            </h3>
            {byDay.get(day)!.map((task) => (
              <Link
                key={task.id}
                href={`/teams/p/${task.project_id}?task=${task.id}`}
                className="ws-mytask"
              >
                <span
                  className="ws-dot"
                  style={{
                    background: getStatus(task.status, task.project_id).color,
                  }}
                />
                <span className="ws-ellipsis">{task.title}</span>
                {task.projectName && (
                  <span className="ws-mytask-project">{task.projectName}</span>
                )}
                <Assignees team={team} task={task} />
              </Link>
            ))}
          </li>
        ))}
      </ol>
    </div>
  );
}
