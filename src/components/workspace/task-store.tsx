"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addDependency,
  createTask,
  deleteAttachment,
  deleteTask,
  moveTask,
  removeDependency,
  updateTask,
} from "@/app/(workspace)/teams/actions";
import { ACCEPT, type Attachment } from "@/lib/workspace/files";
import { mentionedEmails } from "@/lib/workspace/insights";
import {
  descendants,
  initials,
  labels as labelOptions,
  memberName,
  openBlockers,
  positionBetween,
  priorities,
  statuses,
  taskAssignees,
  workspaceToday,
  type Member,
  type Task,
  type TaskLabel,
  type TaskStatus,
} from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import { AttachmentList, namePasted, uploadFile } from "./attachments";
import Icon from "./icons";
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
    case "remove": {
      const gone = new Set([
        change.id,
        ...descendants(change.id, tasks).map((t) => t.id),
      ]);
      return tasks.filter((t) => !gone.has(t.id));
    }
    case "patch":
      return tasks.map((t) =>
        t.id === change.id ? { ...t, ...change.fields } : t,
      );
  }
}

export const BLOCKED_MESSAGE =
  "This task is blocked. Finish the tasks it waits for before moving it out of To do.";

export function useTaskStore(projectId: string, serverTasks: Task[]) {
  const [tasks, change] = useOptimistic(serverTasks, apply);
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");

  /** Top-level tasks in a status column (subtasks live inside their parent). */
  const column = (status: TaskStatus) =>
    tasks
      .filter((t) => t.status === status && !t.parent_id)
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

  const isBlocked = (task: Task) => openBlockers(task, tasks).length > 0;

  function moveTo(id: string, status: TaskStatus, index?: number) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (status !== "todo" && task.status !== status && isBlocked(task)) {
      setError(BLOCKED_MESSAGE);
      return;
    }
    const others = tasks
      .filter(
        (t) =>
          t.status === status &&
          t.id !== id &&
          (t.parent_id ?? null) === (task.parent_id ?? null),
      )
      .sort((a, b) => a.position - b.position);
    const at = index ?? others.length;
    const position = positionBetween(
      others[at - 1]?.position,
      others[at]?.position,
    );
    if (task.status === status && task.position === position) return;
    run({ type: "move", id, status, position }, () =>
      moveTask(id, status, position),
    );
  }

  function add(
    status: TaskStatus,
    title: string,
    parentId: string | null = null,
  ) {
    const now = new Date().toISOString();
    const task: Task = {
      id: `pending-${now}`,
      project_id: projectId,
      title,
      details: "",
      status,
      priority: "medium",
      assignee: null,
      assignees: [],
      labels: [],
      parent_id: parentId,
      blockers: [],
      due_date: null,
      position: positionBetween(column(status).at(-1)?.position),
      created_by: "",
      created_at: now,
      updated_at: now,
    };
    run({ type: "add", task }, () =>
      createTask(projectId, status, title, parentId),
    );
  }

  function save(task: Task, formData: FormData) {
    const status = formData.get("status") as TaskStatus;
    const assignees = formData.getAll("assignees").map(String);
    const fields: Partial<Task> = {
      title: String(formData.get("title") ?? "").trim(),
      details: String(formData.get("details") ?? ""),
      priority: formData.get("priority") as Task["priority"],
      assignees,
      assignee: assignees[0] ?? null,
      labels: formData.getAll("labels").map(String) as TaskLabel[],
      due_date: String(formData.get("dueDate") || "") || null,
    };
    if (status !== task.status) moveTo(task.id, status);
    run({ type: "patch", id: task.id, fields }, () => updateTask(formData));
  }

  function remove(id: string) {
    run({ type: "remove", id }, () => deleteTask(id));
  }

  function link(task: Task, blockedBy: string) {
    const blockers = [...(task.blockers ?? []), { blocked_by: blockedBy }];
    run({ type: "patch", id: task.id, fields: { blockers } }, () =>
      addDependency(task.id, blockedBy),
    );
  }

  function unlink(task: Task, blockedBy: string) {
    const blockers = (task.blockers ?? []).filter(
      (b) => b.blocked_by !== blockedBy,
    );
    run({ type: "patch", id: task.id, fields: { blockers } }, () =>
      removeDependency(task.id, blockedBy),
    );
  }

  function toggleDone(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (task) moveTo(id, task.status === "done" ? "todo" : "done");
  }

  return {
    tasks,
    column,
    moveTo,
    add,
    save,
    remove,
    link,
    unlink,
    toggleDone,
    isBlocked,
    error,
    setError,
  };
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

