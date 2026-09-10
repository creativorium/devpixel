import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
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
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
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
          Skip to content
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
                inLanguage: "en",
              },
            ],
          }}
        />
        {children}
        <Footer />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RELL4WL624"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-RELL4WL624');`}
        </Script>
      </body>
    </html>
  );
}
