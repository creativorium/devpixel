"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdmin } from "@/lib/workspace/model";
import { requireMember } from "@/lib/workspace/session";

const resourceInput = z.object({
  kind: z.enum(["project", "channel"]),
  id: z.uuid(),
});
const selectionInput = z.array(z.email().toLowerCase()).max(100).nullable();

export async function getResourceVisibility(kind: string, id: string) {
  const { supabase, me } = await requireMember();
  const input = resourceInput.safeParse({ kind, id });
  if (!isAdmin(me) || !input.success)
    return {
      ok: false as const,
      message: "Only admins can manage visibility.",
    };
  const { data, error } = await supabase
    .from(input.data.kind === "project" ? "projects" : "channels")
    .select("visible_to")
    .eq("id", input.data.id)
    .single();
  if (error)
    return {
      ok: false as const,
      message:
        "Could not load visibility. Apply the resource visibility migration, then try again.",
    };
  return { ok: true as const, visibleTo: data.visible_to as string[] | null };
}

export async function saveResourceVisibility(
  kind: string,
  id: string,
  visibleTo: string[] | null,
) {
  const { supabase, me, team } = await requireMember();
  if (!isAdmin(me))
    return { ok: false, message: "Only admins can manage visibility." };
  const input = resourceInput.safeParse({ kind, id });
  const selection = selectionInput.safeParse(visibleTo);
  if (
    !input.success ||
    !selection.success ||
    selection.data?.some(
      (email) => !team.some((member) => member.email === email),
    )
  )
    return { ok: false, message: "Select existing team members." };
  const { error } = await supabase
    .from(input.data.kind === "project" ? "projects" : "channels")
    .update({
      visible_to: selection.data === null ? null : [...new Set(selection.data)],
    })
    .eq("id", input.data.id)
    .select("id")
    .single();
  if (error)
    return {
      ok: false,
      message:
        "Could not save visibility. Check that the resource visibility migration has been applied.",
    };
  revalidatePath("/teams", "layout");
  return { ok: true, message: "Visibility saved." };
}
