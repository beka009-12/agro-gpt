import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function Button({
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden
        />
      )}
      {children}
    </button>
  )
}
