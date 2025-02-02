const DashboardSkeleton = () => (
  <div className="animate-pulse bg-gray-900 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-10 bg-gray-800 rounded w-64 mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-800 rounded-xl"></div>
        <div className="h-96 bg-gray-800 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-800 rounded-xl"></div>
        <div className="h-64 bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  </div>
);
export default DashboardSkeleton;
