/** Shimmer placeholder shared by route loading and client-side waits. */
export default function PageSkeleton({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="workspace-page" role="status" aria-label={label}>
      <span className="sr-only">{label}…</span>
      <div className="mb-7 space-y-3">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-9 w-full max-w-md" />
        <div className="skeleton h-4 w-full max-w-xl" />
      </div>
      <div className="panel panel-pad space-y-3">
        <div className="skeleton h-11 w-full" />
        <div className="skeleton h-10 w-2/3" />
      </div>
      <div className="panel mt-6 space-y-4 p-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
