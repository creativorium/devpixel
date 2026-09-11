export const locales = ["en", "de", "zh", "ja", "id"] as const;
export type Locale = (typeof locales)[number];
export const languageNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  zh: "简体中文",
  ja: "日本語",
  id: "Bahasa Indonesia",
};
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
export function localeFromPath(path: string): Locale {
  const first = path.split("/")[1];
  return isLocale(first) ? first : "en";
}
export function originalPath(path: string) {
  return path.replace(/^\/(de|zh|ja|id)(?=\/|$)/, "") || "/";
}
export function localizedPath(path: string, locale: Locale) {
  const original = originalPath(path);
  // Private/local tools retain their existing English URLs.
  if (/^\/(invoice|threedanimation)(\/|$)/.test(original)) return original;
  return locale === "en"
    ? original
    : `/${locale}${original === "/" ? "" : original}`;
}
