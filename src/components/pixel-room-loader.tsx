"use client";
import { useLanguage } from "./use-language";
function RoomLoading() {
  const { t } = useLanguage();
  return (
    <div className="room-loading" role="status">
      {t.building}
    </div>
  );
}
import dynamic from "next/dynamic";
const PixelRoomViewer = dynamic(() => import("./pixel-room-viewer"), {
  ssr: false,
  loading: () => <RoomLoading />,
});
export function PixelRoomLoader({ hero = false }: { hero?: boolean }) {
  return (
    <div className={hero ? "hero-room" : undefined}>
      <PixelRoomViewer hero={hero} />
    </div>
  );
}
