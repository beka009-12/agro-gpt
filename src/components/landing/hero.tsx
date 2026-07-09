import Link from "next/link"
import ru from "@/src/i18n/ru.json"
import { GrowingSprouts } from "./growing-sprouts"

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-32 md:pb-24 md:pt-40 lg:grid-cols-2 lg:gap-16">
      <div>
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          <span aria-hidden className="h-px w-8 bg-accent" />
          {ru.hero.badge}
        </p>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-fg md:text-7xl">
          {ru.hero.title}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">
          {ru.hero.subtitle}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            href="/register"
            className="rounded-full bg-fg px-7 py-3.5 text-sm font-medium text-bg transition-colors hover:bg-fg-soft"
          >
            {ru.hero.ctaPrimary}
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-fg underline decoration-edge decoration-2 underline-offset-8 transition-colors hover:decoration-accent"
          >
            {ru.hero.ctaSecondary} ↓
          </a>
        </div>
      </div>
      <figure className="overflow-hidden rounded-2xl border border-edge bg-bg-elevated">
        <GrowingSprouts className="h-56 w-full text-accent md:h-72" />
        <figcaption className="flex items-center justify-between border-t border-edge px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em]">
          <span className="text-fg-muted">{ru.hero.figureCaption}</span>
          <span className="text-accent">{ru.hero.figureLabel}</span>
        </figcaption>
      </figure>
    </section>
  )
}
