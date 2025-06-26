export function LoadingScreen({ isWindow = true }) {
  return (
    <div 
      style={{ height: isWindow ? '100vh': '100%' }} 
      className="h-full w-full flex items-center justify-center bg-white dark:bg-gray-900 z-50"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin shadow-lg"></div>
        {/* <span className="text-lg font-medium text-gray-700 dark:text-gray-200 animate-pulse">
          ...
        </span> */}
      </div>
    </div>
  );
}