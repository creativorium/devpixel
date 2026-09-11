import SiteLayout, {
  metadata as siteMetadata,
  viewport as siteViewport,
} from "@/components/site-layout";
export const metadata = siteMetadata;
export const viewport = siteViewport;
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
