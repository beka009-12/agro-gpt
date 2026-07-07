import type { Ref, SelectHTMLAttributes } from "react"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: ReadonlyArray<SelectOption>
  error?: string
  ref?: Ref<HTMLSelectElement>
}

export function Select({
  label,
  options,
  error,
  id,
  className = "",
  ref,
  ...rest
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-fg-muted">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`appearance-none rounded-lg border bg-bg px-3.5 py-2.5 text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30 ${
          error ? "border-red-400/60" : "border-edge"
        } ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
