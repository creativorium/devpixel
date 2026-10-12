"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import {
  createTask,
  deleteTask,
  moveTask,
  updateTask,
} from "@/app/(workspace)/teams/actions";
import {
  initials,
  memberName,
  positionBetween,
  priorities,
  statuses,
  type Member,
  type Task,
  type TaskStatus,
} from "@/lib/workspace/model";
import LocalTime from "./local-time";

type Change =
  | { type: "move"; id: string; status: TaskStatus; position: number }
  | { type: "add"; task: Task }
  | { type: "remove"; id: string }
  | { type: "patch"; id: string; fields: Partial<Task> };

function apply(tasks: Task[], change: Change): Task[] {
  switch (change.type) {
    case "move":
      return tasks.map((t) =>
        t.id === change.id
          ? { ...t, status: change.status, position: change.position }
          : t,
      );
    case "add":
      return [...tasks, change.task];
    case "remove":
      return tasks.filter((t) => t.id !== change.id);
    case "patch":
      return tasks.map((t) =>
        t.id === change.id ? { ...t, ...change.fields } : t,
      );
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export default function KanbanBoard({
  projectId,
  tasks: serverTasks,
  team,
}: {
  projectId: string;
  tasks: Task[];
  team: Member[];
}) {
  const [tasks, change] = useOptimistic(serverTasks, apply);
  const [, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<{
    status: TaskStatus;
    index: number;
  } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const column = (status: TaskStatus) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  function run(
    optimistic: Change,
    action: () => Promise<{ ok: boolean; message?: string }>,
  ) {
    setError("");
    startTransition(async () => {
      change(optimistic);
      const result = await action();
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });
  }

  function moveTo(id: string, status: TaskStatus, index?: number) {
    const others = column(status).filter((t) => t.id !== id);
    const at = index ?? others.length;
    const position = positionBetween(
      others[at - 1]?.position,
      others[at]?.position,
    );
    const task = tasks.find((t) => t.id === id);
    if (task && task.status === status && task.position === position) return;
    run({ type: "move", id, status, position }, () =>
      moveTask(id, status, position),
    );
  }

  function dropIndex(event: React.DragEvent<HTMLElement>, status: TaskStatus) {
    const cards = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("[data-task-id]"),
    ).filter((el) => el.dataset.taskId !== dragId);
    const index = cards.findIndex((el) => {
      const box = el.getBoundingClientRect();
      return event.clientY < box.top + box.height / 2;
    });
    return { status, index: index === -1 ? cards.length : index };
  }

  const openTask = tasks.find((t) => t.id === openId) ?? null;

  return (
    <>
      {error && (
        <p
          className="ws-notice error"
          role="alert"
          style={{ marginBottom: 12 }}
        >
          {error}
        </p>
      )}
      <div className="ws-board">
        {statuses.map(({ id: status, label }) => {
          const items = column(status);
          return (
            <section
              key={status}
              className={`ws-column${over?.status === status ? " over" : ""}`}
              aria-label={label}
              onDragOver={(event) => {
                if (!dragId) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                const next = dropIndex(event, status);
                if (next.status !== over?.status || next.index !== over?.index)
                  setOver(next);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node))
                  setOver(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData("text/plain") || dragId;
                if (id) moveTo(id, status, dropIndex(event, status).index);
                setDragId(null);
                setOver(null);
              }}
            >
              <h2 className="ws-column-head">
                {label} <span>{items.length}</span>
              </h2>
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  team={team}
                  dragging={dragId === task.id}
                  onOpen={() => setOpenId(task.id)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", task.id);
                    event.dataTransfer.effectAllowed = "move";
                    setDragId(task.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOver(null);
                  }}
                />
              ))}
              <AddTask
                onAdd={(title) => {
                  const now = new Date().toISOString();
                  const temp: Task = {
                    id: `pending-${now}`,
                    project_id: projectId,
                    title,
                    details: "",
                    status,
                    priority: "medium",
                    assignee: null,
                    due_date: null,
                    position: positionBetween(items.at(-1)?.position),
                    created_by: "",
                    created_at: now,
                    updated_at: now,
                  };
                  run({ type: "add", task: temp }, () =>
                    createTask(projectId, status, title),
                  );
                }}
              />
            </section>
          );
        })}
      </div>
      {openTask && (
        <TaskDialog
          key={openTask.id}
          task={openTask}
          team={team}
          onClose={() => setOpenId(null)}
          onSave={(formData, status) => {
            const fields: Partial<Task> = {
              title: String(formData.get("title") ?? "").trim(),
              details: String(formData.get("details") ?? ""),
              priority: formData.get("priority") as Task["priority"],
              assignee: String(formData.get("assignee") || "") || null,
              due_date: String(formData.get("dueDate") || "") || null,
            };
            setOpenId(null);
            if (status !== openTask.status) moveTo(openTask.id, status);
            run({ type: "patch", id: openTask.id, fields }, () =>
              updateTask(formData),
            );
          }}
          onDelete={() => {
            setOpenId(null);
            run({ type: "remove", id: openTask.id }, () =>
              deleteTask(openTask.id),
            );
          }}
        />
      )}
    </>
  );
}

