import {
  labels as labelOptions,
  memberName,
  statuses,
  type Member,
  type StatusDefinition,
} from "./model";

/** One readable line per change, e.g. "moved this from To do to In progress". */
export function describeActivity(
  type: string,
  detail: Record<string, unknown>,
  team: Member[],
  options: readonly StatusDefinition[] = statuses,
): string {
  const statusLabel = (id: unknown) =>
    options.find((s) => s.id === id)?.label ?? "Other status";
  switch (type) {
    case "time_logged":
    case "time_updated":
    case "time_deleted": {
      const minutes = Number(detail.minutes) || 0;
      const duration = `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
      const verb =
        type === "time_logged"
          ? "logged"
          : type === "time_updated"
            ? "updated a time log to"
            : "removed a time log of";
      return `${verb} ${duration} for ${String(detail.work_date ?? "")}: ${String(detail.note ?? "")}`;
    }
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
