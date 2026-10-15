/** Placeholder that mirrors the dashboard layout while weather loads. */
export default function LoadingSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]" role="status" aria-live="polite">
      <span className="sr-only">Loading weather…</span>
      <div className="space-y-6">
        <div className="panel grid gap-8 p-8 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div className="space-y-4">
            <div className="skeleton h-28 w-28 rounded-full" />
            <div className="skeleton h-20 w-48" />
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-5 w-56" />
            <div className="skeleton h-5 w-44" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-44 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="panel p-5">
              <div className="skeleton h-5 w-24" />
              <div className="skeleton mt-4 h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="panel space-y-4 p-6">
        <div className="skeleton h-6 w-24" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-36 w-[5.5rem] shrink-0" />
          ))}
        </div>
        <div className="skeleton h-6 w-28" />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
