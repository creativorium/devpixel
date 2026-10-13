"use client";

import {
  allowedMime,
  formatBytes,
  isImage,
  MAX_FILE_BYTES,
  type Attachment,
} from "@/lib/workspace/files";

const MAX_SIDE = 2400;

/** Re-encodes big screenshots/photos so they upload fast and fit the size limit. */
async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file; // keep GIFs animated
  if (file.size < 1_500_000) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );
  if (!blob || blob.size >= file.size) return file;
  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

/** Pasted screenshots arrive as "image.png"; give them a readable, unique name. */
export function namePasted(file: File) {
  if (file.name && file.name !== "image.png") return file;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return new File([file], `screenshot-${stamp}.png`, { type: file.type });
}

export async function uploadFile(
  original: File,
  target: { taskId: string } | { channelId: string },
): Promise<Attachment> {
  if (!allowedMime(original.name, original.type))
    throw new Error(
      `${original.name}: use images, PDF, text, CSV, Office files or ZIP.`,
    );
  const file = await shrinkImage(original);
  if (file.size > MAX_FILE_BYTES)
    throw new Error(`${original.name} is larger than 4 MB.`);
  const form = new FormData();
  form.append("file", file);
  for (const [key, value] of Object.entries(target)) form.append(key, value);
  const res = await fetch("/teams/api/files", { method: "POST", body: form });
  const json = (await res.json().catch(() => null)) as {
    attachment?: Attachment;
    message?: string;
  } | null;
  if (!res.ok || !json?.attachment)
    throw new Error(json?.message ?? `Could not upload ${original.name}.`);
  return json.attachment;
}

export const fileUrl = (id: string) => `/teams/api/files/${id}`;

/** Thumbnails for images, chips for other files. */
export function AttachmentList({
  attachments,
  onRemove,
  compact = false,
}: {
  attachments: Attachment[];
  onRemove?: (attachment: Attachment) => void;
  compact?: boolean;
}) {
  if (attachments.length === 0) return null;
  const images = attachments.filter((a) => isImage(a.mime));
  const files = attachments.filter((a) => !isImage(a.mime));
  return (
    <div className={`ws-files${compact ? " compact" : ""}`}>
      {images.length > 0 && (
        <div className="ws-thumbs">
          {images.map((a) => (
            <figure key={a.id} className="ws-thumb">
              <a
                href={fileUrl(a.id)}
                target="_blank"
                rel="noopener"
                title={a.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-checked file */}
                <img src={fileUrl(a.id)} alt={a.name} loading="lazy" />
              </a>
              {onRemove && (
                <button
                  type="button"
                  className="ws-thumb-remove"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => onRemove(a)}
                >
                  ×
                </button>
              )}
            </figure>
          ))}
        </div>
      )}
      {files.map((a) => (
        <span key={a.id} className="ws-file-chip">
          <a href={fileUrl(a.id)} download={a.name}>
            <span aria-hidden="true">📄</span>
            <span className="ws-ellipsis">{a.name}</span>
            <span className="ws-meta">{formatBytes(a.size)}</span>
          </a>
          {onRemove && (
            <button
              type="button"
              aria-label={`Remove ${a.name}`}
              onClick={() => onRemove(a)}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
