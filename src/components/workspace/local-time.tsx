"use client";

// Server and browser differ in locale and time zone; the browser's rendering wins.
export default function LocalTime({
  iso,
  options,
}: {
  iso: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {date.toLocaleString(
        undefined,
        options ?? { dateStyle: "medium", timeStyle: "short" },
      )}
    </time>
  );
}
