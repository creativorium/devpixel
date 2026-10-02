// Villa Bumi-owned source photography, used for its requested redesign preview.
// Keep source URLs for replacing/syncing the future WordPress media library.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
const base = "https://villabumi.com/wp-content/uploads/";
const images = {
  exterior: "2023/08/Bumi_Drone_denoise-1.jpg",
  deck: "2026/01/Bumi-Deck_1.JPG-scaled.jpeg",
  pool: "2026/01/Bumi-Deck_2.JPG-scaled.jpeg",
  sunset: "2023/08/LawrenceN-2308-0408-1.jpg",
  living: "2023/08/LawrenceN-2308-0402.jpg",
  bedroom1: "2023/08/LawrenceN-2308-0352.jpg",
  bedroom2: "2023/08/LawrenceN-2308-0383.jpg",
  bedroom3: "2023/08/LawrenceN-2308-0375.jpg",
  garden: "2023/08/LawrenceN-2308-0427.jpg",
  bedroomDetail: "2023/08/LawrenceN-2308-0368.jpg",
};
await mkdir("public/villabumi", { recursive: true });
for (const [name, path] of Object.entries(images)) {
  const r = await fetch(base + path, { signal: AbortSignal.timeout(45000) });
  if (!r.ok || !r.headers.get("content-type")?.startsWith("image/"))
    throw new Error(`${name}: ${r.status}`);
  const image = await sharp(Buffer.from(await r.arrayBuffer()))
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();
  await writeFile(`public/villabumi/${name}.webp`, image);
  for (const width of [720, 1200]) {
    await sharp(image)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(`public/villabumi/${name}-${width}.webp`);
  }
  console.log(`${name}: ${image.length} bytes`);
}
await writeFile(
  "public/villabumi/sources.json",
  JSON.stringify(
    Object.fromEntries(
      Object.entries(images).map(([name, path]) => [name, base + path]),
    ),
    null,
    2,
  ) + "\n",
);
