import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: "primary" | "ghost"
}

const VARIANT_CLASSES = {
  primary:
    "bg-accent text-white hover:bg-accent-strong disabled:hover:bg-accent",
  ghost:
    "bg-transparent text-fg-muted hover:bg-mint-soft disabled:hover:bg-transparent",
} as const

export function Button({
  loading = false,
  disabled,
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden
        />
      )}
      {children}
    </button>
  )
}
