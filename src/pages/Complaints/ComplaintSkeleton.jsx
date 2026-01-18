export default function ComplaintSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded-full w-16" />
      </div>

      {/* Meta */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="h-3 bg-gray-100 rounded w-28" />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded-full w-24" />
        <div className="h-3 bg-gray-100 rounded w-10" />
      </div>
    </div>
  );
}
