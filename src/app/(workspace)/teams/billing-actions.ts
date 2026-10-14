"use server";
import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/lib/workspace/session";
import { isAdmin } from "@/lib/workspace/model";
import {
  billingSchema,
  invoiceLinksSchema,
  linkedTaskIds,
} from "@/lib/workspace/billing";
import {
  loadInvoice,
  saveInvoice,
  validateStoredInvoice,
  InvoiceSetupError,
} from "@/lib/invoice-store";
import { site } from "@/lib/site";

export async function saveProjectBilling(projectId: string, value: unknown) {
  const { supabase, me } = await requireMember();
  if (!isAdmin(me))
    return { ok: false, message: "Only admins can manage billing." };
  const parsed = billingSchema.safeParse(value);
  if (!z.uuid().safeParse(projectId).success || !parsed.success)
    return { ok: false, message: "Check the billing fields." };
  const { error } = await supabase
    .from("project_billing")
    .upsert({ project_id: projectId, details: parsed.data });
  if (error)
    return {
      ok: false,
      message:
        "Could not save billing details. Apply the project invoices migration first.",
    };
  revalidatePath(`/teams/p/${projectId}/invoices`);
  return { ok: true, message: "Project billing defaults saved." };
}

async function saveTaskInvoiceInternal(value: unknown) {
  const { supabase, me } = await requireMember();
  if (!isAdmin(me)) throw new Error("Only admins can create project invoices.");
  const input = z
    .object({
      projectId: z.uuid(),
      attemptId: z.uuid(),
      invoice: z.unknown(),
      links: invoiceLinksSchema,
      allowPreviouslyInvoiced: z.boolean(),
    })
    .parse(value);
  const invoice = validateStoredInvoice(input.invoice);
  const taskIds = linkedTaskIds(invoice, input.links).sort();
  if (taskIds.length < 1 || taskIds.length > 500)
    throw new Error(
      "Keep at least one selected task on the invoice (maximum 500 tasks including subtasks).",
    );
  const fingerprint = createHash("sha256")
    .update(JSON.stringify({ invoice, taskIds }))
    .digest("hex");
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("project_id", input.projectId)
    .in("id", taskIds);
  if (taskError || tasks?.length !== taskIds.length)
    throw new Error(
      "A selected task is no longer available in this project. Refresh and select the tasks again.",
    );
  const { data: existing, error: readError } = await supabase
    .from("project_invoices")
    .select("*")
    .eq("id", input.attemptId)
    .maybeSingle();
  if (readError)
    throw new Error(
      "Apply the project invoices SQL migration before saving a short link.",
    );
  if (existing) {
    if (
      existing.project_id !== input.projectId ||
      existing.fingerprint !== fingerprint
    )
      throw new Error(
        "This save attempt belongs to a different draft. Review the invoice before starting a new save.",
      );
    const url = `${site.url}/i/${existing.share_id}`;
    if (existing.state === "saved") return { url };
    if (Date.now() - Date.parse(existing.created_at) < 60000)
      throw new Error(
        "This invoice is still saving. Wait a minute before checking again.",
      );
    // Never append again after an ambiguous timeout: first reconcile the reserved link.
    const stored = await loadInvoice(existing.share_id).catch(() => {
      throw new Error(
        "Could not check the saved invoice in Google Sheets. Try again later.",
      );
    });
    if (!stored)
      throw new Error(
        "The previous save could not be confirmed. Check the Google Sheet before creating a new invoice; this attempt will not append a duplicate.",
      );
    if (JSON.stringify(stored) !== JSON.stringify(invoice))
      throw new Error(
        "The saved invoice differs from this draft. Check the invoice register.",
      );
    const { error } = await supabase
      .from("project_invoices")
      .update({ state: "saved" })
      .eq("id", existing.id);
    revalidatePath(`/teams/p/${input.projectId}/invoices`);
    return {
      url,
      warning: error
        ? "The invoice is saved, but its task register still needs reconciliation. Keep this link."
        : undefined,
    };
  }
  const { data: previous, error: historyError } = await supabase
    .from("project_invoices")
    .select("task_ids")
    .eq("project_id", input.projectId)
    .overlaps("task_ids", taskIds);
  if (historyError)
    throw new Error(
      "Could not check previously invoiced tasks. Please try again.",
    );
  if (previous?.length && !input.allowPreviouslyInvoiced)
    throw new Error(
      "Some tasks already have a saved or pending invoice. Review the register and tick the repeat-billing confirmation if intentional.",
    );
  const shareId = randomBytes(18).toString("base64url");
  const { error: reserveError } = await supabase
    .from("project_invoices")
    .insert({
      id: input.attemptId,
      project_id: input.projectId,
      share_id: shareId,
      invoice_number: invoice.number,
      fingerprint,
      task_ids: taskIds,
      repeat_approved: input.allowPreviouslyInvoiced,
    });
  if (reserveError)
    throw new Error(
      "Could not reserve this invoice. It may already be saving; wait a minute and try the same draft again.",
    );
  try {
    const result = await saveInvoice(invoice, undefined, shareId);
    const { error } = await supabase
      .from("project_invoices")
      .update({ state: "saved" })
      .eq("id", input.attemptId);
    revalidatePath(`/teams/p/${input.projectId}/invoices`);
    return {
      url: result.url,
      warning: error
        ? "Saved to Google Sheets, but the task register could not be confirmed. Keep this link and check the register before billing again."
        : undefined,
    };
  } catch (error) {
    await supabase
      .from("project_invoices")
      .update({ state: "uncertain" })
      .eq("id", input.attemptId);
    revalidatePath(`/teams/p/${input.projectId}/invoices`);
    throw new Error(
      (error instanceof InvoiceSetupError ? error.message + " " : "") +
        "Saving was not confirmed. Check your Google Sheet; retrying this unchanged draft will check the existing attempt instead of creating another copy.",
    );
  }
}

export async function saveTaskInvoice(value: unknown) {
  await requireMember();
  try {
    return { ok: true as const, ...(await saveTaskInvoiceInternal(value)) };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error ? error.message : "Could not save the invoice.",
    };
  }
}
