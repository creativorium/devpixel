# DevnPixel

A monochrome agency website built with Next.js, React, TypeScript, and Three.js. The homepage features an original voxel desk with a slow automatic orbit and a lamp that follows the website theme. All fonts are served locally.

## Local development

Use Node.js 22 or newer:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production locally, run `npm run build` followed by `npm start`. Restart the production server after each new build.

## Edit your content

- `src/lib/site.ts`: contact email, WhatsApp number, and portfolio entries. The current portfolio entries are clearly labelled concepts, not client work.
- `src/lib/services.ts`: Brand strategy, Web design, Development, and Advertising descriptions, deliverables, processes, and FAQs. The former Digital Experiences URL redirects to Advertising.
- `src/lib/voxel-desk.ts`: original desk geometry, monitor, creative tools, plants, and lamp. The supplied stock reference image is not included in this project.
- `src/components/pixel-room-viewer.tsx`: fine-resolution homepage desk and interactive room preview. Homepage rendering pauses offscreen/in background tabs, reuses static shadows, and respects reduced motion.
- `src/components/theme-toggle.tsx`: icon-only theme switch beside “Let’s talk”; remembers a browser preference and otherwise defaults to white/light.
- `src/app/page.tsx`, `src/app/about/page.tsx`: homepage and studio content.
- `src/components/project-card.tsx`: original concept artwork; replace with your real projects.
- `src/components/sculpture.tsx`: five CSS 3D voxel shapes with pointer tilt, pause, and assemble/explode controls.
- `src/app/globals.css`: layout, themes, responsive styles, transitions, and invoice print styling.

The header remains visible while scrolling. The ticker spans the page and scrolls automatically, with a pause button and stationary reduced-motion alternative.

## Contact form and WhatsApp

The destination is **code@devnpixel.com**. Direct email works through a mailto link; you need an active mailbox at that address to receive messages.

The form has a server-side Resend integration at `/api/contact`. It is deliberately disabled until both environment variables are supplied at build time. No live email delivery has been verified without those credentials. Unit tests mock the provider and never send real email.

To enable form delivery:

1. Create a Resend account. Verify a sending domain (a subdomain such as `notify.devnpixel.com` keeps sending records separate from your existing mailbox).
2. Add only the DNS records Resend supplies to Hostinger. Preserve the existing mailbox MX, SPF, DKIM, and DMARC records. Do not replace the receiving mail configuration.
3. Create a sending API key and add these in **Vercel → Project → Settings → Environment Variables**:
   - `RESEND_API_KEY`: the private sending key.
   - `CONTACT_FROM_EMAIL`: a verified sender, such as `DevnPixel <website@notify.devnpixel.com>`.
4. Redeploy so the contact page enables its submit button. Keep these variables server-only; do not prefix them with `NEXT_PUBLIC_`.
5. Send one genuine test enquiry and confirm arrival in `code@devnpixel.com`, including its spam folder. Provider acceptance is not a guarantee of inbox delivery.

For local setup, copy `.env.example` to `.env.local` and fill values there. `.env.local` is ignored by Git. Never put real keys into `.env.example`, source files, chat messages, or commits.

The endpoint has strict field validation, request-size limits, same-origin checks, a honeypot, timeouts, a fixed recipient, and plain-text messages. Visitor addresses are used only for Reply-To. It does not expose provider errors or log enquiry contents. Its bounded in-memory throttle allows five attempts per IP per 15 minutes **per server instance**; it is not a distributed bot defence. Before enabling the public form, add an edge-wide rule for POST `/api/contact` in the Vercel Firewall and monitor provider quotas and abuse.

WhatsApp is configured for +62 877-6018-5018 in `site.whatsappNumber`. Use international digits only, with country code, without `+`, spaces, or a leading local zero. Once configured, the component links to `wa.me` in a new tab; it does not send messages automatically.

## Invoice tool

