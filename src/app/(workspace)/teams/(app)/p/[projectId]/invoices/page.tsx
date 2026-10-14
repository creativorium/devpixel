import { notFound } from "next/navigation";
import { requireMember } from "@/lib/workspace/session";
import { isAdmin } from "@/lib/workspace/model";
import { getProject } from "@/lib/workspace/queries";
import { billingSchema } from "@/lib/workspace/billing";
import ProjectInvoices from "@/components/workspace/project-invoices";

export default async function ProjectInvoicePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { supabase, me } = await requireMember();
  if (!isAdmin(me)) notFound();
  const project = await getProject(projectId);
  if (!project) notFound();
  const [billing, tasks, history] = await Promise.all([
    supabase
      .from("project_billing")
      .select("details")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("id,title,parent_id,status")
      .eq("project_id", projectId)
      .order("position"),
    supabase
      .from("project_invoices")
      .select("id,invoice_number,share_id,task_ids,state,created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (tasks.error)
    return (
      <p className="ws-notice error">
        Could not load tasks. Refresh the page to try again.
      </p>
    );
  const defaults = billingSchema.safeParse(billing.data?.details ?? {});
  return (
    <ProjectInvoices
      projectId={projectId}
      projectName={project.name}
      email={me.email}
      tasks={tasks.data ?? []}
      defaults={defaults.success ? defaults.data : billingSchema.parse({})}
      history={history.data ?? []}
      setupNeeded={Boolean(billing.error || history.error)}
    />
  );
}
