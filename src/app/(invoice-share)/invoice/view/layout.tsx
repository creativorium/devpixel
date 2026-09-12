import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
const sans = localFont({
  src: "../../../../../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Shared invoice",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};
// Deliberately isolated from site navigation, Analytics and third-party scripts.
export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
