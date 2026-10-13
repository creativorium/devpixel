import {
  labels as labelOptions,
  memberName,
  statuses,
  type Member,
} from "./model";

const statusLabel = (id: unknown) =>
  statuses.find((s) => s.id === id)?.label ?? String(id ?? "");

/** One readable line per change, e.g. "moved this from To do to In progress". */
export function describeActivity(
  type: string,
  detail: Record<string, unknown>,
  team: Member[],
): string {
  switch (type) {
    case "created":
      return "created this task";
    case "status":
      return `moved this from ${statusLabel(detail.from)} to ${statusLabel(detail.to)}`;
    case "title":
      return `renamed this from “${String(detail.from ?? "")}”`;
    case "due":
      return detail.to
        ? `set the due date to ${String(detail.to)}`
        : "removed the due date";
    case "priority":
      return `set priority to ${String(detail.to ?? "")}`;
    case "labels": {
      const list = (detail.to as string[] | undefined) ?? [];
      const names = list.map(
        (id) => labelOptions.find((l) => l.id === id)?.label ?? id,
      );
      return names.length
        ? `set labels: ${names.join(", ")}`
        : "cleared the labels";
    }
    case "assignees": {
      const list = (detail.to as string[] | undefined) ?? [];
      return list.length
        ? `assigned ${list.map((e) => memberName(team, e)).join(", ")}`
        : "removed all assignees";
    }
    default:
      return "updated this task";
  }
}
