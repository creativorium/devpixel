# Two editorial showcase directions

NATIV (`/showcase/nativ-bali-objects`) is a warm furniture-store direction inspired by the composition, cream palette and serif hierarchy of the user’s furniture reference: https://id.pinterest.com/pin/870813277969418064/.

SORA (`/showcase/sora-uluwatu-villa`) uses oversized typography, a cinematic architectural hero, glass feature cards and a modular editorial layout, inspired by https://id.pinterest.com/pin/877498308666230718/. The construction-site reference is adapted to a fictional villa stay.

Only these two concepts use `editorial-showcase.tsx` and the scoped `editorial-showcase.css`. The other showcase designs remain available. GSAP and ScrollTrigger animate individual heading letters and restrained section entrances, with matchMedia cleanup and a still version for reduced motion. No scroll hijacking, continuous loops or forced loading screens.

Furniture filters, product details, a sample bag, removal and a preview checkout work locally. The villa enquiry form validates dates and displays a preview status. Neither concept submits orders, takes payments, reserves dates or sends enquiries.

## Original SORA image

`public/showcase/sora-hero.webp` is an original image generated with the built-in imagegen tool on 16 October 2026 and encoded as WebP for the site. It depicts an imaginary building, not a photographed property. Other photos are reused from the existing showcase asset library. Pinterest reference images are used for visual inspection only and are not distributed as website assets.

Final generation prompt:

> Create a photorealistic editorial architectural photograph to serve as a wide website hero for an explicitly fictional luxury villa design concept named SORA in Uluwatu, Bali. Image only: no text, no logos, no typography, no UI. Landscape 16:9 composition. Two-story low-slung contemporary charcoal timber and dark stone villa, expansive floor-to-ceiling glass glowing warmly from interior lighting, a tranquil infinity pool in foreground, tropical trees, coastal hillside at blue hour with misty horizon. Architectural magazine photograph, restrained realistic color, charcoal olive shadows, amber interior, soft gray teal sky, tactile materials, no people. Framing: entire villa occupies center and right lower two thirds; upper third is muted dusky sky and silhouettes, enough calmer space for very large white wordmark to be overlaid in code; lower left remains dark enough for white heading. Building must feel plausible, refined and sophisticated, not a fantasy mansion. High quality crisp geometry, natural perspective, no copyrighted reference image copied.

## Specialist content and AERA

The two original heroes are retained. NATIV now follows room-based collection browsing with an interactive natural oak / smoked walnut / oat linen material study, product care and delivery planning. SORA follows its hero with a selectable concept space plan, two-/three-bedroom stay configuration carried into the enquiry preview, a guest information ledger and FAQs. These replace the shared marketing-style photo grids and lifestyle stories.

AERA (`/showcase/aera-ubud-sanctuary`) is an additional villa concept inspired by the immersive editorial direction of https://elementis.co: muted forest-green surfaces, large light sans-serif typography, full-width photography and a horizontal phrase tied to scroll. Its Stay / Pause / Wander chapter navigator is operable by keyboard. It uses existing local illustrative photography and original copy, not Elementis branding or media. No loader, automatic video playback or continuously moving marquee is required. Reduced motion keeps the content still and legible.

The showcase index now contains 31 concepts, with a dedicated AERA preview image. All enquiries remain previews and send no data externally.

## Villa Bumi placement (unchanged)

The pending DevnPixel changes register Villa Bumi as client work at `/work/villabumi`. Its preview is `/work/villabumi/preview`; `/showcase/villabumi` redirects there. The independent Villa Bumi production app lives in `nego94/villabumi`. Publishing these portfolio changes is a separate deployment from the villa site.
