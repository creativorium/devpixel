"use client";
import { useTeam } from "./team-context";
export default function VisibilityBadge({
  visibleTo,
}: {
  visibleTo: string[] | null | undefined;
}) {
  const { team } = useTeam();
  if (visibleTo === undefined)
    return <span className="ws-access-badge">Access unavailable</span>;
  const members =
    visibleTo?.filter(
      (email) =>
        team.find((member) => member.email === email)?.role !== "admin",
    ) ?? [];
  const label =
    visibleTo === null
      ? "Everyone"
      : members.length
        ? `Selected members (${members.length})`
        : "Admins only";
  const detail =
    visibleTo === null
      ? "Available to all current and future team members"
      : members.length
        ? `Available to admins and ${members.map((email) => team.find((member) => member.email === email)?.display_name || email).join(", ")}`
        : "Private: only admins can access this";
  return (
    <span
      className={`ws-access-badge${visibleTo !== null ? " restricted" : ""}`}
      title={detail}
    >
      <span aria-hidden="true">{visibleTo === null ? "●" : "◈"}</span> {label}
    </span>
  );
}
