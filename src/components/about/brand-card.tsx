import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"
import { LeafIcon } from "@/src/components/ui/icons"

export function BrandCard() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <SectionReveal>
        <div className="grid items-center gap-8 rounded-2xl bg-section-alt p-8 md:grid-cols-[0.9fr_1.1fr] md:p-11">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-mint">
              {ru.about.brand.overline}
            </p>
            <h2 className="mt-2.5 text-3xl font-bold tracking-tight text-fg">
              {ru.about.brand.name}
            </h2>
            <p className="mt-3.5 text-[15px] leading-relaxed text-fg-muted">
              {ru.about.brand.description}
            </p>
          </div>
          <div
            aria-hidden
            className="flex h-[220px] items-center justify-center rounded-[14px] bg-mint-soft"
          >
            <LeafIcon size={64} className="text-mint" />
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
