export function PixelMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 0h12v8h8V0h12v12h-8v8h8v12H20v-8h-8v8H0V20h8v-8H0z" />
    </svg>
  );
}
