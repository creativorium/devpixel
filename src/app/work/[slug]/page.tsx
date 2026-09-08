import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "@/lib/site";
import { ProjectArt } from "@/components/project-card";
import type { Metadata } from "next";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return {
    title: p?.name ?? "Project not found",
    description: p?.description,
    alternates: { canonical: `/work/${slug}` },
  };
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <main id="main" className="section inner-page project-detail">
      <Link className="text-link" href="/work">
        ← All explorations
      </Link>
      <p className="eyebrow">{p.year} / SELF-INITIATED EXPLORATION</p>
      <h1>{p.name}</h1>
      <div className="intro-row">
        <p>{p.description}</p>
        <span className="tiny-label">{p.services}</span>
      </div>
      <ProjectArt kind={p.kind} />
      <div className="project-story">
        <h2>
          A direction.
          <br />A new possibility.
        </h2>
        <div>
          <p>
            This is a studio concept, created to explore a visual direction. It
            is not a commissioned client project.
          </p>
          <p>
            Like what you see? Let’s build a distinctive experience for your
            brand.
          </p>
          <Link href="/contact" className="button dark">
            Start a conversation ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
