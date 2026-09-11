"use client";
import { usePathname } from "next/navigation";
import { localeFromPath, localizedPath } from "@/lib/i18n";
import { messages } from "@/lib/translations/ui";
export function useLanguage() {
 const locale = localeFromPath(usePathname());
 return { locale, t: messages[locale], href: (path: string) => localizedPath(path, locale) };
}
