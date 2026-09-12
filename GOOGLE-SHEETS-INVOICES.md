# Private Google Sheets invoice register

Short invoice links use `/i/<random-code>`. Your private Sheet stores one fixed copy per link. The original `/invoice/view#...` snapshot links still work without Google Sheets.

## Set up once

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select a project and enable **Google Sheets API**.
2. Create a service account under **IAM & Admin → Service Accounts**. No project-wide IAM role or domain-wide delegation is needed. Open its **Keys** tab, choose **Add key → Create new key → JSON**. Keep the downloaded file outside this repository; it contains a private key.
3. Create a Google Sheet and rename its worksheet tab exactly `Invoices`. Paste this tab-separated header into cell A1:

```text
ID	Created UTC	Invoice number	Client	Currency	Total	View link	Snapshot JSON	Status
```

4. Share **only this Sheet** with the JSON file's `client_email` as **Editor**. Keep General access **Restricted**. Do not publish the Sheet or enable "Anyone with the link" sharing.
5. Add these server environment variables in **Netlify → Project configuration → Environment variables**. Include the Functions scope if scope selection is available, and use the production deploy context. Do not expose production credentials to untrusted preview deploys.

| Variable                             | Value                                                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_SHEETS_SPREADSHEET_ID`       | The part between `/d/` and `/edit` in the Sheet URL; not the `gid`                                                                      |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`       | `client_email` from the downloaded JSON                                                                                                 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | `private_key` from the JSON, including BEGIN/END PRIVATE KEY lines. Actual newlines or literal `\n` work; omit surrounding JSON quotes. |
| `INVOICE_OWNER_SECRET`               | A unique randomly generated password, 32–256 characters long, stored in your password manager                                           |

Generate a suitable password locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Do not send credentials in chat or commit them to GitHub. For local testing, use the ignored `.env.local` file.

6. Redeploy. Open `/invoice`, complete an invoice, expand **Create a short link**, enter the owner password and choose **Save & copy short link**. The password stays in page memory only; it is not saved with drafts or placed in links.
7. Verify a row appears in the Sheet and open its View link in a private browser window. Confirm client, line items, amount, and printing. This live check requires your actual Google configuration; automated tests mock Sheets.

## Managing invoices

- Every save creates a new random link and a separate row. You can share multiple invoices at once. Editing the local draft does not update previously saved copies.
- To revoke a short link, change its **Status** from `active` to `revoked`, or delete its row. Future loads stop displaying it; already downloaded copies and open pages cannot be recalled.
- To correct an invoice, generate a new link and revoke the old one. The JSON column is the source of the displayed invoice; editing summary columns does not edit the invoice. Preserve the header names and column order. You can sort entire rows, but never sort an individual column separately.
- Links have no built-in expiry. They require the website, Sheet, service-account access and credentials to remain available. Keep JSON/PDF backups and export your Sheet periodically.
- Anyone who receives a link can view its invoice. Treat links as confidential. Google and your hosting provider process the stored data/requests; unlike fragment-only snapshots, the short identifier passes through hosting access logs. Invoice viewers contain no analytics and send no referrer; API responses are not cached.
- Sheets is suitable for this small invoice register, not a high-volume billing platform. API quotas/outages can temporarily prevent saves or reads. If a save times out, check the Sheet before retrying to avoid creating duplicate rows. Invoices larger than 45,000 JSON characters must use PDF or an existing snapshot link.
- API routes include a best-effort per-instance request limit. It does not replace a distributed hosting firewall; configure additional edge limits if traffic or abuse warrants it.
- Do not put payment-card details or other unnecessary sensitive information into invoices. Delete records when no longer needed under your retention requirements. Restrict Sheet access to people who need the invoice data.

Google documentation: [Service-account authentication](https://developers.google.com/identity/protocols/oauth2/service-account), [Appending Sheet values](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append).
