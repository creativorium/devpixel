"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InvoiceEditor } from "@/components/invoice-editor";
import { invoiceSchema, type Invoice } from "@/lib/invoice";
import {
  billingSchema,
  invoiceFromTasks,
  invoiceLinksSchema,
  type BillingDetails,
  type BillingTask,
  type InvoiceTaskLink,
} from "@/lib/workspace/billing";
import {
  saveProjectBilling,
  saveTaskInvoice,
} from "@/app/(workspace)/teams/billing-actions";
import { site } from "@/lib/site";

type History = {
  id: string;
  invoice_number: string;
  share_id: string;
  task_ids: string[];
  state: string;
  created_at: string;
};
type Draft = { invoice: Invoice; links: InvoiceTaskLink[] };
export default function ProjectInvoices({
  projectId,
  projectName,
  email,
  tasks,
  defaults,
  history,
  setupNeeded,
}: {
  projectId: string;
  projectName: string;
  email: string;
  tasks: BillingTask[];
  defaults: BillingDetails;
  history: History[];
  setupNeeded: boolean;
}) {
  const router = useRouter();
  const [billing, setBilling] = useState(defaults);
  const [selected, setSelected] = useState<string[]>([]);
  const [includeSubtasks, setIncludeSubtasks] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("");
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [pending, start] = useTransition();
  const key = `teams-invoice:${email}:${projectId}`;
  const previouslyIncluded = new Set(history.flatMap((item) => item.task_ids));
  const fields: [keyof BillingDetails, string][] = [
    ["client", "Client / company"],
    ["clientEmail", "Client email"],
    ["clientAddress", "Client address"],
    ["company", "Your company"],
    ["sender", "Your name"],
    ["email", "Your email"],
    ["address", "Your address"],
  ];

  function prepare() {
    setMessage("");
    try {
      if (!selected.length) throw new Error("Select at least one task.");
      const result = invoiceFromTasks(
        projectName,
        tasks,
        selected,
        includeSubtasks,
        billing,
        () => crypto.randomUUID(),
      );
      result.invoice.number = `DNP-${result.invoice.issued.replaceAll("-", "")}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
      if (!invoiceSchema.safeParse(result.invoice).success)
        throw new Error(
          "Use up to 100 invoice items and shorter subtask descriptions. Select fewer tasks for this invoice.",
        );
      if (
        localStorage.getItem(key) &&
        !confirm(
          "Replace this project's local invoice draft? Export a backup first if you need to keep it.",
        )
      )
        return;
      localStorage.setItem(`${key}:links`, JSON.stringify(result.links));
      localStorage.setItem(key, JSON.stringify(result.invoice));
      localStorage.removeItem(`${key}:attempt`);
      setDraft(result);
      setAllowRepeat(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not prepare the draft.",
      );
    }
  }

  function resume() {
    try {
      const invoice = invoiceSchema.parse(
        JSON.parse(localStorage.getItem(key) ?? "null"),
      );
      const links = invoiceLinksSchema.parse(
        JSON.parse(localStorage.getItem(`${key}:links`) ?? "null"),
      );
      setDraft({ invoice, links });
      setMessage("");
      setAllowRepeat(false);
    } catch {
      setMessage("No valid project invoice draft was found in this browser.");
    }
  }

  return (
    <section className="ws-project-invoices">
      <div className="ws-billing-controls">
        <h2>Create an invoice from tasks</h2>
        <p className="ws-meta">
          Admin billing workspace. Review all titles and prices before sharing.
          Rates start at zero.
        </p>
        <p className="ws-meta">
          Previewing is local. Save &amp; copy short link writes to the
          connected Google Sheet and Teams register, including when using
          localhost. PDF and snapshot links do not mark tasks as invoiced.
        </p>
        {setupNeeded && (
          <p className="ws-notice warn">
            Draft previews are available. Apply
            20261019000000_project_invoices.sql to enable billing defaults,
            invoice history, and saving linked invoices.
          </p>
        )}
        {message && (
          <p role="status" className="ws-notice">
            {message}
          </p>
        )}
      </div>
      {!draft ? (
        <div className="ws-billing-controls">
          <details className="ws-billing-defaults">
            <summary>Project billing defaults</summary>
            <p className="ws-meta">
              Private to admins. These prefill new invoices; each invoice
              remains editable.
            </p>
            <div className="ws-billing-grid">
              {fields.map(([field, label]) => (
                <label className="ws-field" key={field}>
                  {label}
                  <input
                    className="ws-input"
                    value={billing[field]}
                    maxLength={250}
                    onChange={(event) =>
                      setBilling({ ...billing, [field]: event.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <label className="ws-field">
              Currency
              <select
                className="ws-input"
                value={billing.currency}
                onChange={(event) =>
                  setBilling({
                    ...billing,
                    currency: event.target.value as BillingDetails["currency"],
                  })
                }
              >
                {["IDR", "USD", "EUR", "GBP", "AUD", "SGD"].map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
            </label>
            <label className="ws-field">
              Payment details
              <textarea
                className="ws-input"
                rows={3}
                maxLength={5000}
                value={billing.payment}
                onChange={(event) =>
                  setBilling({ ...billing, payment: event.target.value })
                }
              />
            </label>
            <div className="ws-resource-actions">
              <button
                type="button"
                className="ws-button ghost"
                onClick={() => {
                  try {
                    const saved = invoiceSchema.parse(
                      JSON.parse(
                        localStorage.getItem("devnpixel.invoice.v1") ?? "null",
                      ),
                    );
                    setBilling({
                      ...billing,
                      company: saved.company,
                      sender: saved.sender,
                      email: saved.email,
                      address: saved.address,
                      payment: saved.payment,
                    });
                    setMessage(
                      "Sender and payment details copied from your existing invoice draft. Save defaults to reuse them.",
                    );
                  } catch {
                    setMessage(
                      "No existing invoice draft was found in this browser.",
                    );
                  }
                }}
              >
                Use existing invoice sender details
              </button>
              <button
                type="button"
                className="ws-button"
                disabled={pending || setupNeeded}
                onClick={() =>
                  start(async () => {
                    try {
                      const result = await saveProjectBilling(
                        projectId,
                        billingSchema.parse(billing),
                      );
                      setMessage(result.message);
                    } catch {
                      setMessage(
                        "Could not save billing defaults. Check the fields and try again.",
                      );
                    }
                  })
                }
              >
                {pending ? "Saving..." : "Save billing defaults"}
              </button>
            </div>
          </details>
          <h3>Select tasks</h3>
          <label className="ws-billing-check">
            <input
              type="checkbox"
              checked={includeSubtasks}
              onChange={(event) => setIncludeSubtasks(event.target.checked)}
            />{" "}
            Include subtasks as descriptions (not extra charges)
          </label>
          <div className="ws-billing-tasks">
            {tasks.map((task) => (
              <label className="ws-billing-check" key={task.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(task.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, task.id]
                        : selected.filter((id) => id !== task.id),
                    )
                  }
                />
                <span>
                  {task.parent_id ? "↳ " : ""}
                  {task.title}
                  {previouslyIncluded.has(task.id) && (
                    <small>
                      Included in an earlier invoice or pending save — review
                      history
                    </small>
                  )}
                </span>
              </label>
            ))}
            {tasks.length === 0 && (
              <p className="ws-meta">Create tasks in this project first.</p>
            )}
          </div>
          <p className="ws-meta">
            When a parent and its subtask are both selected with subtask
            descriptions enabled, they are grouped once. Uncheck that option to
            charge selected subtasks separately.
          </p>
          <div className="ws-resource-actions">
            <button
              type="button"
              className="ws-button"
              disabled={!selected.length}
              onClick={prepare}
            >
              Preview invoice ({selected.length} selected)
            </button>
            <button type="button" className="ws-button ghost" onClick={resume}>
              Resume local draft
            </button>
          </div>
          <h3>Recent invoice register</h3>
          <p className="ws-meta">
            Latest 100 attempts. All earlier records are checked again when
            saving. Recorded means saved, not paid.
          </p>
          {history.length === 0 ? (
            <p className="ws-meta">No linked invoices yet.</p>
          ) : (
            <ul className="ws-billing-history">
              {history.map((record) => (
                <li key={record.id}>
                  <span>
                    {record.invoice_number} · {record.task_ids.length} tasks ·{" "}
                    {record.state === "saved"
                      ? "Saved"
                      : "Save unconfirmed — check Sheet"}
                  </span>
                  {record.state === "saved" && (
                    <a
                      href={`${site.url}/i/${record.share_id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View invoice ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="ws-billing-controls">
            <button
              type="button"
              className="ws-button ghost"
              onClick={() => {
                setDraft(null);
                router.refresh();
              }}
            >
              ← Back to task selection
            </button>
            <label className="ws-billing-check">
              <input
                type="checkbox"
                checked={allowRepeat}
                onChange={(event) => setAllowRepeat(event.target.checked)}
              />{" "}
              I have reviewed the register and intentionally want to invoice
              previously included tasks again.
            </label>
            <p className="ws-meta">
              Removing an invoice item removes its task links. Editing a subtask
              description keeps it linked to that item; return to task selection
              to change which tasks are included.
            </p>
          </div>
          <div className="invoice-page ws-linked-invoice">
            <InvoiceEditor
              initialInvoice={draft.invoice}
              draftStorageKey={key}
              onSaveShortLink={async (invoice) => {
                if (setupNeeded)
                  throw new Error(
                    "Apply the project invoices migration and refresh before saving.",
                  );
                const signature = JSON.stringify({
                  invoice,
                  links: draft.links,
                });
                let attempt: { signature: string; id: string } | null = null;
                try {
                  attempt = JSON.parse(
                    localStorage.getItem(`${key}:attempt`) ?? "null",
                  );
                } catch {
                  /* Start a fresh attempt for malformed local state. */
                }
                if (attempt?.signature !== signature) {
                  attempt = { signature, id: crypto.randomUUID() };
                  localStorage.setItem(
                    `${key}:attempt`,
                    JSON.stringify(attempt),
                  );
                }
                const result = await saveTaskInvoice({
                  projectId,
                  attemptId: attempt!.id,
                  invoice,
                  links: draft.links,
                  allowPreviouslyInvoiced: allowRepeat,
                });
                if (!result.ok) throw new Error(result.message);
                router.refresh();
                return result;
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}
