import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/lib/services";
import { Sculpture } from "@/components/sculpture";
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  return {
    title: s?.name ?? "Service not found",
    description: s?.description,
    alternates: { canonical: `/services/${slug}` },
  };
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();
  return (
    <main id="main" className="section inner-page service-page">
      <Link href="/services" className="text-link">
        ← All services
      </Link>
      <div className="service-hero">
        <div>
          <p className="eyebrow">{service.name}</p>
          <h1>{service.headline}</h1>
          <p>{service.intro}</p>
          <Link
            href={`/contact?service=${service.slug}`}
            className="button dark"
          >
            Let’s talk {service.name.toLowerCase()} <span>↗</span>
          </Link>
        </div>
        <Sculpture variant={service.shape} interactive companions />
      </div>
      <section className="service-deliverables">
        <h2>
          What we can
          <br />
          help you with.
        </h2>
        <div>
          {service.deliverables.map(([name, detail]) => (
            <article key={name}>
              <h3>{name}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="service-process">
        <h2>How we get there.</h2>
        <div className="values">
          {service.steps.map(([name, detail], i) => (
            <article key={name}>
              <span className="eyebrow">STEP 0{i + 1}</span>
              <h3>{name}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="service-faq">
        <h2>A little clarity.</h2>
        <div>
          {service.faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <nav className="related-services" aria-label="Other services">
        <p className="eyebrow">EXPLORE THE REST</p>
        {services
          .filter((s) => s.slug !== slug)
          .map((s) => (
            <Link href={`/services/${s.slug}`} key={s.slug}>
              {s.name} <span>↗</span>
            </Link>
          ))}
      </nav>
    </main>
  );
}
