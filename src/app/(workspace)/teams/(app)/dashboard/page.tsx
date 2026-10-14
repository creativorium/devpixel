import type { Metadata } from "next";
import Dashboard from "@/components/workspace/dashboard";
import TimeReport from "@/components/workspace/time-report";
import { dashboardStats } from "@/lib/workspace/insights";
import { workspaceToday, allProjectStatuses } from "@/lib/workspace/model";
import { getAllTasks, getSidebar } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function WorkspaceDashboardPage() {
  const { team } = await requireMember();
  const [tasks, projects] = await Promise.all([getAllTasks(), getSidebar()]);
  const progress = projects
    .filter((p) => !p.archived_at)
    .map((p) => {
      const mine = tasks.filter((t) => t.project_id === p.id);
      return {
        id: p.id,
        name: p.name,
        total: mine.length,
        done: mine.filter((t) => t.status === "done").length,
      };
    });
  return (
    <div className="ws-page">
      <header className="ws-page-head">
        <div>
          <p className="ws-eyebrow">All projects</p>
          <h1 className="ws-title">Dashboard</h1>
        </div>
      </header>
      <Dashboard
        stats={dashboardStats(
          tasks,
          team,
          workspaceToday(),
          allProjectStatuses(projects),
        )}
        projects={progress}
      />
      <TimeReport />
    </div>
  );
}