/** Overlapping avatars for everyone on a task. */
export function Assignees({ team, task }: { team: Member[]; task: Task }) {
  const people = taskAssignees(task);
  if (people.length === 0) return <Assignee team={team} email={null} />;
  const shown = people.slice(0, 3);
  return (
    <span
      className="ws-avatars"
      aria-label={`Assignees: ${people.map((e) => memberName(team, e)).join(", ")}`}
    >
      {shown.map((email) => {
        const name = memberName(team, email);
        return (
          <span
            key={email}
            className="ws-avatar"
            style={{ background: projectColor(email) }}
            title={name}
            aria-hidden="true"
          >
            {initials(name)}
          </span>
        );
      })}
      {people.length > shown.length && (
        <span className="ws-avatar none" aria-hidden="true">
          +{people.length - shown.length}
        </span>
      )}
    </span>
  );
}

export function LabelChips({ task }: { task: Task }) {
  if (!task.labels?.length) return null;
  return (
    <span className="ws-labels">
      {labelOptions
        .filter((l) => task.labels!.includes(l.id))
        .map((l) => (
          <span
            key={l.id}
            className="ws-label"
            style={{ color: l.color, borderColor: l.color }}
          >
            {l.label}
          </span>
        ))}
    </span>
  );
}

/** "☑ 2/5" for tasks with subtasks (counts every level). */
export function SubtaskProgress({
  task,
  tasks,
}: {
  task: Task;
  tasks: Task[];
}) {
  const all = descendants(task.id, tasks);
  if (all.length === 0) return null;
  const done = all.filter((t) => t.status === "done").length;
  return (
    <span aria-label={`${done} of ${all.length} subtasks done`}>
      ☑ {done}/{all.length}
    </span>
  );
}

