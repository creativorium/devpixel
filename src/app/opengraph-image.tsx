import { ImageResponse } from "next/og";
export const alt = "DevnPixel. Big ideas. Small pixels.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#f5f5f0",
        color: "#161616",
        display: "flex",
        flexDirection: "column",
        padding: "65px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 32 }}>devnpixel®</div>
      <div
        style={{
          display: "flex",
          fontSize: 105,
          fontWeight: 700,
          letterSpacing: "-5px",
        }}
      >
        Big ideas.
        <br />
        Small pixels.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 21,
          justifyContent: "space-between",
        }}
      >
        <span>INDEPENDENT DIGITAL STUDIO</span>
        <span>devnpixel.com</span>
      </div>
    </div>,
    size,
  );
}
