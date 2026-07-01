export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-4 w-56 rounded-lg bg-gray-100 dark:bg-gray-800/60" />
        </div>
        <div className="h-10 w-64 rounded-xl bg-gray-100 dark:bg-gray-800/60" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
            <div className="mt-5 h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-3 h-7 w-16 rounded bg-gray-200 dark:bg-gray-800/80" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="col-span-12 h-72 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-6"
          />
        ))}
      </div>
    </div>
  );
}
