import * as THREE from "three";

// Original geometry inspired by the supplied desk reference, without using the stock image.
export function createVoxelDesk() {
  const room = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
  ) => {
    if (!materials.has(color))
      materials.set(
        color,
        new THREE.MeshStandardMaterial({ color, roughness: 0.8 }),
      );
    const mesh = new THREE.Mesh(geometry, materials.get(color));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    room.add(mesh);
    return mesh;
  };
  // Layered plinth and a stepped backdrop, cropped closely around the work surface.
  box(0, -0.12, 0, 6.1, 0.28, 4.2, "#595959");
  box(0, 0.07, 0, 5.87, 0.12, 3.98, "#bcbcbc");
  for (let i = 0; i < 10; i++) {
    const height = i < 2 ? 3.3 : i < 7 ? 3.75 : i < 9 ? 3.35 : 2.95;
    box(
      -2.61 + i * 0.58,
      height / 2 + 0.14,
      -1.83,
      0.58,
      height,
      0.14,
      "#d4d4d4",
    );
  }
  box(-2.88, 1.52, -0.94, 0.14, 2.76, 1.85, "#dcdcdc");
  box(2.87, 1.2, -1.08, 0.14, 2.12, 1.6, "#bdbdbd");
  // Solid desk, two pedestal legs, and a lower tier for sketchbooks.
  box(0, 1.38, -0.52, 5.42, 0.26, 2.12, "#969696");
  box(-2.42, 0.76, -0.52, 0.44, 1.08, 1.98, "#777777");
  box(2.42, 0.76, -0.52, 0.44, 1.08, 1.98, "#777777");
  box(0, 1.12, -1.38, 4.55, 0.25, 0.19, "#646464");
  box(0.62, 0.35, 1.08, 3.8, 0.44, 1.1, "#9f9f9f");
  box(0.62, 0.62, 1.08, 3.93, 0.1, 1.16, "#b5b5b5");
  for (let i = 0; i < 15; i++)
    box(-2.49 + i * 0.35, 1.518, -0.52, 0.011, 0.009, 1.95, "#888888");
  // Display and stepped foot.
  box(-0.23, 1.56, -0.93, 0.98, 0.1, 0.58, "#c3c3c3");
  box(-0.23, 1.81, -1.12, 0.22, 0.49, 0.19, "#919191");
  box(-0.23, 2.62, -1.14, 2.33, 1.62, 0.2, "#333333");
  box(-0.23, 2.6, -1.018, 2.12, 1.34, 0.035, "#1d1d1d");
  box(-0.23, 1.89, -1.005, 2.18, 0.14, 0.035, "#c2c2c2");
  box(-0.23, 1.89, -0.98, 0.085, 0.085, 0.012, "#363636");
  const glow = new THREE.MeshStandardMaterial({
    color: "#e3e3e3",
    emissive: "#ffffff",
    emissiveIntensity: 0.25,
    roughness: 1,
  });
  // The same 32px PixelMark silhouette used in the site header, in 4px cells.
  const logoRows = [
    "11100111",
    "11100111",
    "11111111",
    "00111100",
    "00111100",
    "11111111",
    "11100111",
    "11100111",
  ];
  const logoPixelSize = 0.13;
  for (let y = 0; y < logoRows.length; y++)
    for (let x = 0; x < logoRows[y].length; x++) {
      if (logoRows[y][x] === "1") {
        const pixel = box(
          -0.23 + (x - 3.5) * logoPixelSize,
          2.6 + (3.5 - y) * logoPixelSize,
          -0.99,
          logoPixelSize,
          logoPixelSize,
          0.02,
          "#d2d2d2",
        );
        pixel.material = glow;
      }
    }
  for (let i = 0; i < 3; i++)
    box(0.57 + i * 0.07, 3.18, -0.993, 0.025, 0.025, 0.02, "#777777");
  // Keyboard, mouse, and a graphic tablet with a stylus.
  box(-0.15, 1.57, 0.12, 1.55, 0.09, 0.47, "#dadada");
  for (let x = 0; x < 14; x++)
    for (let z = 0; z < 4; z++)
      box(
        -0.83 + x * 0.105,
        1.625,
        -0.04 + z * 0.1,
        0.075,
        0.024,
        0.068,
        "#f3f3f3",
      );
  box(1.03, 1.58, 0.08, 0.24, 0.13, 0.35, "#e1e1e1");
  box(1.03, 1.655, 0.07, 0.018, 0.02, 0.09, "#656565");
  const tablet = box(1.64, 1.55, 0.18, 0.62, 0.05, 0.44, "#3b3b3b");
  tablet.rotation.y = -0.12;
  const pen = box(1.71, 1.6, 0.14, 0.035, 0.035, 0.37, "#dedede");
  pen.rotation.y = -0.25;
  // Books stacked beside the monitor.
  for (let i = 0; i < 4; i++) {
    const z = -0.8 + (i % 2) * 0.04;
    box(
      -1.95,
      1.58 + i * 0.18,
      z,
      0.88,
      0.16,
      0.66,
      i % 2 ? "#dddddd" : "#4e4e4e",
    );
    box(-1.95, 1.585 + i * 0.18, z + 0.01, 0.82, 0.1, 0.67, "#bebebe");
  }
  // Pencil cup and three different heights of pencils.
  box(-1.87, 2.44, -0.86, 0.26, 0.31, 0.26, "#929292");
  for (let i = 0; i < 3; i++) {
    const pencil = box(
      -1.95 + i * 0.07,
      2.68 + (i % 2) * 0.08,
      -0.86,
      0.035,
      0.38,
      0.035,
      i % 2 ? "#dddddd" : "#444444",
    );
    pencil.rotation.z = (i - 1) * 0.12;
  }
  // Coffee cup with a hollow square handle.
  box(-1.08, 1.7, -0.03, 0.36, 0.35, 0.36, "#dfdfdf");
  box(-1.08, 1.88, -0.03, 0.29, 0.012, 0.29, "#575757");
  box(-0.84, 1.72, -0.03, 0.08, 0.25, 0.09, "#bbbbbb");
  for (const y of [1.62, 1.82])
    box(-0.92, y, -0.03, 0.16, 0.06, 0.09, "#bbbbbb");
  // Sketch pad, loose pixel notes, and a notebook on the lower tier.
  const pad = box(-1.89, 1.54, 0.24, 0.62, 0.045, 0.41, "#f4f4f4");
  pad.rotation.y = 0.12;
  for (let i = 0; i < 4; i++)
    box(-1.9, 1.566, 0.13 + i * 0.055, 0.37, 0.005, 0.012, "#999999");
  box(-2.38, 1.545, 0.31, 0.19, 0.025, 0.18, "#bdbdbd");
  box(-0.36, 0.76, 1.1, 1.62, 0.18, 0.86, "#4d4d4d");
  box(-0.36, 0.78, 1.12, 1.57, 0.1, 0.86, "#dcdcdc");
  box(-0.36, 0.851, 1.1, 1.64, 0.03, 0.89, "#595959");
  const note = box(-0.28, 0.884, 1.06, 0.36, 0.025, 0.34, "#e9e9e9");
  note.rotation.y = -0.13;
  // Voxel succulent on the lower tier.
  box(1.93, 0.92, 1.08, 0.55, 0.49, 0.55, "#c8c8c8");
  box(1.93, 1.17, 1.08, 0.59, 0.08, 0.59, "#dddddd");
  box(1.93, 1.217, 1.08, 0.46, 0.018, 0.46, "#4f4f4f");
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4,
      h = 0.28 + (i % 3) * 0.16;
    const x = 1.93 + Math.cos(a) * 0.16,
      z = 1.08 + Math.sin(a) * 0.16;
    box(x, 1.23 + h / 2, z, 0.15, h, 0.15, i % 2 ? "#666666" : "#8b8b8b");
    box(x, 1.26 + h, z, 0.11, 0.08, 0.11, "#a6a6a6");
  }
  // Articulated desk lamp: chunky stem, sloped arm, and a stepped shade.
  box(1.72, 1.59, -0.94, 0.57, 0.14, 0.57, "#505050");
  box(1.72, 1.99, -0.94, 0.11, 0.72, 0.11, "#727272");
  const arm = box(1.58, 2.46, -0.94, 0.095, 0.55, 0.095, "#686868");
  arm.rotation.z = -0.5;
  const lampShade = new THREE.MeshStandardMaterial({
    color: "#a9a9a9",
    roughness: 0.85,
    emissive: "#ffffff",
    emissiveIntensity: 0,
  });
  for (let i = 0; i < 3; i++) {
    const shade = box(
      1.43,
      2.54 + i * 0.13,
      -0.94,
      0.65 - i * 0.13,
      0.13,
      0.6 - i * 0.12,
      "#999999",
    );
    shade.material = lampShade;
  }
  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 0.35,
  });
  const bulb = box(1.43, 2.456, -0.94, 0.48, 0.03, 0.44, "#eeeeee");
  bulb.material = bulbMaterial;
  const lamp = new THREE.PointLight("#ffffff", 2, 5, 2);
  lamp.position.set(1.43, 2.35, -0.94);
  room.add(lamp);
  return {
    room,
    setNight(night: boolean) {
      lamp.intensity = night ? 16 : 2;
      bulbMaterial.emissiveIntensity = night ? 2 : 0.35;
      lampShade.emissiveIntensity = night ? 0.08 : 0;
      glow.emissiveIntensity = night ? 0.9 : 0.25;
    },
    dispose() {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      glow.dispose();
      lampShade.dispose();
      bulbMaterial.dispose();
    },
  };
}
