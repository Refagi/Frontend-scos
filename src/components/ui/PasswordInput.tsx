import { Eye, EyeOff, Lock } from 'lucide-react'
import { Field } from './Field'

export function PwInput({
  label,
  value,
  show,
  onToggle,
  onChange,
  placeholder,
  error,
  required,
}: {
  label:        string
  value:        string
  show:         boolean
  onToggle:     () => void
  onChange:     (v: string) => void
  placeholder?: string
  error?:       string
  required?:    boolean
}) {
  return (
    <Field label={label} error={error} required={required}>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
        <input
          className={`input-base pl-9 pr-10 w-full ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  )
}