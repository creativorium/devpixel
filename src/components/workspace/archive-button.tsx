"use client";

import { useTransition } from "react";
import { setProjectArchived } from "@/app/(workspace)/teams/actions";

export default function ArchiveButton({
  projectId,
  archived,
}: {
  projectId: string;
  archived: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="ws-button ghost small"
      disabled={pending}
      onClick={() => {
        if (
          !archived &&
          !confirm("Archive this project? You can restore it later.")
        )
          return;
        start(async () => {
          const result = await setProjectArchived(projectId, !archived);
          if (!result.ok) alert(result.message);
        });
      }}
    >
      {archived ? "Restore" : "Archive"}
    </button>
  );
}
