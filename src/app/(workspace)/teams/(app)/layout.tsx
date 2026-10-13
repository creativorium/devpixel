import AppShell from "@/components/workspace/app-shell";
import { getChannels, getSidebar } from "@/lib/workspace/queries";
import { requireMember } from "@/lib/workspace/session";

export default async function WorkspaceAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { me, team } = await requireMember();
  const [projects, channels] = await Promise.all([getSidebar(), getChannels()]);
  return (
    <AppShell me={me} team={team} projects={projects} channels={channels}>
      {children}
    </AppShell>
  );
}
