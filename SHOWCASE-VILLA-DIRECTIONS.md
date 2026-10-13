# Villa showcase directions

The five fictional villa demos have individual openings and photographic stories. Villa Bumi and the other showcase categories are outside this change.

| Concept | Direction                                                                 | Interaction                                                                   |
| ------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| SORA    | Widescreen coastal photography, oversized wordmark, blue chapter sequence | Sticky photographs follow three story moments                                 |
| BATU    | Architectural plate, ruled typography, neutral paper                      | Interactive house index with three selectable photographic plates             |
| Lumen   | Warm paper, serif lettering, rounded portrait                             | Staggered photographic journal                                                |
| AZUL    | Blue coastal journal, oversized lettering, inset landscape                | Horizontal postcards with native swipe, keyboard scrolling and arrow controls |
| ARCA    | Dark estate invitation, gold lettering, inset image borders               | Native image accordion, with crossfades between selected estate moments       |

## Reference ideas

- [Elementis](https://www.awwwards.com/sites/elementis): immersive opening, photographic chapters and restrained transitions. Original site inspected at https://elementis.co/.
- [Salterra Resort & Spa](https://www.awwwards.com/sites/salterra-resort-spa): the Awwwards entry describes scroll-led photography and a gallery experience.
- [Humbert & Poyet: Scroll Portfolio](https://www.awwwards.com/inspiration/scroll-portfolio): architectural typography, minimal composition and portfolio scrolling.

These are reference directions. No reference site's code, branding, photographs or videos were copied. Existing local illustrative photography is retained.

## Behavior

Motion uses the Web Animations API, IntersectionObserver and progressive CSS scroll timelines. Scrolling remains native; chapter links and existing stay enquiry links remain ordinary anchors. SORA uses a sticky photographic story on desktop and inline photographs on phones. Batu uses a selectable architectural index. Lumen uses a staggered journal layout. Azul uses a native horizontal postcard gallery. Arca uses grouped native details paired with a photographic frame.

Reduced-motion preferences disable motion, including when changed during the session. Content renders visibly without JavaScript. Existing room configuration controls, galleries, sample rates and local-only enquiry forms remain in place.

## Verification

`npm run test:villa:directions` checks all five concepts at 320, 390, 768, 1024 and 1440 pixels, chapter links, gallery dialogs, stay estimates, reduced motion, JavaScript-disabled reading, runtime errors and isolation from Villa Bumi and hospitality demos. `TEST_BASE_URL` selects the server.

Also run the production build, lint, `test:showcase:routes`, `test:seo:routes` and `test:villabumi`. The five preview JPGs in `public/showcase/previews/villa-directions/` are captured from the updated production build.
