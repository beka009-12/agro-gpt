"use client"

import { useState, type InputHTMLAttributes, type Ref } from "react"
import { EyeIcon, EyeOffIcon } from "@/src/components/ui/icons"

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string
  error?: string
  hint?: string
  warning?: string
  showLabel: string
  hideLabel: string
  ref?: Ref<HTMLInputElement>
}

export function PasswordInput({
  label,
  error,
  hint,
  warning,
  showLabel,
  hideLabel,
  id,
  className = "",
  ref,
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-xl border bg-card px-4 py-3 pr-11 text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/25 ${
            error ? "border-danger/60" : "border-edge"
          } ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 right-3.5 flex items-center text-fg-faint transition-colors hover:text-fg-muted"
        >
          {visible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
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
