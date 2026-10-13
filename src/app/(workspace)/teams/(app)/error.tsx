"use client";

import { useEffect } from "react";

// Shown instead of a blank "This page couldn't load" so the sidebar stays usable
// and the real error is visible (and easy to report).
export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[workspace]", error);
  }, [error]);
  const details = [
    `Page: ${typeof location === "undefined" ? "" : location.pathname + location.search}`,
    `Error: ${error.message || "(no message)"}`,
    error.digest ? `Reference: ${error.digest}` : "",
    `Time: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <div className="ws-page">
      <div className="ws-panel ws-error-panel" role="alert">
        <h1 className="ws-title">Something went wrong</h1>
        <p>
          This part of the workspace hit an error. Your data is safe. Try again,
          and if it keeps happening, copy the details below and send them over.
        </p>
        <pre className="ws-error-details">{details}</pre>
        <div className="ws-form-actions">
          <button type="button" className="ws-button" onClick={() => reset()}>
            Try again
          </button>
          <button
            type="button"
            className="ws-button ghost"
            onClick={() => void navigator.clipboard?.writeText(details)}
          >
            Copy details
          </button>
          {/* A full reload clears any broken client state. */}
          <button
            type="button"
            className="ws-button ghost"
            onClick={() => location.assign("/teams")}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
