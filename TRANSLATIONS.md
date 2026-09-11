# Native website languages

English stays at `/`. German, Simplified Chinese, Japanese, and Indonesian live at `/de`, `/zh`, `/ja`, and `/id`. The same public paths exist in each language, such as `/de/services/web-design` and `/ja/contact`.

Use the globe selector immediately right of the contact button. It preserves the current page, query parameters, and anchor. Each language has static HTML, its own canonical URL, `html lang`, alternate-language links, and sitemap entries. No translation service, API key, external translation script, or new cookie is needed. Switching languages performs a page navigation; links within a language retain Next.js navigation and the pixel transition.

## Where to edit

| Content                                        | File                                        |
| ---------------------------------------------- | ------------------------------------------- |
| Navigation, buttons, forms, cookie controls    | `src/lib/translations/ui.ts`                |
| Homepage, studio, services, work, contact copy | `src/lib/translations/pages.ts`             |
| Five journal articles in each new language     | `src/lib/translations/articles.ts`          |
| Privacy and terms                              | `src/lib/translations/legal.ts`             |
| Sculpture and desk captions                    | `src/lib/translations/visuals.ts`           |
| English page content                           | `src/app/(english)/`                        |
| English articles and service details           | `src/lib/posts.ts`, `src/lib/services.ts`   |
| Rendering of translated public pages           | `src/app/[locale]/[[...segments]]/page.tsx` |

The first-pass translations are editable TypeScript strings. Save as UTF-8. Journal articles and legal notices use condensed native editions; they are not certified or word-for-word translations. Review their wording alongside the English originals before making legal or service commitments. Brand names, source titles, URLs, and text embedded in concept artwork stay in their original language.

Arrays follow the existing English order: services are brand strategy, web design, development, advertising; projects and articles follow `site.ts` and `posts.ts`. Keep the number and order aligned when adding entries. New routes also belong in `src/lib/language-routes.ts`. Translate new content into all four dictionaries before publishing it.

The hidden invoice and 3D playground remain English at `/invoice` and `/threedanimation`. They stay out of navigation and the sitemap. Their language selector leads to the chosen public homepage. Form option values remain stable English identifiers for the server validator; only visitor-facing labels are translated. Submitted messages are sent as entered, without translation.

No Vercel environment-variable changes are required. The existing Resend configuration remains in use. After editing, run `npm run build`, `npm run lint`, and `npm test`. With a production server running, set `TEST_BASE_URL` and run `node tests/languages.mjs` for route, SEO, responsive-menu, query-preservation, and consent checks.

Routing follows the [Next.js internationalization guidance](https://nextjs.org/docs/app/guides/internationalization).
