import { InvoiceSnapshot } from "@/components/invoice-snapshot";
export default async function ShortInvoice({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <InvoiceSnapshot id={(await params).id} />;
}
