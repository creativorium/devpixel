"use client";
import dynamic from "next/dynamic";
const PixelRoomViewer = dynamic(() => import("./pixel-room-viewer"), {
  ssr: false,
  loading: () => (
    <div className="room-loading" role="status">
      Building a little world…
    </div>
  ),
});
export function PixelRoomLoader({ hero = false }: { hero?: boolean }) {
  return (
    <div className={hero ? "hero-room" : undefined}>
      <PixelRoomViewer hero={hero} />
    </div>
  );
}
