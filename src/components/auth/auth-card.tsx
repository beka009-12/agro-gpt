import Link from "next/link"
import type { ReactNode } from "react"
import { SectionReveal } from "@/src/components/landing/section-reveal"
import { LogoMark } from "@/src/components/layout/logo"

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
          className="mb-6 flex items-center justify-center gap-2.5"
        >
          <LogoMark size={30} />
          <span className="text-[19px] font-bold tracking-tight text-fg">
            ibo
          </span>
        </Link>
        <div className="rounded-2xl border border-edge bg-card p-6 shadow-[0_4px_20px_rgba(45,106,79,0.08)] sm:p-8">
          <h1 className="text-2xl font-bold text-fg sm:text-3xl">{title}</h1>
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
