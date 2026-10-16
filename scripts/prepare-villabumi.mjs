// Produce an independent source project; no DevnPixel services or credentials are copied.
import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { resolve, join } from "node:path";
const root = resolve(import.meta.dirname, "..");
const target = join(root, "output/villabumi-site");
async function put(path, content) {
  const file = join(target, path);
  await mkdir(resolve(file, ".."), { recursive: true });
  await writeFile(file, content);
}
async function copy(from, to) { await put(to, await readFile(join(root, from))); }
await mkdir(target, { recursive: true });
for (const name of ["villabumi", "villabumi-booking"]) await copy(`src/lib/${name}.ts`, `src/lib/${name}.ts`);
await copy("src/components/villabumi-booking.tsx", "src/components/villabumi-booking.tsx");
let booking = await readFile(join(target, "src/components/villabumi-booking.tsx"), "utf8");
booking = booking.replace(/          <a\s+className="bumi-calendar-source[\s\S]*?<\/a>/, "");
await put("src/components/villabumi-booking.tsx", booking);
let component = await readFile(join(root, "src/components/villabumi-preview.tsx"), "utf8");
component = component.replace(/      <div className="bumi-preview-bar">[\s\S]*?<\/div>/, '<div className="bumi-launch-marker" aria-hidden="true" />');
component = component.replace('root.querySelector(".bumi-preview-bar")', 'root.querySelector(".bumi-launch-marker")');
component = component.replace("function previewEnquiry", "function prepareEnquiry").replace("onSubmit={previewEnquiry}", "onSubmit={prepareEnquiry}");
component = component.replace(/    setNotice\(\s*"Your enquiry preview[\s\S]*?\);/, `    const text = ["Hello Villa Bumi, I would like to enquire about a stay.", "Name: " + data.get("name"), "Email: " + data.get("email"), "Arrival: " + (start || "Flexible"), "Departure: " + (end || "Flexible"), String(data.get("message") || "")].join("\\n");
    const url = new URL(villa.whatsapp);
    url.searchParams.set("text", text);
    setEnquiryLink(url.toString());
    setNotice("Your enquiry is ready. Open WhatsApp below to review and send it. This does not reserve your dates.");`);
component = component.replace('export function VillaBumiPreview() {', 'export function VillaBumiPreview() {\n  const [enquiryLink, setEnquiryLink] = useState("");');
component = component.replace('onChange={() => setNotice("")}', 'onChange={() => { setNotice(""); setEnquiryLink(""); }}');
component = component.replace("Preview enquiry <Arrow />", "Prepare WhatsApp enquiry <Arrow />");
component = component.replace("Design preview — no message is sent.", "Review your message in WhatsApp before sending.");
component = component.replace('          </form>', '            {enquiryLink && <a className="bumi-button" href={enquiryLink} target="_blank" rel="noopener noreferrer">Open WhatsApp to send <Arrow diagonal /></a>}\n          </form>');
component = component.replace('Villa Bumi. Design preview by', 'Villa Bumi. Website by').replace('<a href="/">DevnPixel</a>', '<a href="https://www.devnpixel.com/" target="_blank" rel="noopener noreferrer">DevnPixel</a>');
await put("src/components/villabumi-preview.tsx", component);
await copy("src/app/api/villabumi/booking/route.ts", "src/app/api/villabumi/booking/route.ts");
await copy("src/app/(showcase-demos)/showcase/villabumi/villabumi.css", "src/app/villabumi.css");
await cp(join(root, "public/villabumi"), join(target, "public/villabumi"), { recursive: true });
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
await put("package.json", JSON.stringify({ name: "villabumi", version: "1.0.0", private: true, scripts: { dev: "next dev -p 3002", build: "next build", start: "next start", typecheck: "tsc --noEmit", test: "tsx --test tests/*.test.ts" }, engines: { node: ">=22" }, dependencies: Object.fromEntries(["next","react","react-dom"].map(k => [k,pkg.dependencies[k]])), devDependencies: Object.fromEntries(["typescript","@types/node","@types/react","@types/react-dom","tsx"].map(k => [k,pkg.devDependencies[k]])) }, null, 2));
await put("tsconfig.json", JSON.stringify({ compilerOptions: { target: "ES2017", lib: ["dom","dom.iterable","esnext"], skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "react-jsx", incremental: true, plugins: [{name:"next"}], paths: {"@/*":["./src/*"]} }, include: ["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"], exclude: ["node_modules"] },null,2));
await put("next.config.ts", `import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  async headers() { return [{ source: "/(.*)", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" }
  ] }]; }
}; export default config;
`);
await put("src/app/layout.tsx", `import type { Metadata } from "next";
import "./villabumi.css";
import "./reset.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://villabumi.com"),
  title: "Villa Bumi | Private Pool Villa in Pecatu, Bali",
  description: "A three-bedroom hillside villa in Pecatu, Bali, with a private infinity pool and ocean views. Explore the villa, check availability, and enquire about your stay.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  robots: { index: process.env.SITE_INDEXABLE === "true", follow: process.env.SITE_INDEXABLE === "true" },
  openGraph: { type: "website", url: "https://villabumi.com", siteName: "Villa Bumi", title: "Villa Bumi | A hillside retreat above the Bukit", images: [{ url: "/villabumi/sunset.webp", width: 1800, height: 1200, alt: "Villa Bumi pool terrace" }] },
  twitter: { card: "summary_large_image", images: ["/villabumi/sunset.webp"] }
};
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
`);
await put("src/app/page.tsx", 'import { VillaBumiPreview } from "@/components/villabumi-preview";\nexport default function Home() { return <VillaBumiPreview />; }\n');
await put("src/app/reset.css", 'html { scroll-behavior: smooth; } body { margin: 0; } button, input, textarea, select { font: inherit; } .bumi-launch-marker { height: 1px; } @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }\n');
await put("src/app/robots.ts", `import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", ...(process.env.SITE_INDEXABLE === "true" ? {allow:"/"} : {disallow:"/"}) }, sitemap: "https://villabumi.com/sitemap.xml" }; }
`);
await put("src/app/sitemap.ts", 'import type { MetadataRoute } from "next";\nexport default function sitemap(): MetadataRoute.Sitemap { return process.env.SITE_INDEXABLE === "true" ? [{url:"https://villabumi.com/",changeFrequency:"monthly",priority:1}] : []; }\n');
await put("public/favicon.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f5f2ec"/><path d="M14 18l10 29h4l10-29M43 18v29" fill="none" stroke="#332f28" stroke-width="4" stroke-linecap="round"/></svg>');
await put(".env.example", '# Enable only when deployed on the final domain. Rebuild after changing.\nSITE_INDEXABLE=false\n');
await put(".gitignore", 'node_modules/\n.next/\n.env*\n!.env.example\n*.tsbuildinfo\n');
await copy("tests/villabumi-booking.test.ts", "tests/villabumi-booking.test.ts");
await copy("deployment/VILLABUMI.md", "DEPLOYMENT.md");
console.log(`Standalone project ready: ${target}`);