Bookmark `/invoice`. It is excluded from navigation, search indexing, and the sitemap. Hiding the route does not add authentication.

Each line has a title, optional multi-line sub-description, quantity/hour/fixed-fee rate, and percentage discount. Invoices include currency selection, an invoice discount, an explicit tax on/off switch, payment details, and notes. Disabling tax removes it from the total and preview while preserving the entered percentage. Old JSON backups without the switch retain their original tax calculation. Existing item descriptions become titles, with an empty sub-description.

Drafts save only in your browser’s localStorage. JSON export/import backs them up or moves them between browsers. Import replaces the current draft; export first to keep a copy. Print / Save PDF uses the native browser dialog: choose A4, disable browser headers/footers, and save as PDF. Invoices stay white and readable even in website dark mode.

Line totals round first, then invoice discount, then enabled tax. IDR rounds to whole rupiah; other supported currencies round to cents. Fractional hours use decimals (1.5 = 1h 30m). This is an invoice creation utility, not accounting or tax-compliance software.

No invoices, bank details, or draft data are uploaded to a server or included in share URLs. Other people using the same browser profile can access the local draft. The original reference project’s credentials, Google Sheets endpoint, and personal banking details are not included.

## Room experiment

`/threedanimation` retains the original full room preview with drag-to-orbit, accessible view buttons, day/night controls, and selectable pixel sizes. It is noindex and is not in public navigation. Edit its geometry in `src/lib/pixel-room.ts`.

## Deploy from GitHub to Vercel

Repository: https://github.com/creativorium/devpixel

1. In Vercel, choose **Add New → Project**, connect GitHub, and import `creativorium/devpixel`.
2. Use the repository root, the detected **Next.js** preset, and Node.js 22.x. Default build command: `npm run build`. No custom output directory is needed.
3. Add the two email environment variables when ready. The website deploys without them, but form submission stays disabled.
4. Deploy and review the generated `vercel.app` address.
5. In **Project → Settings → Domains**, add `devnpixel.com` and `www.devnpixel.com`. Redirect `www` to the apex domain, matching the canonical URLs in the code.
6. In **Hostinger → Domains → devnpixel.com → DNS / Nameservers**, update only the website records with the exact values Vercel displays: typically the apex (`@`) A record and `www` CNAME. Remove conflicting records for those same website hostnames when replacing them. Keep Hostinger nameservers and all email records. No domain transfer is necessary.
7. Wait for Vercel to report a valid configuration and issue HTTPS. Verify both domain variants, all main pages, and email delivery after email setup.

Do not copy generic DNS IPs from old tutorials: Vercel may assign project-specific values. Official domain guide: https://vercel.com/docs/domains/working-with-domains/add-a-domain

After the repository is connected, future pushes to its production branch normally trigger Vercel deployments.

## Security and checks

Security headers are in `next.config.ts`: CSP, anti-framing, MIME sniffing protection, referrer and permissions policies, and HSTS. Inline scripts/styles remain allowed for Next.js static hydration, the early theme initializer, and CSS 3D styles. There is no blanket claim that these controls eliminate every vulnerability. Keep dependencies updated and monitor the deployed service.

Git ignores `.next`, `node_modules`, local environment files, `.vercel`, test screenshots, sample invoices/PDFs, logs, and TypeScript caches. GitHub CI uses pinned official action commits with read-only repository permissions. Dependabot checks npm and action updates.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

ESLint remains on 9.39.5 because this release of Next.js’s React lint plugin fails on ESLint 10. Revisit this development-only compatibility pin when upstream support is ready.

With the production server running and Chrome installed:

```sh
npm run test:browser
npm run test:room
npm run test:theme
```

Tests cover navigation, mobile layouts, themes, WebGL controls/fallback, invoice math/persistence/import/export, contact validation and mocked email delivery. Browser outputs go in ignored `test-results/`. `npm run format` formats the source.
