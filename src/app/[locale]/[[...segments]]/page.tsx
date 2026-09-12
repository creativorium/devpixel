import { JWCaseStudy } from "@/components/jw-case-study";
import { jwCopy, conceptIndex } from "@/lib/project-copy";
import { TranslatedHeading } from "@/components/translated-heading";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, localizedPath } from "@/lib/i18n";
import { publicPaths } from "@/lib/language-routes";
import { pageCopy } from "@/lib/translations/pages";
import { messages } from "@/lib/translations/ui";
import { articles } from "@/lib/translations/articles";
import { legal } from "@/lib/translations/legal";
import { services } from "@/lib/services";
import { projects, site } from "@/lib/site";
import { posts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { Sculpture } from "@/components/sculpture";
import { PixelRoomLoader } from "@/components/pixel-room-loader";
import { PixelMark } from "@/components/brand";
import { ProjectArt } from "@/components/project-card";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ServiceTicker } from "@/components/service-ticker";
type Params = { locale: string; segments?: string[] };
export const dynamicParams = false;
export function generateStaticParams() {
  return ["de", "zh", "ja", "id"].flatMap((locale) =>
    publicPaths.map((path) => ({
      locale,
      segments: path === "/" ? [] : path.slice(1).split("/"),
    })),
  );
}
function resolve(params: Params) {
  const { locale } = params;
  const path = "/" + (params.segments || []).join("/");
  if (!isLocale(locale) || locale === "en" || !publicPaths.includes(path))
    notFound();
  return { locale, path };
}
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, path } = resolve(await params);
  const c = pageCopy[locale],
    t = messages[locale];
  let title = c.homeTitle.join(" "),
    description = c.homeIntro;
  const root = path.split("/")[1];
  const slug = path.split("/")[2];
  if (root === "about") {
    title = t.studio;
    description = c.studioIntro;
  }
  if (root === "work") {
    title = c.workTitle;
    description = c.conceptNote;
    const i = projects.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      title = projects[i].name;
      description =
        projects[i].kind === "jw"
          ? jwCopy[locale].intro
          : c.projectDescriptions[conceptIndex(projects[i].kind)];
    }
  }
  if (root === "services") {
    title = c.servicesTitle;
    description = c.servicesIntro;
    const i = services.findIndex((s) => s.slug === slug);
    if (i >= 0) {
      title = t.serviceNames[i];
      description = c.serviceDescriptions[i];
    }
  }
  if (root === "contact") {
    title = c.contactTitle;
    description = c.contactIntro;
  }
  if (root === "blog") {
    title = c.blogTitle;
    description = c.blogIntro;
    const i = posts.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      title = articles[locale][i].title;
      description = articles[locale][i].sections[0][1];
    }
  }
  if (root === "privacy" || root === "terms") {
    title = t[root];
    description = legal[locale][root][0][1];
  }
  return pageMetadata(
    title,
    description.slice(0, 170),
    localizedPath(path, locale),
  );
}
export default async function NativePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, path } = resolve(await params),
    c = pageCopy[locale],
    t = messages[locale],
    href = (p: string) => localizedPath(p, locale);
  const serviceList = (
    <div className="service-list">
      {services.map((s, i) => (
        <Link href={href("/services/" + s.slug)} key={s.slug}>
          <span>
            <strong>{t.serviceNames[i]}</strong>
            <p>{c.serviceDescriptions[i]}</p>
          </span>
          <span>↗</span>
        </Link>
      ))}
    </div>
  );
  const projectGrid = (
    <div className="project-grid">
      {projects.slice(0, path === "/" ? 2 : projects.length).map((p) => (
        <Link
          className="project-card"
          href={href("/work/" + p.slug)}
          key={p.slug}
        >
          <ProjectArt kind={p.kind} />
          <div className="project-meta">
            <div>
              <h3>{p.name}</h3>
              <p>
                {p.kind === "jw"
                  ? jwCopy[locale].category
                  : t.categories[conceptIndex(p.kind)]}{" "}
                / {p.kind === "jw" ? jwCopy[locale].label : t.concept}
              </p>
            </div>
            <span>↗</span>
          </div>
        </Link>
      ))}
    </div>
  );
  const journal = (
    <div className={path === "/" ? "home-articles" : "journal-grid"}>
      {posts.slice(0, path === "/" ? 3 : posts.length).map((p, i) => (
        <Link
          className="journal-card"
          href={href("/blog/" + p.slug)}
          key={p.slug}
        >
          <span className="eyebrow">
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
              new Date(p.date + "T12:00:00Z"),
            )}
          </span>
          <h2>{articles[locale][i].title}</h2>
          <p>{articles[locale][i].sections[0][1].slice(0, 180)}…</p>
          <span className="text-link">{t.read} ↗</span>
        </Link>
      ))}
    </div>
  );
  const cta = (
    <Link className="button dark" href={href("/contact")}>
      {t.contact} ↗
    </Link>
  );
  if (path === "/")
    return (
      <main id="main">
        <section className="hero">
          <div className="hero-top">
            <span className="eyebrow">{c.eyebrow}</span>
            <span className="status">
              <i />
              {c.available}
            </span>
          </div>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1>
                {c.homeTitle[0]}
                <br />
                <TranslatedHeading text={c.homeTitle[1]} locale={locale} />
                <span className="headline-square" />
              </h1>
              <p>{c.homeIntro}</p>
              <div className="hero-actions">
                <Link href={href("/work")} className="button dark">
                  {t.viewWork} ↗
                </Link>
                <Link className="text-link" href={href("/contact")}>
                  {t.contact} ↗
                </Link>
              </div>
            </div>
            <Sculpture variant="diamond" interactive electrons />
          </div>
          <div className="hero-bottom">
            <span>{t.independent}</span>
            <a href="#selected">{t.work} ↓</a>
            <span>01 / 03</span>
          </div>
        </section>
        <ServiceTicker />
        <section className="section" id="selected">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{c.conceptNote}</p>
              <h2>{c.workTitle}</h2>
            </div>
            <Link className="text-link" href={href("/work")}>
              {t.allWork} ↗
            </Link>
          </div>
          {projectGrid}
        </section>
        <section className="studio-section section">
          <div className="studio-heading">
            <p className="eyebrow">02 / {t.motto}</p>
            <h2>{c.studioTitle}</h2>
            <PixelMark className="studio-mark" />
          </div>
          <div className="studio-details">
            <p>{c.studioIntro}</p>
            <Link className="text-link" href={href("/about")}>
              {t.meet} ↗
            </Link>
            {serviceList}
          </div>
        </section>
        <section className="market-section section">
          <div className="market-copy">
            <p className="eyebrow">{c.eyebrow}</p>
            <h2>{c.marketTitle}</h2>
            <p>{c.marketIntro}</p>
            <Link className="text-link" href={href("/services")}>
              {t.services} ↗
            </Link>
          </div>
          <Sculpture variant="frame" interactive />
        </section>
        <section className="section">
          <div className="section-heading">
            <h2>{c.blogTitle}</h2>
            <Link href={href("/blog")}>{t.journal} ↗</Link>
          </div>
          {journal}
        </section>
      </main>
    );
  if (path === "/contact")
    return (
      <main id="main" className="section inner-page">
        <p className="eyebrow">{t.contact}</p>
        <h1>
          <TranslatedHeading text={c.contactTitle} locale={locale} />
        </h1>
        <div className="contact-grid">
          <div>
            <h2>{t.talk}</h2>
            <p>{c.contactIntro}</p>
            <a className="contact-email" href={"mailto:" + site.email}>
              {site.email}
            </a>
            <WhatsAppButton />
          </div>
          <ContactForm
            enabled={Boolean(
              process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL,
            )}
          />
        </div>
      </main>
    );
  if (path === "/privacy" || path === "/terms") {
    const key = path === "/privacy" ? "privacy" : "terms";
    return (
      <main id="main" className="section inner-page legal-page">
        <p className="eyebrow">2026-09-11</p>
        <h1>
          <TranslatedHeading text={t[key]} locale={locale} />
        </h1>
        {legal[locale][key].map(([title, text], i) => (
          <section
            key={title}
            id={key === "privacy" && i === 3 ? "cookies" : undefined}
          >
            <h2>
              {String(i + 1).padStart(2, "0")} / {title}
            </h2>
            <p>{text}</p>
          </section>
        ))}
        <p>
          <a href={"mailto:" + site.email}>{site.email}</a>
        </p>
        <Link href={href(key === "privacy" ? "/terms" : "/privacy")}>
          {key === "privacy" ? t.terms : t.privacy} ↗
        </Link>
      </main>
    );
  }
  if (path.startsWith("/blog/")) {
    const i = posts.findIndex((p) => path === "/blog/" + p.slug),
      post = posts[i],
      a = articles[locale][i];
    return (
      <main id="main" className="section inner-page journal-article">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: a.title,
              description: a.sections[0][1],
              datePublished: post.date,
              dateModified: "2026-09-11",
              inLanguage: locale === "zh" ? "zh-Hans" : locale,
              mainEntityOfPage: site.url + href(path),
              author: {
                "@type": "Organization",
                name: site.name,
                url: site.url,
              },
              publisher: { "@id": site.url + "/#organization" },
              image: site.url + "/opengraph-image",
            }).replace(/</g, "\\u003c"),
          }}
        />
        <nav className="article-breadcrumb">
          <Link href={href("/blog")}>{t.journal}</Link>
        </nav>
        <h1>{a.title}</h1>
        <p className="article-byline">
          {t.author} ·{" "}
          {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
            new Date(post.date + "T12:00:00Z"),
          )}
        </p>
        <nav className="article-contents" aria-label={t.contents}>
          <strong>{t.contents}</strong>
          <ol>
            {a.sections.map(([title], n) => (
              <li key={title}>
                <a href={"#section-" + n}>{title}</a>
              </li>
            ))}
          </ol>
        </nav>
        {a.sections.map(([title, text], n) => (
          <section key={title} id={"section-" + n}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        {post.sources && (
          <section className="article-sources">
            <h2>{t.sources}</h2>
            <ul>
              {post.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url}>{s.title}</a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="article-cta">
          <h2>{t.contact}</h2>
          <p>{c.contactIntro}</p>
          {cta}
        </section>
        <Link href={href("/services/" + post.service)}>{t.learn} ↗</Link>
      </main>
    );
  }
  if (path === "/blog")
    return (
      <main id="main" className="section inner-page">
        <p className="eyebrow">{t.journal}</p>
        <h1>
          <TranslatedHeading text={c.blogTitle} locale={locale} />
        </h1>
        <p className="page-intro">{c.blogIntro}</p>
        {journal}
      </main>
    );
  if (path.startsWith("/work/")) {
    const i = projects.findIndex((p) => path === "/work/" + p.slug),
      p = projects[i];
    if (p.kind === "jw") return <JWCaseStudy locale={locale} />;
    return (
      <main id="main" className="section inner-page">
        <p className="eyebrow">{c.conceptNote}</p>
        <h1>{p.name}</h1>
        <p className="page-intro">
          {c.projectDescriptions[conceptIndex(p.kind)]}
        </p>
        <ProjectArt kind={p.kind} />
        <section className="section">
          <h2>{t.categories[conceptIndex(p.kind)]}</h2>
          <p>{c.scope}</p>
          {cta}
        </section>
      </main>
    );
  }
  if (path === "/work")
    return (
      <main id="main" className="section inner-page">
        <div className="native-banner">
          <div>
            <p className="eyebrow">{t.work}</p>
            <h1>
              <TranslatedHeading text={c.workTitle} locale={locale} />
            </h1>
            <p>{c.conceptNote}</p>
          </div>
          <Sculpture variant="dna" interactive />
        </div>
        {projectGrid}
      </main>
    );
  if (path.startsWith("/services/")) {
    const i = services.findIndex((s) => path === "/services/" + s.slug),
      s = services[i];
    return (
      <main id="main" className="section inner-page">
        <div className="native-banner">
          <div>
            <p className="eyebrow">{t.services}</p>
            <h1>{t.serviceNames[i]}</h1>
            <p>{c.serviceDescriptions[i]}</p>
            {cta}
          </div>
          <Sculpture variant={s.shape} interactive />
        </div>
        <section className="section native-prose">
          {c.serviceDetails[i].map((p) => (
            <p key={p}>{p}</p>
          ))}
          <h2>{c.processTitle}</h2>
          <ol>
            {c.process.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <h2>{c.scopeTitle}</h2>
          <p>{c.scope}</p>
          <Link
            className="button dark"
            href={href("/contact") + "?service=" + s.slug}
          >
            {t.contact} ↗
          </Link>
        </section>
      </main>
    );
  }
  if (path === "/services")
    return (
      <main id="main" className="section inner-page">
        <div className="native-banner">
          <div>
            <p className="eyebrow">{t.services}</p>
            <h1>{c.servicesTitle}</h1>
            <p>{c.servicesIntro}</p>
          </div>
          <Sculpture variant="diamond" interactive />
        </div>
        {serviceList}
        <section className="section native-prose">
          <h2>{c.scopeTitle}</h2>
          <p>{c.scope}</p>
          {cta}
        </section>
      </main>
    );
  return (
    <main id="main" className="section inner-page">
      <div className="native-banner">
        <div>
          <p className="eyebrow">{t.studio}</p>
          <h1>
            <TranslatedHeading text={c.studioTitle} locale={locale} />
          </h1>
          <p>{c.studioIntro}</p>
        </div>
        <PixelRoomLoader hero />
      </div>
      <section className="section native-prose">
        {c.aboutParagraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h2>{c.processTitle}</h2>
        <ol>
          {c.process.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </section>
      <div className="native-gallery">
        {(["frame", "steps", "cross"] as const).map((variant) => (
          <Sculpture key={variant} variant={variant} interactive />
        ))}
      </div>
      {serviceList}
    </main>
  );
}
