export default function DossiersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-80"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-36"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
          <div className="h-10 bg-gray-100 rounded-xl w-24"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-100 rounded w-64"></div>
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-24"></div>
              <div className="h-4 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}