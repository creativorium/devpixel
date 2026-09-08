"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createPixelRoom } from "@/lib/pixel-room";
import { createVoxelDesk } from "@/lib/voxel-desk";
import { useDarkTheme } from "./theme-toggle";

type RoomControls = {
  reset: () => void;
  rotate: (direction: number) => void;
  zoom: (factor: number) => void;
  night: (value: boolean) => void;
  pixels: (value: number) => void;
};
export default function PixelRoomViewer({ hero = false }: { hero?: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<RoomControls | null>(null);
  const [status, setStatus] = useState("loading");
  const [night, setNight] = useState(false);
  const [pixels, setPixels] = useState(2);
  const darkTheme = useDarkTheme();
  const effectiveNight = hero ? darkTheme : night;
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      const failure = requestAnimationFrame(() => setStatus("unavailable"));
      return () => cancelAnimationFrame(failure);
    }
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor("#e9e9e4", 0);
    const canvas = renderer.domElement;
    canvas.setAttribute(
      "aria-label",
      hero
        ? "Slowly rotating voxel desk with a monitor, sketchbooks, stationery, plant, and desk lamp."
        : "Interactive monochrome pixel room. Drag to orbit; use the controls below to rotate or zoom.",
    );
    canvas.setAttribute("role", "img");
    host.appendChild(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
    const target = new THREE.Vector3(0, 1.2, 0);
    camera.position.set(8, 7, 10);
    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(target);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.35;
    controls.minAzimuthAngle = -0.18;
    controls.maxAzimuthAngle = 1.75;
    controls.minZoom = 0.7;
    controls.maxZoom = 1.8;
    controls.enableZoom = false;
    controls.enabled = !hero;
    if (hero) canvas.style.touchAction = "pan-y";
    // Buttons handle zoom so normal page scrolling never gets trapped by the canvas.
    controls.update();
    controls.saveState();
    const model = hero ? createVoxelDesk() : createPixelRoom();
    scene.add(model.room);
    const ambient = new THREE.HemisphereLight("#ffffff", "#555555", 2.4);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight("#ffffff", 3.2);
    sun.position.set(-1, 8, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, {
      left: -6,
      right: 6,
      top: 6,
      bottom: -6,
      near: 0.5,
      far: 25,
    });
    sun.shadow.bias = -0.001;
    sun.shadow.normalBias = 0.035;
    scene.add(sun);
    let visible = true;
    let disposed = false;
    let frame = 0;
    let pixelSize = hero ? 1 : 2;
    let firstFrame = true;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let angle = 0;
    let lastTime = 0;
    const draw = () => {
      if (frame || !visible || disposed || document.hidden) return;
      frame = requestAnimationFrame((time) => {
        frame = 0;
        if (!disposed && visible && !document.hidden) {
          if (hero && !reducedMotion.matches) {
            const delta = lastTime
              ? Math.min((time - lastTime) / 1000, 0.05)
              : 0;
            angle += delta * 0.12;
            // A slow orbit through the open side keeps the room interior visible.
            const orbit = Math.atan2(8, 10) + Math.sin(angle) * 0.42;
            camera.position.set(
              Math.sin(orbit) * 12.8,
              7,
              Math.cos(orbit) * 12.8,
            );
            camera.lookAt(target);
          }
          lastTime = time;
          renderer.render(scene, camera);
          // The room and lights stay fixed while the camera orbits; reuse its shadow map.
          renderer.shadowMap.autoUpdate = false;
          if (firstFrame) {
            firstFrame = false;
            setStatus("ready");
          }
          if (hero && !reducedMotion.matches) draw();
        }
      });
    };
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const aspect = width / height;
      const halfHeight = Math.max(4.6, 4.8 / aspect);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        Math.max(1, Math.round(width / pixelSize)),
        Math.max(1, Math.round(height / pixelSize)),
        false,
      );
      draw();
    };
    controls.addEventListener("change", draw);
    reducedMotion.addEventListener("change", draw);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) draw();
    });
    intersection.observe(host);
    const visibility = () => {
      if (!document.hidden) draw();
    };
    document.addEventListener("visibilitychange", visibility);
    const lost = (event: Event) => {
      event.preventDefault();
      setStatus("unavailable");
    };
    const restored = () => {
      setStatus("ready");
      draw();
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    api.current = {
      reset() {
        controls.reset();
        camera.zoom = 1;
        camera.updateProjectionMatrix();
        draw();
      },
      rotate(direction) {
        const offset = camera.position.clone().sub(controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.theta = THREE.MathUtils.clamp(
          spherical.theta + direction * 0.2,
          controls.minAzimuthAngle,
          controls.maxAzimuthAngle,
        );
        camera.position
          .copy(controls.target)
          .add(new THREE.Vector3().setFromSpherical(spherical));
        controls.update();
        draw();
      },
      zoom(factor) {
        camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, 0.7, 1.8);
        camera.updateProjectionMatrix();
        draw();
      },
      night(value) {
        model.setNight(value);
        ambient.intensity = value ? 0.48 : 2.4;
        sun.intensity = value ? 0.45 : 3.2;
        draw();
      },
      pixels(value) {
        pixelSize = value;
        resize();
      },
    };
    if (hero)
      api.current.night(document.documentElement.dataset.theme === "dark");
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      api.current = null;
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      controls.removeEventListener("change", draw);
      reducedMotion.removeEventListener("change", draw);
      controls.dispose();
      model.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [hero]);
  useEffect(() => {
    if (hero) api.current?.night(darkTheme);
  }, [darkTheme, hero]);
  const ready = status === "ready";
  return (
    <div className={`room-experience ${effectiveNight ? "room-night" : ""}`}>
      <div className="room-stage">
        <div className="room-stage-meta">
          <span>
            {hero
              ? "DESK_001 / A PLACE TO CREATE"
              : "ROOM_001 / THE QUIET STUDIO"}
          </span>
          <span>{effectiveNight ? "AFTER HOURS" : "A LITTLE DAYLIGHT"}</span>
        </div>
        <div
          className="room-canvas"
          ref={mount}
          aria-busy={status === "loading"}
        />
        {!ready && (
          <div className="room-fallback" role="status">
            <span className="pixel-text">
              {status === "loading" ? "Loading room…" : "Room unavailable"}
            </span>
            <p>
              {status === "loading"
                ? "Putting every little piece in place."
                : "This preview needs WebGL. Try enabling hardware acceleration in your browser and reload the page."}
            </p>
          </div>
        )}
        <div className="room-stage-bottom">
          <span>
            {hero ? "A LITTLE SPACE FOR BIG IDEAS" : "DRAG TO LOOK AROUND"}
          </span>
          <span>DESIGNED ONE BLOCK AT A TIME.</span>
        </div>
      </div>
      {!hero && (
        <>
          <div className="room-controls" aria-label="Room controls">
            <div className="room-control-group">
              <span className="eyebrow">VIEW</span>
              <button
                disabled={!ready}
                aria-label="Rotate room left"
                onClick={() => api.current?.rotate(-1)}
              >
                ↶
              </button>
              <button
                disabled={!ready}
                aria-label="Rotate room right"
                onClick={() => api.current?.rotate(1)}
              >
                ↷
              </button>
              <button
                disabled={!ready}
                aria-label="Zoom in"
                onClick={() => api.current?.zoom(1.15)}
              >
                +
              </button>
              <button
                disabled={!ready}
                aria-label="Zoom out"
                onClick={() => api.current?.zoom(1 / 1.15)}
              >
                −
              </button>
              <button
                disabled={!ready}
                className="room-reset"
                onClick={() => api.current?.reset()}
              >
                Reset view
              </button>
            </div>
            <div className="room-control-group">
              <button
                disabled={!ready}
                className="room-light"
                aria-pressed={night}
                onClick={() => {
                  setNight(!night);
                  api.current?.night(!night);
                }}
              >
                {night ? "☼ Daylight" : "◐ After hours"}
              </button>
              <label className="room-pixels">
                Pixel size
                <select
                  disabled={!ready}
                  value={pixels}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    setPixels(size);
                    api.current?.pixels(size);
                  }}
                >
                  <option value={1}>Fine / 1×</option>
                  <option value={2}>Classic / 2×</option>
                  <option value={4}>Chunky / 4×</option>
                </select>
              </label>
            </div>
          </div>
          <p className="room-accessibility">
            Drag with your mouse or finger, or use the view buttons. Scroll
            normally to move down the page.
          </p>
        </>
      )}
    </div>
  );
}
