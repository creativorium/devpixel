import Link from "next/link";
import { ProjectArt } from "./project-card";
import { clientCopyFor, type ClientKind } from "@/lib/project-copy";
import { localizedPath, type Locale } from "@/lib/i18n";
import { messages } from "@/lib/translations/ui";
export function ClientCaseStudy({
  kind,
  locale = "en",
}: {
  kind: ClientKind;
  locale?: Locale;
}) {
  const c = clientCopyFor(kind, locale),
    t = messages[locale];
  return (
    <main id="main" className="section inner-page project-detail">
      <Link className="text-link" href={localizedPath("/work", locale)}>
        ← {t.allWork}
      </Link>
      <p className="eyebrow">{c.label}</p>
      <h1>{kind === "jw" ? "JW Trading Academy" : "Wonderland Bali"}</h1>
      <div className="intro-row">
        <p>{c.intro}</p>
        <a
          className="text-link"
          href={
            kind === "jw"
              ? "https://jwtradingacademy.com/"
              : "https://wonderlandbali.com/"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {c.visit} ↗
        </a>
      </div>
      <ProjectArt kind={kind} />
      <div className="project-story">
        <h2>{c.scope}</h2>
        <div>
          {c.sections.map(([title, text]) => (
            <section key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </section>
          ))}
          <Link
            className="button dark"
            href={localizedPath("/contact", locale)}
          >
            {t.contact} ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
