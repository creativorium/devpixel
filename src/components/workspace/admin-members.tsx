"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTeamMember } from "@/app/(workspace)/teams/member-actions";
import { type Member, memberName } from "@/lib/workspace/model";

export default function AdminMembers({
  team,
  me,
}: {
  team: Member[];
  me: Member;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null),
    [email, setEmail] = useState(""),
    [name, setName] = useState(""),
    [role, setRole] = useState<"admin" | "member">("member");
  const [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [invite, setInvite] = useState("");
  const [pending, start] = useTransition();
  function prepare(member?: Member) {
    setEditing(member?.email ?? null);
    setEmail(member?.email ?? "");
    setName(member?.display_name ?? "");
    setRole(member?.role === "admin" ? "admin" : "member");
    setError("");
    setNotice("");
    setOpen(true);
  }
  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(invite);
      setNotice(
        "Invitation link copied. Share it with the teammate you added.",
      );
    } catch {
      setNotice("Copy the invitation link below.");
    }
  }
  return (
    <section className="ws-panel ws-admin-members">
      <div className="ws-panel-head">
        <h2>Manage team</h2>
        <button
          type="button"
          className="ws-button small"
          onClick={() => prepare()}
        >
          Invite teammate
        </button>
      </div>
      <p className="ws-meta">
        Add their Google sign-in email, then share the invitation link. Access
        is tied to that email; the link alone does not grant access.
      </p>
      {open && (
        <form
          className="ws-member-form"
          onSubmit={(event) => {
            event.preventDefault();
            start(async () => {
              setError("");
              try {
                const result = await saveTeamMember({
                  email,
                  name,
                  role,
                  create: editing === null,
                });
                if (result.error) setError(result.error);
                else {
                  setNotice(
                    editing
                      ? "Member updated."
                      : "Teammate added. Copy the link and ask them to sign in with the email you added.",
                  );
                  if (!editing)
                    setInvite(
                      `${window.location.origin}/teams/login?next=%2Fteams`,
                    );
                  setOpen(false);
                  router.refresh();
                }
              } catch {
                setError("Could not save. Please try again.");
              }
            });
          }}
        >
          <h3>{editing ? "Edit teammate" : "Invite teammate"}</h3>
          <label className="ws-field">
            Google sign-in email
            <input
              type="email"
              required
              maxLength={254}
              className="ws-input"
              readOnly={editing !== null}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="ws-field">
            Display name
            <input
              required
              maxLength={80}
              className="ws-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="ws-field">
            Role
            <select
              className="ws-input"
              value={role}
              disabled={editing === me.email}
              onChange={(e) => setRole(e.target.value as "admin" | "member")}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <p className="ws-meta">
            {role === "admin"
              ? "Admins can manage teammates, billing and project access. They can see all projects, but only private chats they participate in."
              : "Members can work in projects and channels they have access to. Projects set to Everyone are available immediately."}
          </p>
          <div className="ws-form-actions">
            <button
              type="submit"
              className="ws-button small"
              disabled={pending}
            >
              {pending ? "Saving…" : editing ? "Save changes" : "Add teammate"}
            </button>
            <button
              type="button"
              className="ws-button ghost small"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="ws-error-text" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="ws-meta" role="status">
          {notice}
        </p>
      )}
      {invite && (
        <div className="ws-member-invite">
          <label className="ws-field">
            Invitation link
            <input
              className="ws-input"
              readOnly
              value={invite}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <button
            type="button"
            className="ws-button ghost small"
            onClick={() => void copyInvite()}
          >
            Copy invitation link
          </button>
          <p className="ws-meta">No email was sent automatically.</p>
        </div>
      )}
      <ul className="ws-team-list">
        {team.map((member) => (
          <li key={member.email}>
            <span className="ws-member-identity">
              <strong>
                {memberName(team, member.email)}
                {member.email === me.email ? " (you)" : ""}
              </strong>
              <span className="ws-meta">{member.email}</span>
            </span>
            <span className="ws-pill">
              {member.role === "admin" ? "Admin" : "Member"}
            </span>
            <button
              type="button"
              className="ws-button ghost small"
              onClick={() => prepare(member)}
            >
              Edit
              <span className="ws-sr-only">
                {" "}
                {memberName(team, member.email)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
