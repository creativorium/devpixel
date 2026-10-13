// Keeps the project header and tabs on screen while a view loads.
export default function Loading() {
  return (
    <div className="ws-skeleton-grid" aria-busy="true" aria-label="Loading">
      <div className="ws-skeleton block tall" />
      <div className="ws-skeleton block tall" />
      <div className="ws-skeleton block tall" />
      <div className="ws-skeleton block tall" />
    </div>
  );
}
