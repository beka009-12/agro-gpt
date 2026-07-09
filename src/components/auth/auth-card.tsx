import Link from "next/link"
import type { ReactNode } from "react"
import { SectionReveal } from "@/src/components/landing/section-reveal"

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <SectionReveal className="w-full max-w-md">
        <Link
          href="/"
          aria-label="ibo — на главную"
          className="mb-6 block text-center font-display text-3xl font-bold text-fg"
        >
          ibo<span className="text-accent">●</span>
        </Link>
        <div className="rounded-2xl border border-edge bg-bg-elevated p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <p className="mt-4 text-center text-sm text-fg-muted">{footer}</p>
        )}
      </SectionReveal>
    </main>
  )
}
