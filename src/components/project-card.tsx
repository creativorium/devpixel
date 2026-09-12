import Link from "next/link";
import Image from "next/image";
import { projects } from "@/lib/site";
export function ProjectArt({ kind }: { kind: string }) {
  if (kind === "jw" || kind === "wonderland")
    return (
      <div className="project-art art-client">
        <Image
          src={
            kind === "jw"
              ? "/work/jw-trading-academy.jpg"
              : "/work/wonderland-bali.jpg"
          }
          alt={`${kind === "jw" ? "JW Trading Academy" : "Wonderland Bali"} website homepage`}
          width={1440}
          height={1000}
          sizes="(max-width: 760px) 100vw, 50vw"
        />
      </div>
    );
  return (
    <div className={`project-art art-${kind}`} aria-hidden="true">
      {kind === "form" ? (
        <>
          <span className="art-corner">
            F—F®
            <br />
            OBJECTS OF INTENTION
          </span>
          <div className="form-object">
            <i />
            <i />
            <i />
          </div>
          <span className="art-word">Form & Field</span>
        </>
      ) : kind === "grid" ? (
        <>
          <span className="art-corner">GO WHERE YOU FEEL.</span>
          <div className="terrain">
            {Array.from({ length: 14 }, (_, i) => (
              <i key={i} style={{ height: `${25 + ((i * 37) % 70)}%` }} />
            ))}
          </div>
          <span className="offgrid-word">
            OFF
            <br />
            GRID↗
          </span>
          <span className="art-bottom">AN EXPLORATION IN THE EVERYDAY.</span>
        </>
      ) : (
        <>
          <span className="art-corner">MONO® / YOUR SPACE TO THINK</span>
          <div className="mono-window">
            <div>
              ● ● ● <span>workspace / overview</span>
            </div>
            <strong>
              Good work.
              <br />
              Clear mind.
            </strong>
            <section>
              <i />
              <i />
              <i />
            </section>
            <p>01 — Make room for what matters.</p>
          </div>
        </>
      )}
    </div>
  );
}
export function ProjectCard({
  project,
}: {
  project: (typeof projects)[number];
}) {
  return (
    <Link className="project-card" href={`/work/${project.slug}`}>
      <ProjectArt kind={project.kind} />
      <div className="project-meta">
        <div>
          <h3>{project.name}</h3>
          <p>
            {project.category} <span> / {project.year}</span>
          </p>
        </div>
        <span className="project-arrow">↗</span>
      </div>
    </Link>
  );
}
