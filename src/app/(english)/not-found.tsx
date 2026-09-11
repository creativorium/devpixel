import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="section inner-page">
      <p className="eyebrow">PIXEL NOT FOUND</p>
      <h1 className="pixel-text">404.</h1>
      <p>This little piece of the internet doesn’t exist.</p>
      <Link href="/" className="button dark">
        Back to home ↗
      </Link>
    </main>
  );
}
