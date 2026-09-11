import type { Metadata } from "next";
import Link from "next/link";
import { PixelRoomLoader } from "@/components/pixel-room-loader";
export const metadata: Metadata = {
  title: "The pixel room — 3D experiment",
  description:
    "Step into a small monochrome studio. An interactive pixel-style room by DevnPixel.",
  robots: { index: false, follow: false },
};
export default function ThreeDAnimation() {
  return (
    <main id="main" className="room-page">
      <div className="room-heading">
        <div>
          <Link className="text-link" href="/about">
            ← Back to the studio
          </Link>
          <p className="eyebrow">AN EXPERIMENT IN SMALL SPACES</p>
          <h1>
            A little room.
            <br />
            <span className="pixel-text">A lot of ideas.</span>
          </h1>
        </div>
        <p>
          A quiet corner to think, make, and start again.
          <br />
          Come in. Take a look around.
        </p>
      </div>
      <PixelRoomLoader />
      <div className="room-details">
        <div>
          <span className="eyebrow">THE CONCEPT</span>
          <h2>
            Where the pixels
            <br />
            feel at home.
          </h2>
        </div>
        <p>
          An original miniature studio, made from simple geometric shapes. A
          desk for the next big idea. A sofa for the pause in between. All in
          black, white, and the shades that connect them.
        </p>
        <span className="room-experiment-label">
          STUDIO EXPERIMENT
          <br />
          MONOCHROME / INTERACTIVE / 001
        </span>
      </div>
    </main>
  );
}
