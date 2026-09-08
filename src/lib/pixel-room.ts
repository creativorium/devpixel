import * as THREE from "three";

// Original room built from shared box geometry. No downloaded models or textures.
export function createPixelRoom() {
  const room = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const material = (color: string) => {
    if (!materials.has(color))
      materials.set(
        color,
        new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
      );
    return materials.get(color)!;
  };
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string,
    parent: THREE.Object3D = room,
  ) => {
    const mesh = new THREE.Mesh(geometry, material(color));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  // Floating foundation, parquet floor, and two cutaway walls.
  box(0, -0.23, 0, 6.3, 0.4, 6.3, "#303030");
  box(0, -0.025, 0, 6.1, 0.08, 6.1, "#888888");
  for (let x = 0; x < 12; x++)
    for (let z = 0; z < 6; z++) {
      box(
        -2.75 + x * 0.5,
        0.035,
        -2.5 + z,
        0.48,
        0.06,
        0.975,
        ["#b4b4b4", "#bebebe", "#c8c8c8"][(x * 7 + z * 3 + x * z) % 3],
      );
    }
  box(0, 1.7, -3, 6.2, 3.4, 0.18, "#dedede");
  box(-3, 1.7, 0, 0.18, 3.4, 6.2, "#c6c6c6");
  box(0, 0.16, -2.86, 6, 0.18, 0.1, "#f0f0f0");
  box(-2.86, 0.16, 0, 0.1, 0.18, 6, "#ededed");
  box(0, 3.43, -3, 6.3, 0.12, 0.27, "#eeeeee");
  box(-3, 3.43, 0, 0.27, 0.12, 6.3, "#eeeeee");
  // Inset window with thick pixel mullions and a sill.
  box(-2.88, 2.12, -0.6, 0.07, 1.65, 2.1, "#393939");
  const windowPane = box(-2.825, 2.12, -0.6, 0.025, 1.43, 1.87, "#f8f8f8");
  windowPane.material = new THREE.MeshStandardMaterial({
    color: "#e8e8e8",
    emissive: "#ffffff",
    emissiveIntensity: 0.35,
  });
  box(-2.78, 2.12, -0.6, 0.09, 1.55, 0.08, "#f3f3f3");
  box(-2.78, 2.12, -0.6, 0.09, 0.08, 1.98, "#f3f3f3");
  box(-2.7, 1.28, -0.6, 0.45, 0.13, 2.22, "#ededed");
  for (let i = 0; i < 3; i++)
    box(-2.78, 2.92 - i * 0.1, -0.6, 0.12, 0.05, 2.08, "#8c8c8c");
  // Sofa along the open side of the left wall.
  box(-2.05, 0.35, 1.4, 1.28, 0.4, 2.35, "#424242");
  box(-2.59, 0.88, 1.4, 0.26, 1, 2.35, "#777777");
  for (const z of [0.7, 1.4, 2.1]) {
    box(-1.99, 0.65, z, 1.03, 0.25, 0.66, "#a3a3a3");
    const cushion = box(-2.34, 1.02, z, 0.24, 0.53, 0.62, "#bcbcbc");
    cushion.rotation.z = -0.13;
  }
  for (const z of [0.21, 2.59]) box(-2.04, 0.75, z, 1.3, 0.72, 0.2, "#666666");
  const pillow = box(-1.85, 0.95, 2.06, 0.52, 0.27, 0.48, "#eeeeee");
  pillow.rotation.x = 0.3;
  pillow.rotation.z = 0.4;
  // Woven rug with a block border.
  box(0.3, 0.095, 1.1, 3.1, 0.035, 2.48, "#e1e1e1");
  for (let i = 0; i < 13; i++) {
    box(-1.15 + i * 0.24, 0.117, -0.025, 0.13, 0.01, 0.15, "#626262");
    box(-1.15 + i * 0.24, 0.117, 2.225, 0.13, 0.01, 0.15, "#626262");
  }
  for (let i = 0; i < 8; i++)
    box(0.3, 0.116, 0.22 + i * 0.25, 2.8, 0.008, 0.018, "#b9b9b9");
  // Low coffee table and a little stack of books.
  box(0.25, 0.62, 1.08, 1.6, 0.14, 0.95, "#5a5a5a");
  for (const x of [-0.34, 0.84])
    for (const z of [0.77, 1.39]) box(x, 0.34, z, 0.11, 0.52, 0.11, "#333333");
  box(0.47, 0.745, 1.08, 0.57, 0.09, 0.4, "#eeeeee");
  box(0.43, 0.81, 1.1, 0.51, 0.045, 0.37, "#393939");
  box(-0.2, 0.77, 0.93, 0.17, 0.18, 0.17, "#dddddd");
  box(-0.2, 0.865, 0.93, 0.13, 0.014, 0.13, "#333333");
  // Work desk, pedestal, drawers, and monitor.
  box(1.15, 1.12, -2.15, 2.7, 0.15, 1.02, "#eee");
  box(2.18, 0.57, -2.15, 0.49, 1.02, 0.86, "#737373");
  for (let i = 0; i < 3; i++) {
    box(2.18, 0.29 + i * 0.3, -1.705, 0.43, 0.27, 0.035, "#b8b8b8");
    box(2.18, 0.32 + i * 0.3, -1.68, 0.16, 0.035, 0.025, "#404040");
  }
  for (const z of [-2.48, -1.84])
    box(-0.04, 0.6, z, 0.08, 1.04, 0.08, "#444444");
  box(1, 1.235, -2.38, 0.48, 0.045, 0.32, "#4a4a4a");
  box(1, 1.44, -2.42, 0.09, 0.4, 0.09, "#424242");
  box(1, 1.83, -2.42, 1.22, 0.76, 0.12, "#262626");
  box(1, 1.84, -2.35, 1.09, 0.61, 0.02, "#141414");
  const screen = new THREE.Group();
  room.add(screen);
  for (let row = 0; row < 6; row++) {
    const lengths = [0.57, 0.37, 0.66, 0.45, 0.53, 0.26];
    box(
      0.79 + (row % 2) * 0.08,
      2.02 - row * 0.065,
      -2.331,
      lengths[row],
      0.022,
      0.008,
      row % 3 === 0 ? "#fafafa" : "#858585",
      screen,
    );
  }
  box(1, 1.226, -1.88, 0.75, 0.045, 0.27, "#555555");
  for (let x = 0; x < 10; x++)
    for (let z = 0; z < 3; z++)
      box(
        0.69 + x * 0.066,
        1.253,
        -1.96 + z * 0.07,
        0.045,
        0.015,
        0.04,
        "#cfcfcf",
      );
  box(1.62, 1.23, -1.87, 0.12, 0.07, 0.19, "#363636");
  box(2.12, 1.32, -2.34, 0.2, 0.28, 0.2, "#eeeeee");
  for (let i = 0; i < 3; i++)
    box(2.06 + i * 0.05, 1.55, -2.34, 0.025, 0.25, 0.025, "#454545");
  // Desk chair.
  box(0.82, 0.66, -1.17, 0.65, 0.16, 0.61, "#4b4b4b");
  box(0.82, 1.02, -0.89, 0.64, 0.68, 0.12, "#4b4b4b");
  box(0.82, 0.34, -1.17, 0.1, 0.6, 0.1, "#353535");
  box(0.82, 0.13, -1.17, 0.73, 0.07, 0.1, "#454545");
  box(0.82, 0.13, -1.17, 0.1, 0.07, 0.65, "#454545");
  // Floating wall shelf, books, and a small sculpture.
  box(1.08, 2.68, -2.71, 2.85, 0.12, 0.42, "#777777");
  for (let i = 0; i < 7; i++)
    box(
      0.12 + i * 0.14,
      2.9 + (i % 2) * 0.035,
      -2.72,
      0.11,
      0.36 + (i % 2) * 0.07,
      0.24,
      ["#393939", "#aaa", "#eeeeee"][i % 3],
    );
  box(1.81, 2.91, -2.7, 0.17, 0.36, 0.17, "#444");
  box(1.81, 2.91, -2.7, 0.4, 0.12, 0.17, "#444");
  // Pixel artwork above the reading corner.
  box(-1.48, 2.3, -2.86, 1.15, 1.28, 0.08, "#373737");
  box(-1.48, 2.3, -2.809, 1.02, 1.15, 0.025, "#f3f3f3");
  for (let x = 0; x < 5; x++)
    for (let y = 0; y < 5; y++)
      if (x === y || x + y === 4)
        box(
          -1.8 + x * 0.16,
          1.98 + y * 0.16,
          -2.787,
          0.155,
          0.155,
          0.02,
          "#333333",
        );
  // Low cabinet and a vinyl player.
  box(-1.36, 0.47, -2.35, 1.6, 0.75, 0.8, "#8b8b8b");
  for (const x of [-1.76, -0.97])
    box(x, 0.48, -1.93, 0.72, 0.62, 0.035, "#bcbcbc");
  box(-1.36, 0.89, -2.35, 1.65, 0.12, 0.85, "#ededed");
  box(-1.37, 1, -2.34, 0.77, 0.11, 0.52, "#333");
  box(-1.45, 1.064, -2.34, 0.38, 0.014, 0.36, "#777");
  // Voxel plants.
  const plant = (x: number, z: number, height: number) => {
    box(x, 0.27, z, 0.47, 0.43, 0.47, "#e9e9e9");
    box(x, 0.5, z, 0.5, 0.07, 0.5, "#b0b0b0");
    box(x, 0.54, z, 0.38, 0.012, 0.38, "#383838");
    box(x, 0.55 + height / 2, z, 0.09, height, 0.09, "#585858");
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      const y = 0.72 + (i * height) / 8;
      box(
        x + Math.cos(a) * 0.22,
        y,
        z + Math.sin(a) * 0.22,
        0.36,
        0.16,
        0.28,
        i % 2 ? "#717171" : "#999999",
      );
      box(
        x + Math.cos(a) * 0.37,
        y + 0.13,
        z + Math.sin(a) * 0.37,
        0.18,
        0.15,
        0.19,
        "#858585",
      );
    }
  };
  plant(-2.18, -1.58, 1.1);
  plant(2.43, -2.54, 0.85);
  // Floor lamp: stepped shade, square stem and base.
  box(2.14, 0.12, 1.42, 0.55, 0.12, 0.55, "#444");
  box(2.14, 1.27, 1.42, 0.055, 2.3, 0.055, "#555");
  const shadeMaterial = new THREE.MeshStandardMaterial({
    color: "#ededed",
    emissive: "#fff",
    emissiveIntensity: 0.25,
  });
  for (let i = 0; i < 4; i++) {
    const shade = box(
      2.14,
      2.1 + i * 0.14,
      1.42,
      0.84 - i * 0.12,
      0.14,
      0.84 - i * 0.12,
      "#eeeeee",
    );
    shade.material = shadeMaterial;
  }
  const lamp = new THREE.PointLight("#ffffff", 9, 7, 2);
  lamp.position.set(2.14, 1.99, 1.42);
  room.add(lamp);
  return {
    room,
    setNight(night: boolean) {
      lamp.intensity = night ? 24 : 9;
      shadeMaterial.emissiveIntensity = night ? 1.1 : 0.25;
      (windowPane.material as THREE.MeshStandardMaterial).emissiveIntensity =
        night ? 0.02 : 0.35;
    },
    dispose() {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      shadeMaterial.dispose();
      (windowPane.material as THREE.Material).dispose();
    },
  };
}