function TaskCard({
  task,
  team,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  team: Member[];
  dragging: boolean;
  onOpen: () => void;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const pending = task.id.startsWith("pending-");
  const assignee = memberName(team, task.assignee);
  const overdue =
    task.due_date && task.status !== "done" && task.due_date < today();
  return (
    <button
      type="button"
      data-task-id={task.id}
      className={`ws-task${dragging ? " dragging" : ""}${pending ? " pending" : ""}`}
      draggable={!pending}
      disabled={pending}
      onClick={onOpen}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <span className="ws-task-title">{task.title}</span>
      <span className="ws-task-foot">
        {task.priority !== "medium" && (
          <span className={`ws-pill ${task.priority}`}>{task.priority}</span>
        )}
        {task.due_date && (
          <span
            className={`ws-due${overdue ? " overdue" : ""}`}
            suppressHydrationWarning
          >
            {overdue ? "Overdue · " : "Due "}
            <LocalTime
              iso={task.due_date}
              options={{ day: "numeric", month: "short" }}
            />
          </span>
        )}
        {task.details && <span aria-label="Has details">≡</span>}
        <span
          className={`ws-avatar${task.assignee ? "" : " none"}`}
          title={assignee}
          aria-label={`Assignee: ${assignee}`}
        >
          {task.assignee ? initials(assignee) : "–"}
        </span>
      </span>
    </button>
  );
}

function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  if (!open)
    return (
      <button
        type="button"
        className="ws-add-toggle"
        onClick={() => setOpen(true)}
      >
        + Add task
      </button>
    );
  return (
    <form
      className="ws-add-task"
      onSubmit={(event) => {
        event.preventDefault();
        const title = input.current?.value.trim();
        if (!title) return;
        onAdd(title.slice(0, 200));
        input.current!.value = "";
      }}
    >
      <input
        ref={input}
        className="ws-input"
        aria-label="Task title"
        placeholder="Task title, then Enter"
        maxLength={200}
        autoFocus
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        onBlur={(event) => !event.currentTarget.value && setOpen(false)}
      />
    </form>
  );
}

function TaskDialog({
  task,
  team,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  team: Member[];
  onClose: () => void;
  onSave: (formData: FormData, status: TaskStatus) => void;
  onDelete: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      ref={(node) => {
        dialog.current = node;
        if (node && !node.open) node.showModal();
      }}
      className="ws-dialog"
      aria-labelledby="ws-task-heading"
      onClose={onClose}
      onClick={(event) =>
        event.target === dialog.current && dialog.current?.close()
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onSave(formData, formData.get("status") as TaskStatus);
        }}
      >
        <h2 id="ws-task-heading" className="ws-sr-only">
          Edit task
        </h2>
        <input type="hidden" name="id" value={task.id} />
        <label className="ws-field">
          Title
          <input
            className="ws-input"
            name="title"
            defaultValue={task.title}
            required
            maxLength={200}
          />
        </label>
        <label className="ws-field">
          Details
          <textarea
            className="ws-input"
            name="details"
            rows={6}
            defaultValue={task.details}
            maxLength={10000}
            placeholder="Links, acceptance criteria, client feedback…"
          />
        </label>
        <div className="ws-dialog-row">
          <label className="ws-field">
            Status
            <select
              className="ws-input"
              name="status"
              defaultValue={task.status}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="ws-field">
            Priority
            <select
              className="ws-input"
              name="priority"
              defaultValue={task.priority}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p[0]!.toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="ws-field">
            Due date
            <input
              className="ws-input"
              type="date"
              name="dueDate"
              defaultValue={task.due_date ?? ""}
            />
          </label>
        </div>
        <label className="ws-field">
          Assignee
          <select
            className="ws-input"
            name="assignee"
            defaultValue={task.assignee ?? ""}
          >
            <option value="">Unassigned</option>
            {team.map((m) => (
              <option key={m.email} value={m.email}>
                {m.display_name || m.email}
              </option>
            ))}
          </select>
        </label>
        <p className="ws-meta">
          Added by {memberName(team, task.created_by)} on{" "}
          {new Date(task.created_at).toLocaleDateString()} · updated{" "}
          {new Date(task.updated_at).toLocaleString()}
        </p>
        <div className="ws-dialog-actions">
          <button
            type="button"
            className="ws-button danger small"
            onClick={() => confirm("Delete this task?") && onDelete()}
          >
            Delete
          </button>
          <button
            type="button"
            className="ws-button ghost"
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button type="submit" className="ws-button">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
