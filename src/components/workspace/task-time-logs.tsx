"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  deleteTimeLog,
  getTaskTime,
  saveTimeLog,
} from "@/app/(workspace)/teams/time-actions";
import { durationLabel, type TimeLog } from "@/lib/workspace/time-logs";
import { isAdmin, memberName, workspaceToday } from "@/lib/workspace/model";
import { useTeam } from "./team-context";

export default function TaskTimeLogs({ taskId }: { taskId: string }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const { me, team } = useTeam();
  const [data, setData] = useState<{
    enabled: boolean;
    rows: TimeLog[];
    error?: string;
  } | null>(null);
  const [date, setDate] = useState(workspaceToday());
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState<TimeLog | null>(null);
  const [attempt, setAttempt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  useEffect(() => {
    let active = true;
    const load = () => {
      void getTaskTime(taskId)
        .then((result) => {
          if (active) setData(result);
        })
        .catch(() => {
          if (active)
            setError("Could not load time logs. Reopen the task to retry.");
        });
    };
    load();
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
    };
  }, [taskId]);
  if (!data?.enabled)
    return error ? <p className="ws-error-text">{error}</p> : null;
  function reset() {
    setEditing(null);
    setAttempt(null);
    setNote("");
    setHours("1");
    setMinutes("0");
    setDate(workspaceToday());
  }
  function run(action: () => Promise<{ error?: string }>) {
    start(async () => {
      setError("");
      try {
        const result = await action();
        if (result.error) setError(result.error);
        else {
          reset();
          setData(await getTaskTime(taskId));
          window.dispatchEvent(
            new CustomEvent("workspace:time-logged", { detail: taskId }),
          );
          dialog.current?.close();
          router.refresh();
        }
      } catch {
        setError(
          "Connection failed. Reopen the task to check whether the log was saved before retrying.",
        );
      }
    });
  }
  return (
    <div className="ws-time-summary">
      <span className="ws-meta">
        Time logged{" "}
        <strong>
          {durationLabel(data.rows.reduce((sum, row) => sum + row.minutes, 0))}
        </strong>
      </span>
      <button
        type="button"
        className="ws-button ghost small"
        onClick={() => {
          reset();
          setError("");
          dialog.current?.showModal();
        }}
      >
        Log time
      </button>
      {data.rows.length > 0 && (
        <button
          type="button"
          className="ws-inline-link"
          onClick={() => dialog.current?.showModal()}
        >
          Manage logs
        </button>
      )}
      {createPortal(
        <dialog
          ref={dialog}
          className="ws-time-dialog"
          aria-label="Log time"
          onClose={(event) => event.stopPropagation()}
          onCancel={(event) => {
            event.stopPropagation();
            if (pending) event.preventDefault();
          }}
          onKeyDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <section className="ws-time-panel" aria-label="Task time logs">
            <button
              type="button"
              className="ws-button ghost small ws-time-close"
              disabled={pending}
              onClick={() => dialog.current?.close()}
            >
              Close
            </button>
            <h3>
              Time logs{" "}
              <span className="ws-meta">
                {durationLabel(
                  data.rows.reduce((sum, row) => sum + row.minutes, 0),
                )}
              </span>
            </h3>
            <p className="ws-meta">
              Record work on this task. Logs save separately from task details.
            </p>
            {data.error && (
              <p role="alert" className="ws-error-text">
                {data.error}
              </p>
            )}
            <div className="ws-time-fields">
              <label className="ws-field">
                Work date
                <input
                  className="ws-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label className="ws-field">
                Hours
                <input
                  className="ws-input"
                  type="number"
                  min="0"
                  max="24"
                  step="1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </label>
              <label className="ws-field">
                Minutes
                <input
                  className="ws-input"
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </label>
            </div>
            <label className="ws-field">
              What did you work on? (optional)
              <textarea
                className="ws-input"
                rows={3}
                maxLength={2000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="For example: Built the booking form and tested date validation."
              />
            </label>
            <div className="ws-form-actions">
              <button
                type="button"
                className="ws-button small"
                disabled={pending}
                onClick={() => {
                  const h = Number(hours),
                    m = Number(minutes);
                  if (
                    !Number.isInteger(h) ||
                    !Number.isInteger(m) ||
                    h < 0 ||
                    m < 0 ||
                    m > 59
                  ) {
                    setError("Enter whole hours and minutes (0–59).");
                    return;
                  }
                  const id = editing?.id ?? attempt ?? crypto.randomUUID();
                  setAttempt(id);
                  run(() =>
                    saveTimeLog(
                      { id, taskId, workDate: date, minutes: h * 60 + m, note },
                      Boolean(editing),
                    ),
                  );
                }}
              >
                {pending ? "Saving…" : editing ? "Update log" : "Log time"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="ws-button ghost small"
                  disabled={pending}
                  onClick={reset}
                >
                  Cancel edit
                </button>
              )}
            </div>
            {error && (
              <p role="alert" className="ws-error-text">
                {error}
              </p>
            )}
            <ul className="ws-time-entries">
              {data.rows.map((row) => (
                <li key={row.id}>
                  <div>
                    <strong>{durationLabel(row.minutes)}</strong> ·{" "}
                    {row.work_date} · {memberName(team, row.author)}
                  </div>
                  {row.note && <p>{row.note}</p>}
                  {(row.author === me?.email || isAdmin(me)) && (
                    <div className="ws-form-actions">
                      <button
                        type="button"
                        className="ws-inline-link"
                        disabled={pending}
                        onClick={() => {
                          setEditing(row);
                          setDate(row.work_date);
                          setHours(String(Math.floor(row.minutes / 60)));
                          setMinutes(String(row.minutes % 60));
                          setNote(row.note);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ws-inline-link"
                        disabled={pending}
                        onClick={() => {
                          if (confirm("Delete this time log?"))
                            run(() => deleteTimeLog(row.id));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </dialog>,
        document.body,
      )}
    </div>
  );
}
