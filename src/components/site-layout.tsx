/* eslint-disable @next/next/no-head-element -- Shared App Router root layout owns the document head. */
import { messages } from "@/lib/translations/ui";
import { isLocale } from "@/lib/i18n";
import type { Metadata, Viewport } from "next";
import { CookieConsent } from "@/components/cookie-consent";
import localFont from "next/font/local";
import "@/app/globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { site } from "@/lib/site";
import { StructuredData } from "@/components/structured-data";
const sans = localFont({
  src: "../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-sans",
  weight: "300 700",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
const pixel = localFont({
  src: "../../node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2",
  variable: "--font-pixel",
  weight: "400",
  display: "swap",
  fallback: ["monospace"],
  adjustFontFallback: false,
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Independent Web Design & Development Studio | DevnPixel",
    template: "%s — DevnPixel",
  },
  description: site.description,
  icons: {
    icon: [{ url: "/favicon.png", sizes: "96x96", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Independent Web Design & Development Studio | DevnPixel",
    description: site.description,
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#ffffff" };
export default function SiteLayout({
  children,
  locale = "en",
}: Readonly<{ children: React.ReactNode; locale?: string }>) {
  return (
    <html
      lang={locale}
      className={`${sans.variable} ${pixel.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('devnpixel.theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:'light'}catch(e){document.documentElement.dataset.theme='light'}})()`,
          }}
        />
      </head>
      <body id="top">
        <a className="skip-link" href="#main">
          {
            messages[
              locale === "zh-Hans" ? "zh" : isLocale(locale) ? locale : "en"
            ].skip
          }
        </a>
        <Navigation />
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${site.url}/#organization`,
                name: site.name,
                url: site.url,
                logo: {
                  "@type": "ImageObject",
                  url: `${site.url}/logo.png`,
                  width: 512,
                  height: 512,
                },
                description: site.description,
                email: site.email,
                telephone: "+6287760185018",
                areaServed: [
                  "Bali, Indonesia",
                  "Australia",
                  "United States",
                  "Singapore",
                ],
              },
              {
                "@type": "WebSite",
                "@id": `${site.url}/#website`,
                url: site.url,
                name: site.name,
                publisher: { "@id": `${site.url}/#organization` },
                inLanguage: locale,
              },
            ],
          }}
        />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
