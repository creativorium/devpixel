import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";
export const dynamicParams = false;
export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const metadata = pageMetadata(post.title, post.description, `/blog/${slug}`);
  return {
    ...metadata,
    authors: [{ name: "DevnPixel Studio", url: `${site.url}/about` }],
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: `${post.date}T08:00:00+08:00`,
      modifiedTime: `${post.date}T08:00:00+08:00`,
      authors: [`${site.url}/about`],
    },
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const url = `${site.url}/blog/${slug}`;
  return (
    <main id="main" className="section inner-page journal-article">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              headline: post.title,
              description: post.description,
              image: `${site.url}/opengraph-image`,
              datePublished: `${post.date}T08:00:00+08:00`,
              dateModified: `${post.date}T08:00:00+08:00`,
              author: {
                "@type": "Organization",
                name: "DevnPixel Studio",
                url: `${site.url}/about`,
              },
              publisher: { "@id": `${site.url}/#organization` },
              mainEntityOfPage: url,
              inLanguage: "en",
              articleSection: post.category,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: site.url,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Journal",
                  item: `${site.url}/blog`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: post.title,
                  item: url,
                },
              ],
            },
          ],
        }}
      />
      <nav aria-label="Breadcrumb" className="article-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/blog">Journal</Link>
      </nav>
      <p className="eyebrow">{post.category}</p>
      <h1>{post.title}</h1>
      <p className="article-byline">
        By <Link href="/about">DevnPixel Studio</Link> ·{" "}
        <time dateTime={post.date}>10 September 2026</time>
      </p>
      <p className="article-summary">{post.description}</p>
      <nav className="article-contents" aria-label="Article contents">
        <strong>In this article</strong>
        {post.sections.map((s, i) => (
          <a key={s.title} href={`#section-${i + 1}`}>
            {s.title}
          </a>
        ))}
      </nav>
      <article>
        {post.sections.map((s, i) => (
          <section id={`section-${i + 1}`} key={s.title}>
            <h2>{s.title}</h2>
            {s.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {post.sources && i === 0 && (
              <p className="article-source">
                Source:{" "}
                <a href={post.sources[0].url}>{post.sources[0].title}</a>
              </p>
            )}
          </section>
        ))}
      </article>
      {post.sources && (
        <section className="article-sources">
          <h2>Sources and further reading</h2>
          <ul>
            {post.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url}>{s.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <aside className="article-cta">
        <h2>Put the idea into practice.</h2>
        <p>
          Tell us about your audience, priorities, and the website you want to
          build.
        </p>
        <Link className="text-link" href={`/services/${post.service}`}>
          Explore our{" "}
          {post.service === "development" ? "web development" : "web design"}{" "}
          service ↗
        </Link>
        <Link className="button dark" href="/contact">
          Discuss your project ↗
        </Link>
      </aside>
      <section>
        <h2>Keep reading</h2>
        <div className="related-articles">
          {posts
            .filter((p) => p.slug !== slug)
            .slice(0, 2)
            .map((p) => (
              <Link href={`/blog/${p.slug}`} key={p.slug}>
                {p.title} ↗
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
