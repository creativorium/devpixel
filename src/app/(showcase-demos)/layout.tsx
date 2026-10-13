import type { Metadata } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./showcase-demo.css";
import "./showcase-experiences.css";
import "./showcase-variants.css";
import "./villa-directions.css";
const sans = localFont({
  src: "../../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--demo-sans",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  icons: { icon: "/favicon.png" },
};
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
