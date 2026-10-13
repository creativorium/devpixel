// Upload rules shared by the browser (early feedback) and the server (enforcement).

export const MAX_FILE_BYTES = 4 * 1024 * 1024; // Netlify request bodies stay well under their limit
export const BUCKET = "workspace";

export type Attachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  uploaded_by: string;
  created_at: string;
};

/** Images we display inline. SVG is excluded: it can carry script. */
const inlineImages = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

/** Everything else we accept is always served as a download. */
const downloads: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/markdown": "md",
  "text/csv": "csv",
  "application/zip": "zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
};

const byExtension: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export const ACCEPT = Object.keys(byExtension)
  .map((ext) => `.${ext}`)
  .join(",");

export const isImage = (mime: string) => inlineImages.has(mime);

/** The MIME type we will store, or null if the file type is not allowed. */
export function allowedMime(name: string, reported: string): string | null {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  const fromExt = byExtension[ext];
  if (!fromExt) return null;
  // Trust the extension's type; browsers report Office/markdown types inconsistently.
  if (inlineImages.has(fromExt) && reported && reported !== fromExt) {
    // An image extension must match an image type (e.g. not an SVG renamed to .png).
    return inlineImages.has(reported) ? reported : null;
  }
  return fromExt in downloads || inlineImages.has(fromExt) ? fromExt : null;
}

/** A storage-safe file name that keeps the extension. */
export function safeFileName(name: string) {
  // Only the last path segment; no dots, slashes or spaces survive in the base.
  const leaf = name.trim().split(/[/\\]/).pop()!.slice(-120);
  const match = leaf.match(/^(.*)\.([a-z0-9]{1,8})$/i);
  const base = (match ? match[1]! : leaf)
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const ext = match ? match[2]!.toLowerCase() : "";
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Content-Disposition for serving: images inline, everything else as a download. */
export function disposition(name: string, mime: string) {
  const ascii = name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const kind = isImage(mime) ? "inline" : "attachment";
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/** Detects real PNG/JPEG/GIF/WebP data from the first bytes, or null. */
export function sniffImage(bytes: Uint8Array): string | null {
  const at = (i: number) => bytes[i] ?? -1;
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47)
    return "image/png";
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "image/jpeg";
  if (at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x38)
    return "image/gif";
  if (
    at(0) === 0x52 &&
    at(1) === 0x49 &&
    at(2) === 0x46 &&
    at(3) === 0x46 &&
    at(8) === 0x57 &&
    at(9) === 0x45 &&
    at(10) === 0x42 &&
    at(11) === 0x50
  )
    return "image/webp";
  return null;
}
