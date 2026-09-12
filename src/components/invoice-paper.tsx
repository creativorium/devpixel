import { PixelMark } from "./brand";
import { money, totals, type Invoice } from "@/lib/invoice";
export function InvoicePaper({ data }: { data: Invoice }) {
  const sum = totals(data);
  return (
    <article className="invoice-paper">
      <div className="paper-head">
        <div className="paper-brand">
          <PixelMark />
          <strong>{data.company || "Your company"}</strong>
        </div>
        <span className="eyebrow">INVOICE</span>
      </div>
      <div className="paper-title">
        <h2>{data.number || "DNP-001"}</h2>
        <p>{data.project || "Your next great project"}</p>
      </div>
      <div className="paper-parties">
        <div>
          <span className="eyebrow">BILLED TO</span>
          <strong>{data.client || "Client name"}</strong>
          <p>
            {data.clientEmail}
            <br />
            {data.clientAddress}
          </p>
        </div>
        <div>
          <span className="eyebrow">FROM</span>
          <strong>{data.sender || data.company}</strong>
          <p>
            {data.email}
            <br />
            {data.address}
          </p>
        </div>
        <div>
          <span className="eyebrow">ISSUED</span>
          <p>{data.issued}</p>
          <span className="eyebrow">DUE DATE</span>
          <p>{data.due}</p>
        </div>
      </div>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((i, n) => (
            <tr key={i.id}>
              <td>
                {i.description || "Item description"}
                {i.subDescription && (
                  <small className="item-subdescription">
                    {i.subDescription}
                  </small>
                )}
                {i.discount > 0 && <small>{i.discount}% item discount</small>}
              </td>
              <td>
                {i.unit === "fixed" ? 1 : i.quantity}
                <small>{i.unit}</small>
              </td>
              <td>{money(i.rate, data.currency)}</td>
              <td>{money(sum.lines[n], data.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="paper-totals">
        <div>
          <span>Subtotal</span>
          <span>{money(sum.subtotal, data.currency)}</span>
        </div>
        {data.discount > 0 && (
          <div>
            <span>Discount ({data.discount}%)</span>
            <span>−{money(sum.discount, data.currency)}</span>
          </div>
        )}
        {data.taxEnabled && (
          <div>
            <span>Tax ({data.tax}%)</span>
            <span>{money(sum.tax, data.currency)}</span>
          </div>
        )}
        <div className="grand-total">
          <span>Total due</span>
          <strong>{money(sum.total, data.currency)}</strong>
        </div>
      </div>
      <div className="paper-notes">
        {data.payment && (
          <div>
            <span className="eyebrow">PAYMENT DETAILS</span>
            <p>{data.payment}</p>
          </div>
        )}
        {data.notes && (
          <div>
            <span className="eyebrow">A LITTLE NOTE</span>
            <p>{data.notes}</p>
          </div>
        )}
      </div>
      <div className="paper-footer">
        <span>MADE WITH PURPOSE. DOWN TO THE PIXEL.</span>
        <PixelMark />
      </div>
    </article>
  );
}
