import AppShell from "@/components/workspace/app-shell";
import { getSidebar } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export default async function WorkspaceAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { me } = await requireMember();
  const projects = await getSidebar();
  return (
    <AppShell me={me} projects={projects}>
      {children}
    </AppShell>
  );
}
