import Link from "next/link";
import { PixelMark } from "./brand";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <p className="eyebrow">HAVE SOMETHING IN MIND?</p>
          <Link className="footer-cta" href="/contact">
            Let’s make
            <br />a little impact. <span>↗</span>
          </Link>
        </div>
        <PixelMark className="footer-mark" />
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} DevnPixel</span>
        <span>INDEPENDENT MINDS. INTENTIONAL PIXELS.</span>
        <Link href="/services">Our services ↗</Link>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
