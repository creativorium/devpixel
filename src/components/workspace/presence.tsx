"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useTeam } from "./team-context";
import { initials } from "@/lib/workspace/model";
import { projectColor } from "@/lib/workspace/note-format";
const Presence = createContext<Record<string, boolean> | null>(null);
export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    let stopped = false;
    let busy = false;
    const refresh = async () => {
      if (document.hidden || busy) return;
      busy = true;
      try {
        const response = await fetch("/teams/api/presence", { method: "POST", signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error();
        const data = await response.json() as { now: string; members: { email: string; seen_at: string }[] };
        if (!stopped) setMembers(Object.fromEntries(data.members.map(m => [m.email, Date.parse(data.now) - Date.parse(m.seen_at) < 90000])));
      } catch { if (!stopped) setMembers(null); }
      finally { busy = false; }
    };
    void refresh();
    const timer = setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => { stopped = true; clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  return <Presence value={members}>{children}</Presence>;
}
export function PresenceBadge({ email }: { email: string }) {
  const presence = useContext(Presence);
  const status = presence === null ? "Status unavailable" : presence[email] ? "Online" : "Offline";
  return <span className="ws-presence" title="Online means Teams was visible within the last 90 seconds."><i className={status === "Online" ? "online" : ""} />{status}</span>;
}
export function TeamDirectory() {
  const { team, me } = useTeam();
  return (
    <section className="ws-page ws-team-directory">
      <header className="ws-team-directory-head">
        <h1>Team</h1>
        <span className="ws-meta">{team.length} {team.length === 1 ? "member" : "members"}</span>
      </header>
      <p className="ws-team-directory-hint">See who’s online. Status updates within 90 seconds.</p>
      <ul className="ws-people-list" aria-label="Team members">
        {team.map(member => {
          const name = member.display_name || member.email;
          return (
            <li className="ws-person" key={member.email}>
              <span className="ws-avatar" style={{ background: projectColor(member.email) }} aria-hidden="true">{initials(name)}</span>
              <div className="ws-person-info">
                <strong>{name}{member.email === me?.email && <span className="ws-person-you"> (you)</span>}</strong>
                <span className="ws-person-email">{member.email}</span>
              </div>
              <PresenceBadge email={member.email} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
