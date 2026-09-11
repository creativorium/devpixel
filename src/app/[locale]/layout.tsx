import { notFound } from "next/navigation";
import SiteLayout, {
  metadata as siteMetadata,
  viewport as siteViewport,
} from "@/components/site-layout";
import { isLocale } from "@/lib/i18n";
export const metadata = siteMetadata;
export const viewport = siteViewport;
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return (
    <SiteLayout locale={locale === "zh" ? "zh-Hans" : locale}>
      {children}
    </SiteLayout>
  );
}
