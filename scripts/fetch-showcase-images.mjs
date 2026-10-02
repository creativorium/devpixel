// Illustrative Unsplash photographs, not photographs of the fictional demo brands.
import { mkdir, writeFile, access } from "node:fs/promises";
const photos = {
  surf: "photo-1502680390469-be75c86b636f",
  car: "photo-1503376780353-7e6692767b70",
  fashion: "photo-1445205170230-053b83016050",
  bakery: "photo-1509440159596-0249088772ff",
  bicycle: "photo-1485965120184-e220f721d03e",
  camera: "photo-1516035069371-29a1b244cc32",
  beauty: "photo-1608571423902-eed4a5ad8108",
  wellness: "photo-1544367567-0f2fcb009e0b",
  bath: "photo-1544161515-4ab6ce6db874",
  "night-hotel": "photo-1566073771259-6a8506099945",
  spa: "photo-1540555700478-4be289fbecef",
  retreat: "photo-1654703943019-e519711ea124",
  pool: "photo-1571896349842-33c89424de2d",
  coast: "photo-1519046904884-53103b34b206",
  dining: "photo-1517248135467-4c7edcad34c4",
  coffee: "photo-1442512595331-e89e73853f31",
  food: "photo-1512621776951-a57141f2eefd",
  ceramics: "photo-1578749556568-bc2c40e68b61",
  textile: "photo-1445205170230-053b83016050",
  villa: "photo-1613490493576-7fde63acd811",
  architecture: "photo-1600607687920-4e2a09cf159d",
  interior: "photo-1600210492486-724fe5c67fb0",
  scooter: "photo-1506127032361-59d904234169",
  boards: "photo-1455729552865-3658a5d39692",
};
await mkdir("public/showcase", { recursive: true });
for (const [name, id] of Object.entries(photos)) {
  if (
    await access(`public/showcase/${name}.jpg`).then(
      () => true,
      () => false,
    )
  )
    continue;
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.startsWith("image/")
  )
    throw new Error(`${name}: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(`public/showcase/${name}.jpg`, bytes);
  console.log(`${name}: ${bytes.length} bytes`);
}
