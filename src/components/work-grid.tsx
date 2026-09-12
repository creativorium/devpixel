"use client";
import { useState } from "react";
import { projects as allProjects } from "@/lib/site";
import { ProjectCard } from "./project-card";
export function WorkGrid({ projects }: { projects: typeof allProjects }) {
  const [filter, setFilter] = useState("All work");
  return (
    <>
      <div className="filters" aria-label="Filter projects">
        {["All work", ...new Set(projects.map((p) => p.category))].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={filter === f ? "active" : ""}
          >
            {f}
            <span>
              {String(
                projects.filter((p) => f === "All work" || p.category === f)
                  .length,
              ).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
      <div className="project-grid">
        {projects
          .filter((p) => filter === "All work" || p.category === filter)
          .map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
      </div>
    </>
  );
}
