# Villa Bumi — Hostinger deployment

Target: https://villabumi.com. Source project: generated `output/villabumi-site/`.

Run `node scripts/prepare-villabumi.mjs` from DevnPixel to regenerate the standalone app. Make source changes in the DevnPixel Villa Bumi components or this generator, then regenerate; direct edits in output will be overwritten. Never run a deployment ZIP against the whole DevnPixel repository.

## Local use

In the standalone folder, run `npm ci`, `npm test`, `npm run build`, then `npm run dev`. Open http://localhost:3002. DevnPixel can stay on port 3000. For a production-mode check on Windows, run `node node_modules/next/dist/bin/next start --port 3002` after building. Run `powershell -File scripts/package-villabumi.ps1` from DevnPixel to create the source ZIP. It includes a lockfile and excludes node_modules, .next, secrets, and DevnPixel's workspace.

The calendar fetches published availability and USD/IDR rates from the existing Total Bali provider through `/api/villabumi/booking`. No provider credentials or database are required. Provider failures show a retry/contact fallback. The enquiry form prepares a WhatsApp message; the guest opens WhatsApp and sends it themselves. It does not submit bookings, take payments, send email, or reserve dates. Verify the owner’s phone, email, Instagram and content in `src/lib/villabumi.ts` before launch.

## Hostinger staging

Open hPanel → Websites → Create/Add website → Web App / Node.js. Use Upload website files and select `villabumi-hostinger-source.zip`, or place the standalone folder contents at the root of a separate GitHub repository and connect it. Do not connect the entire DevnPixel repository.

Select Next.js (server-side), Node.js 22, build command `npm run build`, output `.next`, start command `npm start` if requested. Hostinger must run the Node server, not treat this as a static `out` export. Keep the host-supplied PORT; do not hardcode a production port. Use the temporary URL first. The package has Node.js support, but verify the actual hPanel's settings when access is available.

Set `SITE_INDEXABLE=false` for staging. This prevents indexing by compliant search engines; it is not password protection. On the final domain set `SITE_INDEXABLE=true` and rebuild. The environment setting is read at build time for SEO routes.

Check homepage, local photos, mobile menu/gallery, calendar, USD/IDR switch, failed-provider fallback, enquiry link, mail/phone/Instagram links, favicon, robots.txt, sitemap.xml, and page metadata. A prepared WhatsApp message is not evidence that the owner received it. Complete a manual owner-approved enquiry test after launch.

## Domain cutover

Before changing DNS, export the current DNS records and back up the existing website. Identify the domain registrar and DNS provider; hosting access alone may not grant DNS access. Preserve MX, SPF, DKIM, DMARC and email-verification records for info@villabumi.com. Do not replace nameservers without copying existing email records.

Connect villabumi.com using the records Hostinger provides in this account, issue SSL, choose https://villabumi.com as canonical and redirect www to it through the hosting/domain settings. Inventory old website URLs and create relevant redirects before switching; do not redirect every old path blindly to the homepage. Retain the old host backup/DNS values for rollback. Verify root and www, HTTPS, booking endpoint and email after DNS propagation. Enable indexing on the final domain only after testing.

## DevnPixel portfolio

Villa Bumi is a client project at `/work/villabumi`, with its design preview at `/work/villabumi/preview`. The old `/showcase/villabumi` URL redirects to that preview. After successful domain cutover, change the case-study preview link to https://villabumi.com and use “Visit the website”. Updating the portfolio alone does not deploy the villa or change DNS.
