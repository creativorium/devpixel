"use client";

import { useState } from "react";
import {
  labels as labelOptions,
  statuses,
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
  PriorityPill,
  StatusDot,
  StoreError,
  useTaskDialog,
  useTaskStore,
} from "./task-store";
import { fileUrl } from "./attachments";
import { isImage } from "@/lib/workspace/files";

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
                </span>
                <span>{items.length}</span>
              </h2>
              {items.map((task) => {
                const pending = task.id.startsWith("pending-");
                return (
                  <button
                    key={task.id}
                    type="button"
                    data-task-id={task.id}
                    className={`ws-task${dragId === task.id ? " dragging" : ""}${pending ? " pending" : ""}`}
                    draggable={!pending}
                    disabled={pending}
                    onClick={() => open(task.id)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", task.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDragId(task.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOver(null);
                    }}
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
                      <Assignees team={team} task={task} />
                    </span>
                  </button>
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
