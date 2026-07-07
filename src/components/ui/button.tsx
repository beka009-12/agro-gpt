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
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-shadow hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg"
          aria-hidden
        />
      )}
      {children}
    </button>
  )
}
