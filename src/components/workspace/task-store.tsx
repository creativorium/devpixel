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
  workspaceToday,
  type Member,
  type Task,
  type TaskStatus,
} from "@/lib/workspace/model";
import { mentionedEmails } from "@/lib/workspace/insights";
import { projectColor } from "@/lib/workspace/note-format";
import LocalTime from "./local-time";
import { useMentionPicker } from "./mention-picker";
import { Mention } from "./team-context";

// Shared by the Board and List views: optimistic task state plus the task dialog.

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

export function useTaskStore(projectId: string, serverTasks: Task[]) {
  const [tasks, change] = useOptimistic(serverTasks, apply);
  const [, startTransition] = useTransition();
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

  function add(status: TaskStatus, title: string) {
    const now = new Date().toISOString();
    const task: Task = {
      id: `pending-${now}`,
      project_id: projectId,
      title,
      details: "",
      status,
      priority: "medium",
      assignee: null,
      due_date: null,
      position: positionBetween(column(status).at(-1)?.position),
      created_by: "",
      created_at: now,
      updated_at: now,
    };
    run({ type: "add", task }, () => createTask(projectId, status, title));
  }

  function save(task: Task, formData: FormData) {
    const status = formData.get("status") as TaskStatus;
    const fields: Partial<Task> = {
      title: String(formData.get("title") ?? "").trim(),
      details: String(formData.get("details") ?? ""),
      priority: formData.get("priority") as Task["priority"],
      assignee: String(formData.get("assignee") || "") || null,
      due_date: String(formData.get("dueDate") || "") || null,
    };
    if (status !== task.status) moveTo(task.id, status);
    run({ type: "patch", id: task.id, fields }, () => updateTask(formData));
  }

  function remove(id: string) {
    run({ type: "remove", id }, () => deleteTask(id));
  }

  return { tasks, column, moveTo, add, save, remove, error };
}

export type TaskStore = ReturnType<typeof useTaskStore>;

export const isOverdue = (task: Pick<Task, "due_date" | "status">) =>
  Boolean(
    task.due_date && task.status !== "done" && task.due_date < workspaceToday(),
  );

export function StatusDot({ status }: { status: TaskStatus }) {
  const s = statuses.find((x) => x.id === status)!;
  return (
    <span
      className="ws-dot"
      style={{ background: s.color }}
      aria-hidden="true"
    />
  );
}

export function PriorityPill({ priority }: { priority: Task["priority"] }) {
  if (priority === "medium") return null;
  return <span className={`ws-pill ${priority}`}>{priority}</span>;
}

export function DueLabel({ task }: { task: Task }) {
  if (!task.due_date) return null;
  const overdue = isOverdue(task);
  return (
    <span
      className={`ws-due${overdue ? " overdue" : ""}`}
      suppressHydrationWarning
    >
      <LocalTime
        iso={task.due_date}
        options={{ day: "numeric", month: "short" }}
      />
    </span>
  );
}

export function Assignee({
  team,
  email,
}: {
  team: Member[];
  email: string | null;
}) {
  const name = memberName(team, email);
  return (
    <span
      className={`ws-avatar${email ? "" : " none"}`}
      style={email ? { background: projectColor(email) } : undefined}
      title={name}
      aria-label={`Assignee: ${name}`}
    >
      {email ? initials(name) : "–"}
    </span>
  );
}

export function AddTask({
  onAdd,
  label = "+ Add task",
  className = "ws-add-toggle",
}: {
  onAdd: (title: string) => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  if (!open)
    return (
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
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
        placeholder="Task name, then Enter"
        maxLength={200}
        autoFocus
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        onBlur={(event) => !event.currentTarget.value && setOpen(false)}
      />
    </form>
  );
}

export function TaskDialog({
  task,
  team,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  team: Member[];
  onClose: () => void;
  onSave: (formData: FormData) => void;
  onDelete: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState(task.details);
  const mentions = useMentionPicker(details, setDetails);
  const tagged = [...new Set(mentionedEmails(details))];
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
          onSave(new FormData(event.currentTarget));
        }}
      >
        <h2 id="ws-task-heading" className="ws-sr-only">
          Edit task
        </h2>
        <input type="hidden" name="id" value={task.id} />
        <input
          className="ws-dialog-title"
          name="title"
          aria-label="Task name"
          defaultValue={task.title}
          required
          maxLength={200}
        />
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
          <label className="ws-field">
            Due date
            <input
              className="ws-input"
              type="date"
              name="dueDate"
              defaultValue={task.due_date ?? ""}
            />
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
        </div>
        <label className="ws-field ws-mention-host">
          Description
          {mentions.popup}
          <textarea
            className="ws-input"
            name="details"
            rows={7}
            value={details}
            maxLength={10000}
            placeholder="Links, acceptance criteria, client feedback… Type @ to tag someone."
            {...mentions.fieldProps}
            onChange={(event) => setDetails(event.target.value)}
            onKeyDown={(event) => {
              mentions.onKeyDown(event);
            }}
          />
        </label>
        {tagged.length > 0 && (
          <p className="ws-tagged">
            Tagged:{" "}
            {tagged.map((email) => (
              <Mention key={email} email={email} fallback={email} />
            ))}
          </p>
        )}
        <p className="ws-meta">
          Added by {memberName(team, task.created_by)} ·{" "}
          <LocalTime iso={task.created_at} options={{ dateStyle: "medium" }} />{" "}
          · updated <LocalTime iso={task.updated_at} />
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

/** Dialog wiring shared by both views. */
export function useTaskDialog(
  store: TaskStore,
  team: Member[],
  initialOpen: string | null = null,
) {
  const [openId, setOpenId] = useState<string | null>(initialOpen);
  const task = store.tasks.find((t) => t.id === openId) ?? null;
  const dialog = task ? (
    <TaskDialog
      key={task.id}
      task={task}
      team={team}
      onClose={() => setOpenId(null)}
      onSave={(formData) => {
        setOpenId(null);
        store.save(task, formData);
      }}
      onDelete={() => {
        setOpenId(null);
        store.remove(task.id);
      }}
    />
  ) : null;
  return { open: setOpenId, dialog };
}

export function StoreError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="ws-notice error" role="alert" style={{ marginBottom: 12 }}>
      {message}
    </p>
  );
}
