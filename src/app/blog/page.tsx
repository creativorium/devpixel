import Link from "next/link";
import { posts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Web Design, Development & AI Journal",
  "Practical notes on affordable web design, freelance collaboration, Bali business websites, remote projects, and AI-assisted development.",
  "/blog",
);
export default function Blog() {
  return (
    <main id="main" className="section inner-page">
      <p className="eyebrow">THE JOURNAL / IDEAS INTO PRACTICE</p>
      <h1>
        Small notes.
        <br />
        <span className="pixel-text">Useful ideas.</span>
      </h1>
      <p className="journal-intro">
        Web design, development, and working independently. Clear advice for
        small businesses building their next website.
      </p>
      <div className="journal-grid">
        {posts.map((post, index) => (
          <article className="journal-card" key={post.slug}>
            <div className="journal-art" aria-hidden="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i />
            </div>
            <p className="eyebrow">
              {post.category} /{" "}
              <time dateTime={post.date}>10 September 2026</time>
            </p>
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.description}</p>
            <Link className="text-link" href={`/blog/${post.slug}`}>
              Read article ↗
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
