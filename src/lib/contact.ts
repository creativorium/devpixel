import { z } from "zod";
import { services } from "./services";
export const budgets = [
  "Let’s discuss",
  "Under $2,000",
  "$2,000–$5,000",
  "$5,000–$10,000",
  "$10,000+",
] as const;
export const contactSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[^\r\n]+$/),
    email: z.email().max(254),
    service: z
      .string()
      .refine((s) =>
        [
          "Web design & development",
          "Something else",
          ...services.map((s) => s.name),
        ].includes(s),
      ),
    budget: z.enum(budgets),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(500).default(""),
  })
  .strict();
export type ContactData = z.infer<typeof contactSchema>;
export function emailText(data: ContactData) {
  return `New DevnPixel enquiry\n\nName: ${data.name}\nEmail: ${data.email}\nService: ${data.service}\nBudget: ${data.budget}\n\nMessage:\n${data.message}`;
}
