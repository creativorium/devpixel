"use client";

import { useState } from "react";
import { useStatuses } from "./status-context";
import { type Member, type Task, type TaskStatus } from "@/lib/workspace/model";
import {
  AddTask,
  Assignees,
  LabelChips,
  SubtaskProgress,
  TaskMenu,
  DueLabel,
  PriorityPill,
  StatusDot,
  StoreError,
  useTaskDialog,
  useTaskStore,
} from "./task-store";

// ClickUp-style list: tasks grouped by status with sortable-looking columns.
export default function TaskList({
  projectId,
  tasks: serverTasks,
  team,
}: {
  projectId: string;
  tasks: Task[];
  team: Member[];
}) {
  const store = useTaskStore(projectId, serverTasks);
  const statuses = useStatuses(projectId);
  const { open, dialog } = useTaskDialog(store, team);
  const [menu, setMenu] = useState<{
    id: string;
    at: { x: number; y: number };
  } | null>(null);
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(new Set());

  const toggle = (status: TaskStatus) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  return (
    <>
      <StoreError message={store.error} />
      <div className="ws-list">
        {statuses.map(({ id: status, label }) => {
          const items = store.column(status);
          const isOpen = !collapsed.has(status);
          return (
            <section key={status} className="ws-group" aria-label={label}>
              <div className="ws-group-head">
                <button
                  type="button"
                  className="ws-group-toggle"
                  aria-expanded={isOpen}
                  onClick={() => toggle(status)}
                >
                  <span className="ws-caret" aria-hidden="true">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="ws-status-chip">
                    <StatusDot status={status} projectId={projectId} />
                    {label}
                  </span>
                  <span className="ws-meta">{items.length}</span>
                </button>
              </div>
              {isOpen && (
                <div role="table" aria-label={`${label} tasks`}>
                  <div role="row" className="ws-row ws-row-head">
                    <span role="columnheader">Name</span>
                    <span role="columnheader">Assignee</span>
                    <span role="columnheader">Due date</span>
                    <span role="columnheader">Priority</span>
                  </div>
                  {items.map((task) => {
                    const pending = task.id.startsWith("pending-");
                    return (
                      <div
                        role="row"
                        key={task.id}
                        className={`ws-row${pending ? " pending" : ""}`}
                        onContextMenu={(event) => {
                          if (pending) return;
                          event.preventDefault();
                          setMenu({
                            id: task.id,
                            at: { x: event.clientX, y: event.clientY },
                          });
                        }}
                      >
                        <span role="cell" className="ws-row-name">
                          <span
                            className="ws-status-pick"
                            style={{
                              background: statuses.find(
                                (s) => s.id === task.status,
                              )!.color,
                            }}
                          >
                            <select
                              className="ws-status-select"
                              aria-label={`Status of ${task.title}`}
                              value={task.status}
                              disabled={pending}
                              onChange={(event) =>
                                store.moveTo(
                                  task.id,
                                  event.target.value as TaskStatus,
                                )
                              }
                            >
                              {statuses.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </span>
                          <button
                            type="button"
                            className="ws-row-title"
                            disabled={pending}
                            onClick={() => open(task.id)}
                          >
                            {store.isBlocked(task) &&
                              task.status !== "done" && (
                                <span aria-label="Blocked">🔒 </span>
                              )}
                            {task.title}
                            {task.details && (
                              <span
                                className="ws-meta"
                                aria-label="Has description"
                              >
                                {" "}
                                ≡
                              </span>
                            )}
                            {(task.attachments?.length ?? 0) > 0 && (
                              <span
                                className="ws-meta"
                                aria-label={`${task.attachments!.length} attachments`}
                              >
                                {" "}
                                📎 {task.attachments!.length}
                              </span>
                            )}
                          </button>
                          <LabelChips task={task} tasks={store.tasks} />
                          <span className="ws-meta">
                            <SubtaskProgress task={task} tasks={store.tasks} />
                          </span>
                        </span>
                        <span role="cell" data-label="Assignee">
                          <Assignees team={team} task={task} />
                        </span>
                        <span role="cell" data-label="Due">
                          <DueLabel task={task} />
                        </span>
                        <span role="cell" data-label="Priority">
                          <PriorityPill priority={task.priority} />
                        </span>
                      </div>
                    );
                  })}
                  <div className="ws-row ws-row-add">
                    <AddTask onAdd={(title) => store.add(status, title)} />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
      {menu &&
        (() => {
          const task = store.tasks.find((t) => t.id === menu.id);
          return task ? (
            <TaskMenu
              task={task}
              store={store}
              onOpen={open}
              position={menu.at}
              onClose={() => setMenu(null)}
            />
          ) : null;
        })()}
      {dialog}
    </>
  );
}
