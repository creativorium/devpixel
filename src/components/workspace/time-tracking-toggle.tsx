"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTimeTracking } from "@/app/(workspace)/teams/time-actions";

export default function TimeTrackingToggle({
  projectId,
  enabled,
}: {
  projectId: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <div>
      <button
        type="button"
        className="ws-button ghost small"
        aria-pressed={enabled}
        disabled={pending}
        title="Enable or disable manual time logs for this project. Existing logs are preserved."
        onClick={() =>
          start(async () => {
            setError("");
            try {
              const result = await setTimeTracking(projectId, !enabled);
              if (result.error) setError(result.error);
              else router.refresh();
            } catch {
              setError("Could not change time logging. Try again.");
            }
          })
        }
      >
        {pending ? "Saving…" : `Time logs: ${enabled ? "On" : "Off"}`}
      </button>
      {error && (
        <p role="alert" className="ws-error-text">
          {error}
        </p>
      )}
    </div>
  );
}
