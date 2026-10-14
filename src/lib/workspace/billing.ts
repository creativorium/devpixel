import { z } from "zod";
import { newInvoice, type Invoice } from "../invoice";

export const billingSchema = z.object({
  client: z.string().max(250).default(""),
  clientEmail: z.string().max(250).default(""),
  clientAddress: z.string().max(250).default(""),
  currency: z.enum(["IDR", "USD", "EUR", "GBP", "AUD", "SGD"]).default("IDR"),
  company: z.string().max(250).default("DevnPixel"),
  sender: z.string().max(250).default(""),
  email: z.string().max(250).default("code@devnpixel.com"),
  address: z.string().max(250).default(""),
  payment: z.string().max(5000).default(""),
});
export type BillingDetails = z.infer<typeof billingSchema>;
export type BillingTask = {
  id: string;
  title: string;
  parent_id: string | null;
  status: string;
};
export const invoiceLinksSchema = z
  .array(
    z.object({
      itemId: z.string().min(1).max(100),
      taskIds: z.array(z.uuid()).min(1).max(500),
    }),
  )
  .max(100);
export type InvoiceTaskLink = z.infer<typeof invoiceLinksSchema>[number];

// Only titles cross into the invoice. Never copy task descriptions, comments or attachments.
export function invoiceFromTasks(
  project: string,
  tasks: BillingTask[],
  selected: string[],
  includeSubtasks: boolean,
  billing: BillingDetails,
  makeId: () => string,
) {
  const selectedSet = new Set(selected);
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const hasSelectedAncestor = (task: BillingTask) => {
    const seen = new Set([task.id]);
    let parent = task.parent_id;
    while (parent && !seen.has(parent)) {
      if (selectedSet.has(parent)) return true;
      seen.add(parent);
      parent = byId.get(parent)?.parent_id ?? null;
    }
    return false;
  };
  const roots = tasks.filter(
    (task) =>
      selectedSet.has(task.id) &&
      (!includeSubtasks || !hasSelectedAncestor(task)),
  );
  const links: InvoiceTaskLink[] = [];
  const items = roots.map((task) => {
    const descendants: BillingTask[] = [];
    const seen = new Set([task.id]);
    function collect(parent: string) {
      for (const child of tasks.filter((item) => item.parent_id === parent)) {
        if (seen.has(child.id)) continue;
        seen.add(child.id);
        descendants.push(child);
        collect(child.id);
      }
    }
    if (includeSubtasks) collect(task.id);
    const id = makeId();
    links.push({
      itemId: id,
      taskIds: [task.id, ...descendants.map((child) => child.id)],
    });
    return {
      id,
      description: task.title,
      subDescription: descendants.map((child) => `• ${child.title}`).join("\n"),
      quantity: 1,
      unit: "fixed" as const,
      rate: 0,
      discount: 0,
    };
  });
  const invoice: Invoice = { ...newInvoice(), ...billing, project, items };
  return { invoice, links };
}

export function linkedTaskIds(invoice: Invoice, links: InvoiceTaskLink[]) {
  const items = new Set(invoice.items.map((item) => item.id));
  return [
    ...new Set(
      links
        .filter((link) => items.has(link.itemId))
        .flatMap((link) => link.taskIds),
    ),
  ];
}
