import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function AboutHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-28 text-center md:pt-36">
      <SectionReveal>
        <p className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-2 text-[13px] font-semibold text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {ru.about.badge}
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-bold leading-[1.2] tracking-tight text-fg md:text-[42px]">
          {ru.about.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-fg-muted">
          {ru.about.subtitle}
        </p>
      </SectionReveal>
    </section>
  )
}
