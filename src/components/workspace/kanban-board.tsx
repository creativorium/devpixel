"use client";

import { useState } from "react";
import {
  statuses,
  type Member,
  type Task,
  type TaskStatus,
} from "@/lib/workspace/model";
import {
  AddTask,
  Assignee,
  DueLabel,
  PriorityPill,
  StatusDot,
  StoreError,
  useTaskDialog,
  useTaskStore,
} from "./task-store";

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
      <div className="ws-board">
        {statuses.map(({ id: status, label }) => {
          const items = store.column(status);
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
                    <span className="ws-task-title">{task.title}</span>
                    <span className="ws-task-foot">
                      <PriorityPill priority={task.priority} />
                      <DueLabel task={task} />
                      {task.details && (
                        <span aria-label="Has description">≡</span>
                      )}
                      <Assignee team={team} email={task.assignee} />
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
