const CardSkeleton = () => (
    <div className="bg-cream rounded-3xl border border-black/10 overflow-hidden">
    <div className="skeleton h-48" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-4 rounded w-3/4" />
      <div className="skeleton h-3 rounded w-full" />
      <div className="flex justify-between items-center pt-2">
        <div className="skeleton h-6 rounded w-20" />
        <div className="skeleton h-9 rounded-full w-24" />
      </div>
    </div>
  </div>
);

export default function Loading() {
  return (
    <div>
      <div className="flex gap-2 mb-7">
        {[80, 110, 95, 100].map((w, i) => (
          <div key={i} className="skeleton h-10 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
