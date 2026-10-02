# Showcase preview

The local review contains **30 English concept websites: five per category**, including Spa / Wellness. These changes are prepared for local review, not automatically published. Each category has layouts and interactions suited to its business.

| Category          | Five directions                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Hospitality       | Rimba nature retreat, Solis social hotel, Linea long-stay residence, Taman field lodge, Nocturne design hotel |
| Cafe / Restaurant | Ember kitchen, Daybreak bakery, Meja seasonal table, Saltline seafood, Mori dining counter                    |
| Shops / Ecommerce | Nativ ceramics, Tide surf goods, Sari fashion, Botan skincare, Ground coffee                                  |
| Villa             | Sora coastal villa, Batu architectural house, Lumen family villa, Azul seaside villa, Arca private estate     |
| Rental            | Coast scooters, North cars, Drift surfboards, Pedal bicycles, Frame camera equipment                          |
| Spa / Wellness    | Sela spa, Aura day spa, Forma movement studio, Nami bath house, Terra private rituals                         |

The directory mentions Shopify, WordPress, suitable CMS platforms and custom development. All current demos are custom Next.js previews, **not running Shopify or WordPress**. Real platform, payments, inventory and reservation integrations are scoped for each client project.

| Category          | Concept       | URL                              |
| ----------------- | ------------- | -------------------------------- |
| Hospitality       | Rimba         | /showcase/rimba-ubud-retreat     |
| Cafe / Restaurant | Ember         | /showcase/ember-seminyak-kitchen |
| Shops / Ecommerce | Nativ objects | /showcase/nativ-bali-objects     |
| Villa             | Sora          | /showcase/sora-uluwatu-villa     |
| Rental            | Coast / Go    | /showcase/coast-canggu-rental    |

The `/showcase` directory is translated into the site's five languages. Demos are explicitly labeled English concepts. They have an isolated layout, independent colours and typography, and no added tracking or external embeds. The main navigation links to Showcase between Work and Studio.

## Editing

Spa: `/showcase/sela-ubud-spa`. Rental home: `/showcase/coast-canggu-rental`; fleet and booking: `/showcase/coast-canggu-rental/rentals`. Home model links pass a validated `bike=0`, `1` or `2` selection.

`src/components/showcase-experiences.tsx` contains the six separate experiences; `showcase-experiences.css` styles them. The shop supports search, categories, sorting, finishes, quick view and a cart drawer. Rental calculates sample totals. Spa offers treatment duration and time selection. Restaurant has menu tabs and table requests. Hotel has room comparison and a booking bar; villa has a photo mosaic, configuration diagram and stay estimate.

`src/components/showcase-variants.tsx` and `showcase-variants.css` supply the 24 additional concepts. Their content lives in `src/lib/showcase-additions.ts`. The four new stores have six sample products each, product options, filtering, sorting, quick views and quantity-aware cart drawers. The four new rental home pages link to their own `/rentals` planner with a validated `item=0`, `1` or `2` query selection. All five rental concepts have both a home and planner route.

The directory uses actual local browser screenshots in `public/showcase/previews/`. Regenerate these after visual changes, waiting for fonts and hero images to load.

- `src/lib/showcase.ts`: the six concepts, prices, copy and SEO descriptions.
- `src/lib/showcase-copy.ts`: translated directory copy.
- `src/components/showcase-demo.tsx`: gallery, sample cart, menu and date enquiry interactions.
- `src/app/(showcase-demos)/showcase-demo.css`: demo styling, separate from the agency theme.
- `public/showcase/`: local illustrative photographs, delivered through Next Image.

The demo forms only update local page state. They do not create bookings, send enquiries, process payments or save personal data. The DevnPixel CTA opens the existing contact form with the chosen concept prefilled. Brands, prices and offers are fictional design examples, not client work or actual inventory.

Each concept has a unique title, description, canonical URL, social metadata and CreativeWork/Breadcrumb structured data. The sitemap includes all 30 concept routes and five rental planners; localized directory routes have hreflang alternates. Demos do not claim to be real local businesses.

## Photography

Illustrative images are sourced from Unsplash. The source photo identifiers are preserved in `scripts/fetch-showcase-images.mjs`; downloads are local assets, not runtime dependencies. Images do not depict the fictional brands or guarantee the location of a sample property/product.

- Ubud setting: [Klaudia Odrzywolska](https://unsplash.com/photos/4GS8Jamdbe8).
- Canggu scooters: [Jared Rice](https://unsplash.com/photos/PiNK0WxNQmY).
- [Unsplash license](https://unsplash.com/license).

Replace sample photography with the real client's approved assets before adapting any concept into a production business website.