export function AddTask({
  onAdd,
  label = "+ Add task",
  className = "ws-add-toggle",
  placeholder = "Task name, then Enter",
}: {
  onAdd: (title: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  if (!open)
    return (
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  const submit = () => {
    const title = input.current?.value.trim();
    if (!title) return;
    onAdd(title.slice(0, 200));
    input.current!.value = "";
  };
  return (
    // A div (not a form) so it can live inside the task dialog's form.
    <div className="ws-add-task">
      <input
        ref={input}
        className="ws-input"
        aria-label={label.replace(/^\+\s*/, "")}
        placeholder={placeholder}
        maxLength={200}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        onBlur={(event) => !event.currentTarget.value && setOpen(false)}
      />
    </div>
  );
}

function SubtaskTree({
  parentId,
  tasks,
  team,
  depth,
  onOpen,
  onToggle,
  isBlocked,
}: {
  parentId: string;
  tasks: Task[];
  team: Member[];
  depth: number;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  isBlocked: (task: Task) => boolean;
}) {
  const children = tasks
    .filter((t) => t.parent_id === parentId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (children.length === 0) return null;
  return (
    <ul className="ws-subtasks" style={{ paddingLeft: depth ? 22 : 0 }}>
      {children.map((child) => {
        const pending = child.id.startsWith("pending-");
        const blocked = child.status !== "done" && isBlocked(child);
        return (
          <li key={child.id}>
            <div
              className={`ws-subtask${child.status === "done" ? " done" : ""}`}
            >
              <input
                type="checkbox"
                checked={child.status === "done"}
                disabled={pending || blocked}
                aria-label={`Mark ${child.title} ${child.status === "done" ? "not done" : "done"}`}
                title={blocked ? "Blocked by unfinished tasks" : undefined}
                onChange={() => onToggle(child.id)}
              />
              <StatusDot status={child.status} />
              <button
                type="button"
                className="ws-subtask-title"
                disabled={pending}
                onClick={() => onOpen(child.id)}
              >
                {blocked && <span aria-label="Blocked">🔒 </span>}
                {child.title}
              </button>
              <SubtaskProgress task={child} tasks={tasks} />
              <DueLabel task={child} />
              <Assignees team={team} task={child} />
            </div>
            {depth < 6 && (
              <SubtaskTree
                parentId={child.id}
                tasks={tasks}
                team={team}
                depth={depth + 1}
                onOpen={onOpen}
                onToggle={onToggle}
                isBlocked={isBlocked}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function TaskDialog({
  task,
  team,
  store,
  onOpen,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  team: Member[];
  store: TaskStore;
  onOpen: (id: string) => void;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  onDelete: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState(task.details);
  const mentions = useMentionPicker(details, setDetails);
  const tagged = [...new Set(mentionedEmails(details))];
  const router = useRouter();
  const picker = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Attachment[]>(task.attachments ?? []);
  const [uploading, setUploading] = useState(0);
  const [fileError, setFileError] = useState("");
  const saved = !task.id.startsWith("pending-");
  const all = store.tasks;
  const assigned = new Set(taskAssignees(task));

  // Ancestors, nearest last, for the breadcrumb.
  const ancestors: Task[] = [];
  for (
    let p = all.find((t) => t.id === task.parent_id);
    p && ancestors.length < 10;
    p = all.find((t) => t.id === p!.parent_id)
  )
    ancestors.unshift(p);

  const blockerIds = new Set((task.blockers ?? []).map((b) => b.blocked_by));
  const blockers = all.filter((t) => blockerIds.has(t.id));
  const waitingOn = blockers.filter((t) => t.status !== "done");
  const blocks = all.filter((t) =>
    (t.blockers ?? []).some((b) => b.blocked_by === task.id),
  );
  const linkable = all.filter(
    (t) =>
      t.id !== task.id && !blockerIds.has(t.id) && !t.id.startsWith("pending-"),
  );

  async function addFiles(list: File[]) {
    if (!saved || list.length === 0) return;
    setFileError("");
    for (const original of list) {
      setUploading((n) => n + 1);
      try {
        const attachment = await uploadFile(namePasted(original), {
          taskId: task.id,
        });
        setFiles((current) => [...current, attachment]);
      } catch (err) {
        setFileError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    router.refresh(); // board cards show the new cover / count
  }

  async function removeFile(attachment: Attachment) {
    if (!confirm(`Remove ${attachment.name}?`)) return;
    const before = files;
    setFiles((current) => current.filter((a) => a.id !== attachment.id));
    const result = await deleteAttachment(attachment.id);
    if (!result.ok) {
      setFiles(before);
      setFileError(result.message);
    }
  }

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
        {ancestors.length > 0 && (
          <nav className="ws-task-crumbs" aria-label="Parent tasks">
            {ancestors.map((a) => (
              <button key={a.id} type="button" onClick={() => onOpen(a.id)}>
                {a.title}
              </button>
            ))}
            <span aria-hidden="true">›</span>
          </nav>
        )}
        <input type="hidden" name="id" value={task.id} />
        <input
          className="ws-dialog-title"
          name="title"
          aria-label="Task name"
          defaultValue={task.title}
          required
          maxLength={200}
        />
        {waitingOn.length > 0 && (
          <p className="ws-notice warn" role="status">
            🔒 Blocked: waiting on {waitingOn.length} unfinished{" "}
            {waitingOn.length === 1 ? "task" : "tasks"}. It can only leave To do
            once they are done.
          </p>
        )}
        <div className="ws-dialog-row">
          <label className="ws-field">
            Status
            <select
              className="ws-input"
              name="status"
              defaultValue={task.status}
            >
              {statuses.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  disabled={
                    waitingOn.length > 0 &&
                    s.id !== "todo" &&
                    s.id !== task.status
                  }
                >
                  {s.label}
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

        <fieldset className="ws-chip-set">
          <legend className="ws-field">Assignees</legend>
          {team.map((m) => (
            <label key={m.email} className="ws-chip-check">
              <input
                type="checkbox"
                name="assignees"
                value={m.email}
                defaultChecked={assigned.has(m.email)}
              />
              <span
                className="ws-avatar"
                style={{ background: projectColor(m.email) }}
                aria-hidden="true"
              >
                {initials(m.display_name || m.email)}
              </span>
              {m.display_name || m.email.split("@")[0]}
            </label>
          ))}
        </fieldset>

        <fieldset className="ws-chip-set">
          <legend className="ws-field">Labels</legend>
          {labelOptions.map((l) => (
            <label key={l.id} className="ws-chip-check">
              <input
                type="checkbox"
                name="labels"
                value={l.id}
                defaultChecked={task.labels?.includes(l.id)}
              />
              <span
                className="ws-swatch"
                style={{ background: l.color }}
                aria-hidden="true"
              />
              {l.label}
            </label>
          ))}
        </fieldset>

        <label className="ws-field ws-mention-host">
          Description
          {mentions.popup}
          <textarea
            className="ws-input"
            name="details"
            rows={5}
            value={details}
            maxLength={10000}
            placeholder="Links, acceptance criteria, client feedback… Type @ to tag someone."
            {...mentions.fieldProps}
            onChange={(event) => setDetails(event.target.value)}
            onKeyDown={(event) => {
              mentions.onKeyDown(event);
            }}
            onPaste={(event) => {
              const pasted = [...event.clipboardData.files];
              if (pasted.length === 0 || !saved) return;
              event.preventDefault();
              void addFiles(pasted);
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

        <section className="ws-task-section" aria-label="Subtasks">
          <div className="ws-task-files-head">
            <span className="ws-field">
              Subtasks <SubtaskProgress task={task} tasks={all} />
            </span>
          </div>
          <SubtaskTree
            parentId={task.id}
            tasks={all}
            team={team}
            depth={0}
            onOpen={onOpen}
            onToggle={store.toggleDone}
            isBlocked={store.isBlocked}
          />
          {saved && (
            <AddTask
              label="+ Add subtask"
              placeholder="Subtask name, then Enter"
              onAdd={(title) => store.add("todo", title, task.id)}
            />
          )}
        </section>

        <section className="ws-task-section" aria-label="Linked tasks">
          <span className="ws-field">Blocked by (must be done first)</span>
          {blockers.length > 0 && (
            <ul className="ws-links">
              {blockers.map((b) => (
                <li key={b.id}>
                  <StatusDot status={b.status} />
                  <button type="button" onClick={() => onOpen(b.id)}>
                    {b.title}
                  </button>
                  <span className="ws-meta">
                    {statuses.find((s) => s.id === b.status)!.label}
                  </span>
                  <button
                    type="button"
                    className="ws-link-remove"
                    aria-label={`Remove link to ${b.title}`}
                    onClick={() => store.unlink(task, b.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {saved && linkable.length > 0 && (
            <select
              className="ws-input"
              aria-label="Add a task this one waits for"
              value=""
              onChange={(event) => {
                if (event.target.value) store.link(task, event.target.value);
              }}
            >
              <option value="">+ Add a task that must finish first…</option>
              {linkable.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.parent_id ? "↳ " : ""}
                  {t.title}
                </option>
              ))}
            </select>
          )}
          {blocks.length > 0 && (
            <p className="ws-meta">
              Blocks:{" "}
              {blocks.map((b, i) => (
                <span key={b.id}>
                  {i > 0 && ", "}
                  <button
                    type="button"
                    className="ws-inline-link"
                    onClick={() => onOpen(b.id)}
                  >
                    {b.title}
                  </button>
                </span>
              ))}
            </p>
          )}
        </section>

        <div
          className="ws-task-files"
          onDragOver={(event) => {
            if (saved && event.dataTransfer.types.includes("Files"))
              event.preventDefault();
          }}
          onDrop={(event) => {
            if (!event.dataTransfer.files.length) return;
            event.preventDefault();
            void addFiles([...event.dataTransfer.files]);
          }}
        >
          <div className="ws-task-files-head">
            <span className="ws-field">Attachments</span>
            <input
              ref={picker}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              onChange={(event) => {
                void addFiles([...(event.target.files ?? [])]);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="ws-button ghost small"
              disabled={!saved || uploading > 0}
              onClick={() => picker.current?.click()}
            >
              <Icon name="clip" size={14} />
              {uploading > 0 ? `Uploading ${uploading}…` : "Add files"}
            </button>
          </div>
          {files.length === 0 ? (
            <p className="ws-meta">
              Drop files here, use Add files, or paste a screenshot into the
              description. Up to 4 MB each.
            </p>
          ) : (
            <AttachmentList attachments={files} onRemove={removeFile} />
          )}
          {fileError && (
            <p className="ws-error-text" role="alert">
              {fileError}
            </p>
          )}
        </div>

        <p className="ws-meta">
          Added by {memberName(team, task.created_by)} ·{" "}
          <LocalTime iso={task.created_at} options={{ dateStyle: "medium" }} />{" "}
          · updated <LocalTime iso={task.updated_at} />
        </p>
        <div className="ws-dialog-actions">
          <button
            type="button"
            className="ws-button danger small"
            onClick={() =>
              confirm(
                descendants(task.id, all).length
                  ? "Delete this task and all its subtasks?"
                  : "Delete this task?",
              ) && onDelete()
            }
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
      store={store}
      onOpen={setOpenId}
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
