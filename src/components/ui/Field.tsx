export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label:     string
  required?: boolean
  error?:    string
  hint?:     string
  children:  React.ReactNode
}) {
  return (
    <div>
      <label className="label-base">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="ml-1.5 text-xs font-normal text-surface-400">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}