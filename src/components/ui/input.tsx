import type { InputHTMLAttributes, Ref } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  warning?: string
  ref?: Ref<HTMLInputElement>
}

export function Input({
  label,
  error,
  hint,
  warning,
  id,
  className = "",
  ref,
  ...rest
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-fg"
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`rounded-xl border bg-card px-4 py-3 text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/25 ${
          error ? "border-danger/60" : "border-edge"
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : warning ? (
        <p className="text-xs text-amber-700">{warning}</p>
      ) : hint ? (
        <p className="text-xs text-fg-muted">{hint}</p>
      ) : null}
    </div>
  )
}
