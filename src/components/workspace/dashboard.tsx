"use client";

import Link from "next/link";
import type { DashboardStats } from "@/lib/workspace/insights";
import {
  initials,
  memberName,
  statuses,
  workspaceToday,
} from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
import LocalTime from "./local-time";
import { useTeam } from "./team-context";

export type ProjectProgress = {
  id: string;
  name: string;
  total: number;
  done: number;
};

const openStatuses = statuses.filter((s) => s.id !== "done");

// Dashboard: headline tiles, then thin stacked bars with a legend, hover titles
// and a table view (colour is never the only way to read a value).
export default function Dashboard({
  stats,
  projects,
}: {
  stats: DashboardStats;
  projects?: ProjectProgress[];
}) {
  const { team } = useTeam();
  const today = workspaceToday();
  const maxLoad = Math.max(1, ...stats.workload.map((w) => w.total));
  const maxPriority = Math.max(1, ...stats.byPriority.map((p) => p.count));

  return (
    <div className="ws-dash">
      <div className="ws-tiles">
        <Tile label="Open tasks" value={stats.open} />
        <Tile
          label="Overdue"
          value={stats.overdue}
          tone={stats.overdue > 0 ? "bad" : undefined}
        />
        <Tile label="Due in the next 7 days" value={stats.dueThisWeek} />
        <Tile label="Done in the last 7 days" value={stats.doneLast7} />
      </div>

      <section className="ws-panel ws-dash-wide" aria-labelledby="dash-status">
        <div className="ws-panel-head">
          <h2 id="dash-status">Status</h2>
          <span className="ws-meta">{stats.total} tasks</span>
        </div>
        {stats.total === 0 ? (
          <p className="ws-meta">No tasks yet.</p>
        ) : (
          <>
            <div
              className="ws-stack big"
              role="img"
              aria-label={statuses
                .map((s) => `${s.label} ${stats.byStatus[s.id]}`)
                .join(", ")}
            >
              {statuses.map((s) =>
                stats.byStatus[s.id] ? (
                  <span
                    key={s.id}
                    style={{
                      flexGrow: stats.byStatus[s.id],
                      background: s.color,
                    }}
                    title={`${s.label}: ${stats.byStatus[s.id]} (${Math.round((stats.byStatus[s.id] / stats.total) * 100)}%)`}
                  />
                ) : null,
              )}
            </div>
            <ul className="ws-legend">
              {statuses.map((s) => (
                <li key={s.id}>
                  <span className="ws-swatch" style={{ background: s.color }} />
                  {s.label} <strong>{stats.byStatus[s.id]}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="ws-panel" aria-labelledby="dash-workload">
        <div className="ws-panel-head">
          <h2 id="dash-workload">Workload (open tasks)</h2>
        </div>
        <ul className="ws-legend small">
          {openStatuses.map((s) => (
            <li key={s.id}>
              <span className="ws-swatch" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
        <div className="ws-bars">
          {stats.workload.map((row) => {
            const name = row.email ? memberName(team, row.email) : "Unassigned";
            return (
              <div key={row.email ?? "none"} className="ws-bar-row">
                <span className="ws-bar-label">
                  <span
                    className={`ws-avatar${row.email ? "" : " none"}`}
                    style={
                      row.email
                        ? { background: projectColor(row.email) }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {row.email ? initials(name) : "–"}
                  </span>
                  <span className="ws-ellipsis">{name}</span>
                </span>
                <span className="ws-bar-track">
                  <span
                    className="ws-stack"
                    style={{ width: `${(row.total / maxLoad) * 100}%` }}
                  >
                    {openStatuses.map((s) =>
                      row.byStatus[s.id] ? (
                        <span
                          key={s.id}
                          style={{
                            flexGrow: row.byStatus[s.id],
                            background: s.color,
                          }}
                          title={`${name} · ${s.label}: ${row.byStatus[s.id]}`}
                        />
                      ) : null,
                    )}
                  </span>
                </span>
                <span className="ws-bar-value">
                  {row.total}
                  {row.overdue > 0 && (
                    <span className="ws-due overdue">
                      {" "}
                      · {row.overdue} late
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <details className="ws-table-toggle">
          <summary>Show as table</summary>
          <table className="ws-table">
            <thead>
              <tr>
                <th scope="col">Person</th>
                {openStatuses.map((s) => (
                  <th key={s.id} scope="col">
                    {s.label}
                  </th>
                ))}
                <th scope="col">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {stats.workload.map((row) => (
                <tr key={row.email ?? "none"}>
                  <th scope="row">
                    {row.email ? memberName(team, row.email) : "Unassigned"}
                  </th>
                  {openStatuses.map((s) => (
                    <td key={s.id}>{row.byStatus[s.id]}</td>
                  ))}
                  <td>{row.overdue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <section className="ws-panel" aria-labelledby="dash-priority">
        <div className="ws-panel-head">
          <h2 id="dash-priority">Open tasks by priority</h2>
        </div>
        <div className="ws-bars">
          {stats.byPriority.map((row) => (
            <div key={row.priority} className="ws-bar-row">
              <span
                className="ws-bar-label"
                style={{ textTransform: "capitalize" }}
              >
                {row.priority}
              </span>
              <span className="ws-bar-track">
                <span
                  className="ws-bar-fill"
                  style={{ width: `${(row.count / maxPriority) * 100}%` }}
                  title={`${row.priority}: ${row.count}`}
                />
              </span>
              <span className="ws-bar-value">{row.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ws-panel" aria-labelledby="dash-upcoming">
        <div className="ws-panel-head">
          <h2 id="dash-upcoming">Due in the next 14 days</h2>
        </div>
        {stats.upcoming.length === 0 ? (
          <p className="ws-meta">Nothing due soon.</p>
        ) : (
          <ul className="ws-recent">
            {stats.upcoming.map((task) => (
              <li key={task.id}>
                <Link
                  href={`/teams/p/${task.project_id}?task=${task.id}`}
                  className="ws-mytask"
                >
                  <span
                    className="ws-dot"
                    style={{
                      background: statuses.find((s) => s.id === task.status)!
                        .color,
                    }}
                  />
                  <span className="ws-ellipsis">{task.title}</span>
                  <span className="ws-meta">
                    {memberName(team, task.assignee)}
                  </span>
                  <span
                    className={`ws-due${task.due_date! < today ? " overdue" : ""}`}
                  >
                    <LocalTime
                      iso={task.due_date!}
                      options={{ day: "numeric", month: "short" }}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {projects && (
        <section className="ws-panel" aria-labelledby="dash-projects">
          <div className="ws-panel-head">
            <h2 id="dash-projects">Project progress</h2>
          </div>
          <div className="ws-bars">
            {projects.map((p) => (
              <div key={p.id} className="ws-bar-row">
                <Link
                  href={`/teams/p/${p.id}/overview`}
                  className="ws-bar-label"
                >
                  <span
                    className="ws-project-dot"
                    style={{ background: projectColor(p.id) }}
                    aria-hidden="true"
                  />
                  <span className="ws-ellipsis">{p.name}</span>
                </Link>
                <span className="ws-bar-track">
                  <span
                    className="ws-bar-fill done"
                    style={{
                      width: p.total ? `${(p.done / p.total) * 100}%` : 0,
                    }}
                    title={`${p.name}: ${p.done} of ${p.total} done`}
                  />
                </span>
                <span className="ws-bar-value">
                  {p.total ? `${Math.round((p.done / p.total) * 100)}%` : "–"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "bad";
}) {
  return (
    <div className={`ws-tile${tone ? ` ${tone}` : ""}`}>
      <span className="ws-tile-value">{value}</span>
      <span className="ws-tile-label">
        {tone === "bad" && <span aria-hidden="true">⚠ </span>}
        {label}
      </span>
    </div>
  );
}
