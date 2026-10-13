"use client";

import { useEffect, useRef, useState } from "react";
import {
  labels as labelOptions,
  statuses,
  taskAssignees,
  type Member,
  type Task,
  type TaskLabel,
  type TaskStatus,
} from "@/lib/workspace/model";
import {
  AddTask,
  Assignees,
  DueLabel,
  LabelChips,
  SubtaskProgress,
  TaskMenu,
  PriorityPill,
  StatusDot,
  StoreError,
  useTaskDialog,
  useTaskStore,
} from "./task-store";
import { fileUrl } from "./attachments";
import { isImage } from "@/lib/workspace/files";
import Icon from "./icons";

/** Only show the card footer when it has something to say. */
const hasFoot = (task: Task, all: Task[]) =>
  task.priority !== "medium" ||
  Boolean(task.due_date) ||
  Boolean(task.details) ||
  (task.attachments?.length ?? 0) > 0 ||
  taskAssignees(task).length > 0 ||
  all.some((t) => t.parent_id === task.id);

const cover = (task: Task) =>
  task.attachments?.find((a) => isImage(a.mime)) ?? null;

export default function KanbanBoard({
  projectId,
  tasks: serverTasks,
  team,
  openTaskId = null,
}: {
  projectId: string;
  tasks: Task[];
  team: Member[];
  openTaskId?: string | null;
}) {
  const store = useTaskStore(projectId, serverTasks);
  const { open, dialog } = useTaskDialog(store, team, openTaskId);
  const [dragId, setDragId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskLabel | null>(null);
  const [topAdd, setTopAdd] = useState<TaskStatus | null>(null);
  const [menu, setMenu] = useState<{
    id: string;
    at: { x: number; y: number } | null;
  } | null>(null);

  // "N" (or "C") adds a task to the top of To do, like Plane and ClickUp.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        el.closest("input, textarea, select, [contenteditable], dialog")
      )
        return;
      if (event.key === "n" || event.key === "c") {
        event.preventDefault();
        setTopAdd("todo");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const visible = (task: Task) => !filter || !!task.labels?.includes(filter);
  const [over, setOver] = useState<{
    status: TaskStatus;
    index: number;
  } | null>(null);

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

  return (
    <>
      <StoreError message={store.error} />
      <div className="ws-filter" role="group" aria-label="Filter by label">
        <span className="ws-meta">Label:</span>
        <button
          type="button"
          className="ws-filter-chip"
          aria-pressed={filter === null}
          onClick={() => setFilter(null)}
        >
          All
        </button>
        {labelOptions.map((l) => (
          <button
            key={l.id}
            type="button"
            className="ws-filter-chip"
            aria-pressed={filter === l.id}
            onClick={() => setFilter(filter === l.id ? null : l.id)}
          >
            <span
              className="ws-swatch"
              style={{ background: l.color }}
              aria-hidden="true"
            />
            {l.label}
          </button>
        ))}
      </div>
      <div className="ws-board">
        {statuses.map(({ id: status, label }) => {
          const items = store.column(status).filter(visible);
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
                if (id)
                  store.moveTo(id, status, dropIndex(event, status).index);
                setDragId(null);
                setOver(null);
              }}
            >
              <h2 className="ws-column-head">
                <span className="ws-status-chip">
                  <StatusDot status={status} />
                  {label}
                  <span className="ws-count">{items.length}</span>
                </span>
                <button
                  type="button"
                  className="ws-icon-button small"
                  aria-label={`Add a task to ${label}`}
                  title={`Add a task to ${label}${status === "todo" ? " (N)" : ""}`}
                  onClick={() => setTopAdd(status)}
                >
                  <Icon name="plus" size={15} />
                </button>
              </h2>
              {topAdd === status && (
                <QuickAdd
                  label={label}
                  onAdd={(title) => store.add(status, title, null, true)}
                  onClose={() => setTopAdd(null)}
                />
              )}
              {items.map((task) => {
                const pending = task.id.startsWith("pending-");
                return (
                  <div
                    key={task.id}
                    data-task-id={task.id}
                    className={`ws-task-wrap${dragId === task.id ? " dragging" : ""}`}
                    draggable={!pending}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", task.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDragId(task.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOver(null);
                    }}
                    onContextMenu={(event) => {
                      if (pending) return;
                      event.preventDefault();
                      setMenu({
                        id: task.id,
                        at: { x: event.clientX, y: event.clientY },
                      });
                    }}
                  >
                    <button
                      type="button"
                      className={`ws-task${pending ? " pending" : ""}`}
                      disabled={pending}
                      onClick={() => open(task.id)}
                    >
                      {cover(task) && (
                        // eslint-disable-next-line @next/next/no-img-element -- private, auth-checked file
                        <img
                          className="ws-task-cover"
                          src={fileUrl(cover(task)!.id)}
                          alt=""
                          loading="lazy"
                          draggable={false}
                        />
                      )}
                      <LabelChips task={task} />
                      <span className="ws-task-title">
                        {store.isBlocked(task) && task.status !== "done" && (
                          <span
                            title="Blocked by unfinished tasks"
                            aria-label="Blocked"
                          >
                            🔒{" "}
                          </span>
                        )}
                        {task.title}
                      </span>
                      {hasFoot(task, store.tasks) && (
                        <span className="ws-task-foot">
                          <PriorityPill priority={task.priority} />
                          <DueLabel task={task} />
                          {task.details && (
                            <span aria-label="Has description">≡</span>
                          )}
                          {(task.attachments?.length ?? 0) > 0 && (
                            <span
                              aria-label={`${task.attachments!.length} attachments`}
                            >
                              📎 {task.attachments!.length}
                            </span>
                          )}
                          <SubtaskProgress task={task} tasks={store.tasks} />
                          <Assignees team={team} task={task} hideEmpty />
                        </span>
                      )}
                    </button>
                    {!pending && (
                      <button
                        type="button"
                        className="ws-card-menu"
                        aria-label={`More actions for ${task.title}`}
                        aria-haspopup="menu"
                        onClick={() => setMenu({ id: task.id, at: null })}
                      >
                        <Icon name="more" size={16} />
                      </button>
                    )}
                    {menu?.id === task.id && (
                      <TaskMenu
                        task={task}
                        store={store}
                        onOpen={open}
                        position={menu.at}
                        onClose={() => setMenu(null)}
                      />
                    )}
                  </div>
                );
              })}
              <AddTask onAdd={(title) => store.add(status, title)} />
            </section>
          );
        })}
      </div>
      {dialog}
    </>
  );
}

/** Inline "new task" field shown at the top of a column from its + button. */
function QuickAdd({
  label,
  onAdd,
  onClose,
}: {
  label: string;
  onAdd: (title: string) => void;
  onClose: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="ws-add-task ws-quick-add">
      <input
        ref={input}
        className="ws-input"
        aria-label={`New task in ${label}`}
        placeholder="Task name, Enter to add · Esc to close"
        maxLength={200}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
          if (event.key !== "Enter") return;
          event.preventDefault();
          const title = event.currentTarget.value.trim();
          if (!title) return;
          onAdd(title.slice(0, 200));
          event.currentTarget.value = "";
        }}
        onBlur={(event) => !event.currentTarget.value.trim() && onClose()}
      />
    </div>
  );
}
