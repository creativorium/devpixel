"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
const lattice = Array.from({ length: 5 }, (_, x) =>
  Array.from({ length: 5 }, (_, y) =>
    Array.from({ length: 5 }, (_, z) => ({ x, y, z })),
  ),
).flat(2);
const shapes = {
  dna: Array.from({ length: 25 }, (_, row) => {
    const angle = (row * Math.PI) / 8;
    const radius = 2.8;
    const points = [-1, 1].map((side) => ({
      x: 2 + Math.cos(angle) * radius * side,
      y: 2 + (row - 12) * 0.65,
      z: 2 + Math.sin(angle) * radius * side,
    }));
    if (row % 4 === 0) {
      for (const step of [-0.6, -0.2, 0.2, 0.6])
        points.push({
          x: 2 + Math.cos(angle) * radius * step,
          y: 2 + (row - 12) * 0.65,
          z: 2 + Math.sin(angle) * radius * step,
        });
    }
    return points;
  }).flat(),
  core: lattice.filter(
    ({ x, y, z }) =>
      [x, y, z].filter((v) => v >= 1 && v <= 3).length >= 2 &&
      (x === 0 || x === 4 || y === 0 || y === 4 || z === 0 || z === 4),
  ),
  frame: lattice.filter(
    ({ x, y, z }) => z === 2 && (x === 0 || x === 4 || y === 0 || y === 4),
  ),
  steps: lattice.filter(
    ({ x, y, z }) =>
      z >= 1 && z <= 3 && y >= 4 - x && (y === 4 - x || z === 1 || z === 3),
  ),
  cross: lattice.filter(
    ({ x, y, z }) => [x, y, z].filter((v) => v === 2).length >= 2,
  ),
  diamond: lattice.filter(
    ({ x, y, z }) => Math.abs(x - 2) + Math.abs(y - 2) + Math.abs(z - 2) === 3,
  ),
};
const labels = {
  dna: "THE CREATIVE DNA",
  core: "THE BUILDING BLOCK",
  frame: "THE OPEN FRAME",
  steps: "THE NEXT STEP",
  cross: "THE CONNECTION",
  diamond: "THE PIXEL PRISM",
};
export function Sculpture({
  variant = "core",
  interactive = false,
  companions = false,
}: {
  variant?: keyof typeof shapes;
  interactive?: boolean;
  companions?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className={`sculpture-stage shape-${variant} ${expanded ? "is-expanded" : ""} ${companions ? "sculpture-constellation" : ""}`}
      ref={stage}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty(
          "--tilt-x",
          `${(e.clientY - r.top - r.height / 2) / -18}deg`,
        );
        ref.current?.style.setProperty(
          "--tilt-y",
          `${(e.clientX - r.left - r.width / 2) / 18}deg`,
        );
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--tilt-x", "0deg");
        ref.current?.style.setProperty("--tilt-y", "0deg");
      }}
    >
      <div className="stage-cross cross-one">+</div>
      <div className="stage-cross cross-two">+</div>
      <div className="stage-orbit" />
      <div className="sculpture-shadow" />
      {companions &&
        (["frame", "cross"] as const).map((shape, index) => (
          <div
            className={`companion companion-${index}`}
            key={shape}
            aria-hidden="true"
          >
            <div className={`voxel-object ${paused ? "paused" : ""}`}>
              {shapes[shape].map(({ x, y, z }) => (
                <div
                  className="voxel"
                  key={`${x}${y}${z}`}
                  style={
                    {
                      "--x": x - 2,
                      "--y": y - 2,
                      "--z": z - 2,
                    } as CSSProperties
                  }
                >
                  {["front", "back", "right", "left", "top", "bottom"].map(
                    (face) => (
                      <i className={`face ${face}`} key={face} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      <div className="sculpture-tilt" ref={ref}>
        <div
          className={`voxel-object ${paused ? "paused" : ""}`}
          role="img"
          aria-label={`Three-dimensional pixel sculpture: ${labels[variant].toLowerCase()}`}
        >
          {shapes[variant].map(({ x, y, z }, index) => (
            <div
              key={`${x}${y}${z}`}
              className="voxel"
              style={
                {
                  "--x": x - 2,
                  "--y": y - 2,
                  "--z": z - 2,
                  ...(variant === "dna" && expanded
                    ? {
                        "--x":
                          Math.cos(index * 2.4) *
                          Math.sqrt(
                            1 -
                              (1 - (2 * index) / (shapes.dna.length - 1)) ** 2,
                          ) *
                          6,
                        "--y": (1 - (2 * index) / (shapes.dna.length - 1)) * 6,
                        "--z":
                          Math.sin(index * 2.4) *
                          Math.sqrt(
                            1 -
                              (1 - (2 * index) / (shapes.dna.length - 1)) ** 2,
                          ) *
                          6,
                      }
                    : {}),
                } as CSSProperties
              }
            >
              {["front", "back", "right", "left", "top", "bottom"].map(
                (face) => (
                  <i key={face} className={`face ${face}`} />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <span className="object-label">{labels[variant]}</span>
      {interactive && (
        <button
          className="assemble-toggle"
          aria-label={`${expanded ? "Assemble" : "Explode"} ${labels[variant].toLowerCase()}`}
          aria-pressed={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Assemble −" : "Explode +"}
        </button>
      )}
      <button
        className="motion-toggle"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
      >
        {paused ? "▶ Rotate" : "Ⅱ Pause"}
      </button>
    </div>
  );
}
