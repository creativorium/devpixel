"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTimeReport } from "@/app/(workspace)/teams/time-actions";
import {
  durationLabel,
  timeRange,
  type TimeReportRow,
} from "@/lib/workspace/time-logs";
import { memberName, workspaceToday } from "@/lib/workspace/model";
import { useTeam } from "./team-context";

function readableDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Choose a date";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

export default function TimeReport({ projectId }: { projectId?: string }) {
  const { team } = useTeam();
  const [period, setPeriod] = useState<"day" | "week" | "month" | "custom">(
    "week",
  );
  const [date, setDate] = useState(workspaceToday());
  const [custom, setCustom] = useState(() =>
    timeRange(workspaceToday(), "week"),
  );
  const [rows, setRows] = useState<TimeReportRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [person, setPerson] = useState("");
  const [project, setProject] = useState("");
  const range =
    period === "custom" ? custom : timeRange(date || workspaceToday(), period);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      setRows([]);
      void getTimeReport(range.from, range.to, projectId)
        .then((result) => {
          if (active) {
            setRows(result.rows);
            setError(result.error ?? "");
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setError("Could not load time logs. Try again.");
            setLoading(false);
          }
        });
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [range.from, range.to, retry, projectId]);
  useEffect(() => {
    const refresh = () => setRetry((value) => value + 1);
    window.addEventListener("focus", refresh);
    window.addEventListener("workspace:time-logged", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("workspace:time-logged", refresh);
    };
  }, []);
  const shown = rows.filter(
    (row) =>
      (!person || row.author === person) &&
      (!project || row.tasks?.project_id === project),
  );
  const projects = Array.from(
    new Map(
      rows
        .filter((row) => row.tasks)
        .map((row) => [
          row.tasks!.project_id,
          row.tasks!.projects?.name ?? "Project",
        ]),
    ).entries(),
  );
  return (
    <section className="ws-time-panel" aria-label="Time report">
      <div className="ws-time-report-head">
        <h2>Time logged</h2>
        <button type="button" className="ws-button ghost small" disabled={loading} onClick={() => setRetry(n => n + 1)}>{loading ? "Refreshing…" : "Refresh"}</button>
      </div>
      <p className="ws-meta">
        Review work by date, teammate and project. Historical logs remain here
        when logging is switched off.
      </p>
      <div className="ws-time-filters">
        <label className="ws-field">
          Period
          <select
            className="ws-input"
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="custom">Date range</option>
          </select>
        </label>
        {period !== "custom" ? (
          <label className="ws-field">
            {period === "week" ? "Week containing" : period === "month" ? "Month containing" : "Work date"}
            <input
              className="ws-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        ) : (
          <>
            <label className="ws-field">
              Start date
              <input
                className="ws-input"
                type="date"
                value={custom.from}
                onChange={(e) => setCustom({ ...custom, from: e.target.value })}
              />
            </label>
            <label className="ws-field">
              End date
              <input
                className="ws-input"
                type="date"
                value={custom.to}
                onChange={(e) => setCustom({ ...custom, to: e.target.value })}
              />
            </label>
          </>
        )}
        <label className="ws-field">
          Teammate
          <select
            className="ws-input"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          >
            <option value="">Everyone</option>
            {team.map((m) => (
              <option value={m.email} key={m.email}>
                {memberName(team, m.email)}
              </option>
            ))}
          </select>
        </label>
        <label className="ws-field">
          Project
          <select
            className="ws-input"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="">
              {projectId ? "This project" : "All accessible projects"}
            </option>
            {projects.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="ws-time-report-total" aria-live="polite">
        <div><span className="ws-time-caption">Total logged</span><strong>{loading ? "Loading…" : error ? "Unavailable" : durationLabel(shown.reduce((sum,row) => sum + row.minutes,0))}</strong></div>
        <div><span className="ws-time-caption">Selected dates</span><strong>{readableDate(range.from)}{range.from !== range.to && ` – ${readableDate(range.to)}`}</strong></div>
        {!loading && !error && <span>{shown.length} {shown.length === 1 ? "entry" : "entries"}</span>}
      </div>
      {error && (
        <p role="alert" className="ws-error-text">
          {error}
        </p>
      )}
      {!loading && !error && !shown.length && (
        <p className="ws-meta">No time logged for these filters.</p>
      )}
      {!loading && shown.length > 0 && <div className="ws-time-table-wrap"><table className="ws-time-table">
        <caption className="ws-time-caption">Work entries for the selected dates</caption>
        <thead><tr><th scope="col">Work date</th><th scope="col">Task & work notes</th><th scope="col">Teammate</th><th scope="col">Time logged</th></tr></thead>
        <tbody>{shown.map(row => <tr key={row.id}>
          <td data-label="Work date"><time dateTime={row.work_date}>{readableDate(row.work_date)}</time></td>
          <td data-label="Task & work notes"><Link href={`/teams/p/${row.tasks?.project_id}?task=${row.task_id}`}>{row.tasks?.title}</Link><span className="ws-time-project">{row.tasks?.projects?.name}</span><p>{row.note}</p></td>
          <td data-label="Teammate">{memberName(team,row.author)}</td>
          <td data-label="Time logged"><strong className="ws-time-duration">{durationLabel(row.minutes)}</strong></td>
        </tr>)}</tbody>
      </table></div>}
    </section>
  );
}
