export default function UserSkeleton() {
  return (
    <div className="bg-white shadow rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>

      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}
