export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition">
      <div className="pixel-wipe" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 4) * 35}ms` }} />
        ))}
      </div>
      {children}
    </div>
  );
}
