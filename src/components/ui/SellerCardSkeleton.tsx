export function SellerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-surface-100 dark:border-surface-700 animate-pulse">
      <div className="w-full h-28 bg-surface-200 dark:bg-surface-700" />
      <div className="p-2.5 space-y-2">
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
        <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
        <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
}