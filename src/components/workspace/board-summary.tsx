"use client";
import type { Task } from "@/lib/workspace/model";
export default function BoardSummary({
  tasks,
  onOpen,
  isBlocked,
}: {
  tasks: Task[];
  onOpen: (id: string) => void;
  isBlocked: (task: Task) => boolean;
}) {
  const roots = tasks.filter((task) => !task.parent_id);
  const done = roots.filter((task) => task.status === "done").length;
  const blocked = roots.filter(
    (task) => task.status !== "done" && isBlocked(task),
  ).length;
  const upcoming = tasks
    .filter(
      (task) =>
        task.status !== "done" &&
        task.due_date &&
        !task.id.startsWith("pending-"),
    )
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 3);
  return (
    <aside className="ws-board-summary" aria-label="Project summary">
      <h2>Project pulse</h2>
      <p>
        <strong>
          {done} / {roots.length}
        </strong>{" "}
        main tasks completed
      </p>
      <progress
        max={Math.max(roots.length, 1)}
        value={done}
        aria-label="Main tasks completed"
      />
      <p className="ws-meta">
        {roots.length - done} open{blocked ? ` · ${blocked} blocked` : ""}
      </p>
      <div className="ws-board-summary-extra">
        <h3>Next due</h3>
        {upcoming.length ? (
          <ul>
            {upcoming.map((task) => (
              <li key={task.id}>
                <button type="button" onClick={() => onOpen(task.id)}>
                  {task.title}
                  <small>{task.due_date}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ws-meta">Add due dates to see upcoming work here.</p>
        )}
        <div className="ws-board-hint">
          <h3>A quick tip</h3>
          <p className="ws-meta">
            Drag cards between columns, or open a task to change its status.
            Press <kbd>N</kbd> to add a task.
          </p>
          <p className="ws-meta">
            Use “Blocked by” when another task must finish first.
          </p>
        </div>
        <p className="ws-meta">
          Summary covers the whole project, including tasks hidden by the label
          filter.
        </p>
      </div>
    </aside>
  );
}
