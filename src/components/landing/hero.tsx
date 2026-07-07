import Link from "next/link"
import ru from "@/src/i18n/ru.json"
import { GrowingSprouts } from "./growing-sprouts"

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-40 pt-24 text-center md:pb-64">
      <span className="mb-6 rounded-full border border-edge bg-bg-elevated px-4 py-1.5 text-sm text-accent">
        {ru.hero.badge}
      </span>
      <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-fg md:text-6xl">
        {ru.hero.title}
      </h1>
      <p className="mt-6 max-w-xl text-base text-fg-muted md:text-lg">
        {ru.hero.subtitle}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/register"
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-bg transition-shadow hover:shadow-[0_0_24px_rgba(74,222,128,0.45)]"
        >
          {ru.hero.ctaPrimary}
        </Link>
        <a
          href="#how-it-works"
          className="rounded-xl border border-edge px-6 py-3 text-fg-muted transition-colors hover:border-accent hover:text-fg"
        >
          {ru.hero.ctaSecondary} ↓
        </a>
      </div>
      <GrowingSprouts className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-90 md:h-64 [filter:drop-shadow(0_0_8px_rgba(74,222,128,0.35))]" />
    </section>
  )
}
