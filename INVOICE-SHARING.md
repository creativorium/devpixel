# Sharing invoices

Open `/invoice`, fill in the client, invoice number, company, dates and line items, then select **Create snapshot link**. The button copies the URL when clipboard permission is available; the generated URL also appears in a selectable field.

Create invoice A and keep its link, then create invoice B and keep that link. Each URL contains an independent fixed snapshot. Changing or replacing the local draft does not change earlier links. Recipients use `/invoice/view#v1.…` to read and print the invoice without an editor or login. Save each link or export a JSON backup: the editor keeps only the current draft and there is no server-side history.

No database, Google Sheets, API key, or additional Netlify environment variable is required. Invoice JSON is compressed and encoded into the URL fragment. It is not encrypted, signed, or proof of the sender's identity. Anyone with the complete link can read or forward it; technically a recipient can construct a modified snapshot too. Verify payment instructions directly. Links cannot be revoked or updated. For an update, generate and send a new link, clearly replacing the old invoice.

The fragment is processed in the recipient's browser and is not included in HTTP requests. The viewer has no Analytics, shared site scripts, browser draft storage, or external links. Its CSP blocks outbound connections and external scripts, it uses a no-referrer policy, and it is excluded from indexing and the sitemap. The clipboard, browser history, and the service used to send the link still hold the full URL; treat it like the invoice document itself. Keep Netlify's optional badge disabled for this site as configured in the dashboard.

Links have a 16,000-character payload limit and a 250 KB decompressed limit. For large invoices or messaging tools that truncate long links, send the PDF instead. Future storage-backed invoices would require a different design with private storage, owner authentication, and revocation controls.

Edit the shared preview in `src/components/invoice-paper.tsx`; both the editor and viewer use it. Codec and validation are in `src/lib/invoice-share.ts`. Run `npm test` for snapshot round-trip and malformed-input checks, and `node tests/invoice-sharing.mjs` with `TEST_BASE_URL` set to a local production server for browser verification.
