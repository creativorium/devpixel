import type { Metadata } from "next";
import ProfileForm from "@/components/workspace/profile-form";
import { initials, isAdmin } from "@/lib/workspace/model";
import AdminMembers from "@/components/workspace/admin-members";
import { projectColor } from "@/lib/workspace/note-format";
import { requireMember } from "@/lib/workspace/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { me, team } = await requireMember();
  return (
    <div className="ws-page ws-narrow">
      <header className="ws-page-head">
        <div>
          <p className="ws-eyebrow">Settings</p>
          <h1 className="ws-title">Your profile</h1>
          <p className="ws-lede">
            Your name appears on tasks, pages, chat and @mentions. It is linked
            to your sign-in email, so changing it updates everywhere at once.
          </p>
        </div>
      </header>

      <section className="ws-panel">
        <ProfileForm email={me.email} displayName={me.display_name} />
      </section>

      {isAdmin(me) ? <AdminMembers team={team} me={me}/> : <section className="ws-panel" style={{ marginTop: 20 }}>
        <div className="ws-panel-head">
          <h2>Team</h2>
          <span className="ws-meta">{team.length} members</span>
        </div>
        <ul className="ws-team-list">
          {team.map((member) => {
            const name = member.display_name || member.email.split("@")[0]!;
            return (
              <li key={member.email}>
                <span
                  className="ws-avatar large"
                  style={{ background: projectColor(member.email) }}
                  aria-hidden="true"
                >
                  {initials(name)}
                </span>
                <span>
                  <strong>
                    {name}
                    {member.email === me.email && " (you)"}
                  </strong>
                  <span className="ws-meta">{member.email}</span>
                </span>
                {!member.display_name && (
                  <span className="ws-pill">No name set yet</span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="ws-meta" style={{ marginTop: 12 }}>
          Each person can set their own display name. Ask a workspace admin to add teammates or change roles.
        </p>
      </section>}
    </div>
  );
}
