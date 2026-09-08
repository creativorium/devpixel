import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { Sculpture } from "@/components/sculpture";
export const metadata: Metadata = {
  title: "Services",
  description:
    "Brand strategy, web design, development, and advertising creative from DevnPixel.",
  alternates: { canonical: "/services" },
};
export default function Services() {
  return (
    <main id="main" className="section inner-page">
      <div className="service-hero services-overview-hero">
        <div>
          <p className="eyebrow">WHAT WE CAN MAKE TOGETHER</p>
          <h1>
            From first thought
            <br />
            to final pixel.
          </h1>
          <p className="services-intro">
            A clear identity. A thoughtful website. An experience worth
            exploring. Bring us in for one part, or let’s connect the whole
            picture.
          </p>
        </div>
        <Sculpture variant="diamond" interactive companions />
      </div>
      <div className="service-index">
        {services.map((s) => (
          <Link
            href={`/services/${s.slug}`}
            className="service-index-item"
            key={s.slug}
          >
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
