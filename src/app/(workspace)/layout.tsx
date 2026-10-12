import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
import "./workspace.css";
import { site } from "@/lib/site";

const sans = localFont({
  src: "../../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Teams", template: "%s · DevnPixel Teams" },
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};
export const viewport: Viewport = { themeColor: "#ffffff" };

// Private team workspace: isolated from site navigation, Analytics and third-party scripts.
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={sans.variable}>
      <body className="ws-body">{children}</body>
    </html>
  );
}
