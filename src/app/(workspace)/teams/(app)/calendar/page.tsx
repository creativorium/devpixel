import type { Metadata } from "next";
import TaskCalendar from "@/components/workspace/task-calendar";
import { parseMonth } from "@/lib/workspace/insights";
import { workspaceToday } from "@/lib/workspace/model";
import { getAllTasks } from "@/lib/workspace/queries";

export const metadata: Metadata = { title: "Calendar" };

export default async function WorkspaceCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const month = parseMonth((await searchParams).m, workspaceToday());
  const tasks = (await getAllTasks()).map(({ projects, ...task }) => ({
    ...task,
    projectName: projects.name,
  }));
  return (
    <div className="ws-page">
      <header className="ws-page-head">
        <div>
          <p className="ws-eyebrow">All projects</p>
          <h1 className="ws-title">Calendar</h1>
        </div>
      </header>
      <TaskCalendar
        tasks={tasks}
        month={month}
        basePath="/teams/calendar"
        showProject
      />
    </div>
  );
}
