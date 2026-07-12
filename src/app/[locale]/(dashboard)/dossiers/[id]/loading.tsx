export default function DossierDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between">
        <div className="h-10 bg-gray-100 rounded-xl w-40"></div>
        <div className="h-10 bg-gray-100 rounded-xl w-48"></div>
      </div>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-100 rounded-full w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-80"></div>
            <div className="h-4 bg-gray-100 rounded w-48"></div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-3 bg-gray-100 rounded w-32 ml-auto"></div>
            <div className="h-3 bg-gray-100 rounded w-24 ml-auto"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 pt-4">
          <div className="col-span-2 space-y-4">
            <div className="h-4 bg-gray-100 rounded w-48"></div>
            <div className="h-24 bg-gray-50 rounded-2xl"></div>
          </div>
          <div className="h-40 bg-gray-50 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}