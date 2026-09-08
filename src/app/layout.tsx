import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource/press-start-2p/latin-400.css";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { site } from "@/lib/site";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "DevnPixel — Digital craft. Pixel by pixel.",
    template: "%s — DevnPixel",
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "DevnPixel — Digital craft. Pixel by pixel.",
    description: site.description,
    images: ["/opengraph-image"],
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#f5f5f0" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('devnpixel.theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`,
          }}
        />
      </head>
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
