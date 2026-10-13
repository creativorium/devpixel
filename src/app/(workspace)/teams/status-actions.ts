"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { statusDefinitionInput } from "@/lib/workspace/model";
import { requireMember } from "@/lib/workspace/session";

export async function saveProjectStatus(
  projectId: string,
  id: string | null,
  label: string,
  color: string,
) {
  const { supabase } = await requireMember();
  const input = statusDefinitionInput.safeParse({
    id: id ?? "todo",
    label,
    color,
  });
  if (!z.uuid().safeParse(projectId).success || !input.success)
    return {
      ok: false,
      message: "Use a status name of 1–40 characters and a valid color.",
    };
  const { error } = await supabase.rpc("save_project_status", {
    p_project_id: projectId,
    p_status_id: id,
    p_label: input.data.label,
    p_color: input.data.color,
  });
  if (error) {
    const known = [
      "A status with this name already exists",
      "Maximum 20 statuses per project",
      "Unknown project status",
    ];
    return {
      ok: false,
      message:
        known.find((message) => error.message.includes(message)) ??
        "Could not save the status. Make sure the custom project statuses migration has been applied, then try again.",
    };
  }
  revalidatePath("/teams", "layout");
  return { ok: true, message: "Status saved." };
}
