# Villa Bumi client preview

Local route: `/showcase/villabumi`. This is a client redesign preview, separate from the fictional Showcase catalogue. It is marked `noindex, nofollow` and omitted from the sitemap. This is not access control; anyone with the URL could view it after a future deployment. No deployment is performed as part of this local review.

The supplied **Villa bumi layouts 1 (1).pdf** guides the ivory/terracotta palette, split hero, about section, gallery, alternating bedrooms, facilities, rates, location and enquiry section. Photos and property information come from `https://villabumi.com/`, reviewed 2 October 2026. `scripts/fetch-villabumi-images.mjs` records the original image URLs and creates local responsive WebP assets. These client images should not be reused for unrelated fictional properties.

## Editing and interactions

- `src/lib/villabumi.ts`: portable villa content, room descriptions, photos, rates and contact links.
- `src/components/villabumi-preview.tsx`: portable React view, responsive navigation, keyboard-accessible gallery and local enquiry preview.
- `src/app/(showcase-demos)/showcase/villabumi/`: thin Next.js route, review metadata and scoped CSS.
- `public/villabumi/`: optimized client images, responsive sizes and source manifest.

The enquiry form validates locally and displays an explicit preview message. It does not send, log or persist guest information. Email, telephone, Instagram and WhatsApp links open the corresponding real contact destination. The location illustration is explicitly schematic and links to the address search used on the source website. There is no embedded map or third-party booking script. The custom availability calendar and nightly rate table read the public Total Bali villa endpoint through `/api/villabumi/booking`, restricted to Villa Bumi (villa ID 53) and USD/IDR. The server returns only unavailable date ranges and rate details, stripping reservation names and all unrelated fields. Provider failures show an unavailable state with retry and contact links; no dates or prices are invented. Data is cached for up to 60 seconds. Expired special-rate offers are omitted, and published seasonal detail is preserved without turning it into a date-specific quote.

Monthly rates on the source site and supplied PDF use USD 5,500 / 6,500 / 7,500 per month. The current website also contains older, differing IDR rates and a promotion ending February 2026. The preview labels its rates indicative; the client must approve current rates, taxes, inclusions, contact information and availability before production. The source site's regular housekeeping wording is used instead of an unverified full-time claim.

## Calendar and Instagram update

`src/components/villabumi-booking.tsx` renders six ivory/ink month grids on desktop, four on tablet, and one on phones with arrow and swipe navigation, date selection, provider-backed nightly pricing, and USD/IDR selection. Dates populate the local enquiry form; no reservation or enquiry is sent. The original calendar shows half-days for booking arrival and departure. The provider end date is checkout: its evening is available for a new stay. Arrival/departure boundaries are displayed as half-shaded cells. Checkout on another booking’s arrival day is allowed because the previous night is the last occupied night. Minimum stays and the final applicable price remain subject to villa confirmation. On 5 October 2026, a comparison of all 243 dates displayed by the original embedded calendar matched the provider API’s night availability after preserving its half-day arrival/departure boundaries.

The Instagram section uses existing Villa Bumi photographs with links to `@villabumibali`. It is a linked photographic section, not a live Instagram feed. No account token, Instagram script, or tracking iframe is required. A live feed needs a separately configured owner-authorized Instagram integration.

## Later: Vite + headless WordPress on shared hosting

The preview is hosted within the existing Next.js site for review. The view itself uses React, native links, responsive images and plain CSS, with no Next.js runtime APIs. For the production port, move the component and content model into a Vite React project, change the local content import path, and copy the CSS/assets. Supply content via an adapter that maps WordPress REST responses into the same model.

WordPress can run on the host's PHP/MySQL environment; a Vite production build generates static files for the web root. The exact URL layout, rewrite rules and API origin depend on the host. Keep WordPress credentials server-side, expose only intended public content, and use a protected server-side endpoint for real enquiries. A production build should add prerendering or equivalent crawlable HTML, canonical metadata, redirects and a sitemap for the final Villa Bumi domain. Preview `noindex` must be removed only for the approved production site. Confirm hosting features and the real booking/enquiry provider before implementing the migration.

References: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [WordPress REST API handbook](https://developer.wordpress.org/rest-api/).

## Local verification

Production build passed. Villa Bumi source lint passed. Browser checks covered 320, 390, 768, 1024 and 1440px widths, mobile navigation, gallery arrow keys/Escape, date-order validation, enquiry feedback without a POST request, image loading, noindex metadata and sitemap exclusion. Review screenshots are in the ignored `output/playwright/villabumi-*` files.
