# DevnPixel search setup

Preferred hostname: **https://www.devnpixel.com**. On 10 September 2026, the live non-www domain returned a 308 redirect to www. Metadata, structured data and sitemap now use the destination hostname. Keep that Vercel redirect in place.

## Keyword and content map

| Page                      | Main intent                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| Home / services           | Independent web design and development studio for small businesses |
| Development service       | Web development for small businesses                               |
| Web design service        | Focused web design services                                        |
| Bali article              | Web development in Bali; planning a business website               |
| Affordable design article | Affordable web design; scope and total cost                        |
| Freelancer article        | Freelancer vs small web design agency                              |
| Remote projects article   | Remote web design for Australia, the US and Singapore              |
| AI article                | AI coding agents and website development in 2026                   |

Location wording describes service audiences, not local offices. No local address, fabricated reviews, client results, or pricing was added. No meta-keywords tag or duplicate location doorway pages are needed.

## After deployment

1. Verify the devnpixel.com Domain property in Google Search Console using the DNS value supplied by Google. Analytics installation alone does not establish Search Console ownership.
2. Submit `https://www.devnpixel.com/sitemap.xml`.
3. Inspect the homepage and `/blog`, then request indexing of the homepage and new articles. Confirm Google's selected canonical is the www URL once processing finishes.
4. Test an article in Google's Rich Results Test. It contains BlogPosting and BreadcrumbList markup. Homepage organization data identifies the studio and its `/logo.png` image.
5. Check `/favicon.png` loads publicly. The 96px square image is declared in homepage metadata. Google controls whether and when it appears; recrawling can take days or weeks.
6. Measure impressions, relevant queries, click-through rate, and actual enquiries before changing titles again. A technical implementation does not guarantee ranking or indexing.

## Project credits and portfolio

The owner identified jwtradingacademy.com, wonderlandbali.com, cularcreative.com, fzfilmco.com and homivillas.com as projects, with portfolio work still in progress. They have not been published as case studies, added as organization identities, or modified by this change.

Where agreed with a project owner, a small accurate credit such as “Website by DevnPixel” can link to `https://www.devnpixel.com/`. Use a normal descriptive link, avoid repeated keyword-heavy credits, and do not trade links solely to influence rankings. Paid or sponsored placements should be qualified appropriately. A future case study should identify the work actually done, permission to share it, launch status, and any substantiated results.

## Editorial maintenance

The five initial posts are in `src/lib/posts.ts`. Each has a distinct topic, publication date, service link, and related reading. AI news cites a dated primary source and separates reported findings from practical recommendations. Review time-sensitive facts before updating; change the modified date only when the article changes. Do not bulk-publish near-duplicate posts to cover every city.

## References

- [Google favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Google organization markup](https://developers.google.com/search/blog/2023/11/introducing-organization-markup)
- [Google Core Web Vitals guidance](https://developers.google.com/search/docs/appearance/core-web-vitals)

The Search Console, Google-selected favicon, and live indexing outcomes require verification after deployment; local checks validate rendered metadata and routes only.
