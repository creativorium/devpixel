import type { Locale } from "@/lib/i18n";

// Explicit, editable emphasis preserves each translation's natural word order.
const accents: Partial<Record<Locale, string[]>> = {
  de: [
    "Pixel",
    "sichtbar.",
    "große Idee.",
    "Nützliche Ideen.",
    "miteinander.",
    "Datenschutz",
    "Nutzungsbedingungen",
  ],
  id: [
    "Piksel",
    "nyata.",
    "Ide besar",
    "Ide bermanfaat.",
    "semuanya.",
    "privasi",
    "penggunaan",
  ],
};

export function TranslatedHeading({
  text,
  locale,
}: {
  text: string;
  locale: Locale;
}) {
  const accent = accents[locale]?.find((word) => text.includes(word));
  if (!accent) return <>{text}</>;
  const start = text.indexOf(accent);
  return (
    <>
      {text.slice(0, start)}
      <span className="pixel-text">{accent}</span>
      {text.slice(start + accent.length)}
    </>
  );
}

