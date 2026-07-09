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
        className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg-muted"
      >
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`rounded-lg border bg-bg px-3.5 py-2.5 text-fg outline-none transition-colors placeholder:text-fg-muted/50 focus:border-accent focus:ring-2 focus:ring-accent/25 ${
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
