const STATUS_STEP: Record<string, number> = {
  menunggu: 1,
  diterima: 2,
  dimasak:  3,
  siap:     4,
}

const STEPS = ['Menunggu', 'Diterima', 'Dimasak', 'Siap']

export function OrderTracker({ status }: { status: string }) {
  const step = STATUS_STEP[status] ?? 1

  return (
    <div className="flex items-center gap-1 mt-3">
      {STEPS.map((label, i) => {
        const idx    = i + 1
        const done   = idx < step
        const active = idx === step

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done   ? 'bg-primary-500 text-white' :
                active ? 'bg-primary-500 text-white ring-2 ring-primary-300' :
                         'bg-surface-200 dark:bg-surface-700 text-surface-400'
              }`}>
                {done ? '✓' : idx}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${
                active ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'
              }`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 rounded transition-all ${
                done ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}