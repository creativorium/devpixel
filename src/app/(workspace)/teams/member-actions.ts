"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/workspace/session";
import { isAdmin } from "@/lib/workspace/model";

const memberInput = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  name: z.string().trim().min(1).max(80),
  role: z.enum(["admin", "member"]),
  create: z.boolean(),
});
export async function saveTeamMember(value: unknown) {
  const { supabase, me } = await requireMember();
  if (!isAdmin(me)) return { error: "Only admins can manage teammates." };
  const parsed = memberInput.safeParse(value);
  if (!parsed.success)
    return { error: "Enter a valid email, display name and role." };
  const { email, name, role, create } = parsed.data;
  const { error } = await supabase.rpc("admin_save_member", {
    member_email: email,
    member_name: name,
    member_role: role,
    create_member: create,
  });
  if (error) {
    const known = [
      "This email is already on the team.",
      "Member not found.",
      "You cannot remove your own admin role.",
      "Keep at least one admin.",
    ];
    return {
      error: known.includes(error.message)
        ? error.message
        : "Could not save the teammate. Check your admin access and apply migration 25.",
    };
  }
  revalidatePath("/teams", "layout");
  return { ok: true };
}
