// Shown instantly while a workspace page loads, so navigation feels immediate.
export default function Loading() {
  return (
    <div className="ws-page" aria-busy="true" aria-label="Loading">
      <div className="ws-skeleton title" />
      <div className="ws-skeleton line" />
      <div className="ws-skeleton-grid">
        <div className="ws-skeleton block" />
        <div className="ws-skeleton block" />
        <div className="ws-skeleton block" />
        <div className="ws-skeleton block" />
      </div>
    </div>
  );
}
