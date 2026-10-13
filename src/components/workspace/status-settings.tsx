"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProjectStatus } from "@/app/(workspace)/teams/status-actions";
import type { StatusDefinition } from "@/lib/workspace/model";
import { useStatuses } from "./status-context";

function StatusRow({
  projectId,
  status,
}: {
  projectId: string;
  status?: StatusDefinition;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="ws-status-edit"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setBusy(true);
        setMessage("");
        try {
          const result = await saveProjectStatus(
            projectId,
            status?.id ?? null,
            String(data.get("label")),
            String(data.get("color")),
          );
          setMessage(result.message);
          if (result.ok) {
            if (!status) form.reset();
            router.refresh();
          }
        } catch {
          setMessage("Could not save. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        aria-label={`Color for ${status?.label ?? "new status"}`}
        type="color"
        name="color"
        defaultValue={status?.color ?? "#7c3aed"}
        disabled={busy}
      />
      <label className="ws-field">
        {status
          ? status.id === "done"
            ? "Completion status"
            : status.id === "todo"
              ? "Starting status"
              : "Status name"
          : "New status"}
        <input
          className="ws-input"
          name="label"
          aria-label={status ? `Rename ${status.label}` : "New status name"}
          defaultValue={status?.label ?? ""}
          placeholder="e.g. Client approval"
          required
          maxLength={40}
          disabled={busy}
        />
      </label>
      <button className="ws-button ghost small" disabled={busy}>
        {busy ? "Saving…" : status ? "Save" : "Add status"}
      </button>
      {message && (
        <p className="ws-meta ws-status-feedback" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
export default function StatusSettings({ projectId }: { projectId: string }) {
  const statuses = useStatuses(projectId);
  return (
    <details className="ws-status-settings">
      <summary className="ws-button ghost small">Manage statuses</summary>
      <div className="ws-status-settings-body">
        <h2>Project statuses</h2>
        <p className="ws-meta">
          Rename columns or change their colors. New statuses are open stages
          placed before completion. Starting and completion statuses keep their
          behavior when renamed.
        </p>
        {statuses.map((status) => (
          <StatusRow
            key={`${status.id}-${status.label}-${status.color}`}
            projectId={projectId}
            status={status}
          />
        ))}
        {statuses.length < 20 && <StatusRow projectId={projectId} />}
      </div>
    </details>
  );
}
