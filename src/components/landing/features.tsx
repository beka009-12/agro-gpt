import ru from "@/src/i18n/ru.json"
import { FeatureIcon, type FeatureIconId } from "./feature-icons"
import { SectionReveal } from "./section-reveal"

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 md:pb-32">
      <SectionReveal>
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          {ru.features.figLabel}
          <span aria-hidden className="h-px flex-1 bg-edge" />
        </p>
        <h2 className="mt-4 border-b-2 border-fg pb-5 font-display text-3xl font-semibold text-fg md:text-5xl">
          {ru.features.title}
        </h2>
      </SectionReveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ru.features.items.map((item, i) => (
          <SectionReveal key={item.title} delay={i * 0.08} className="h-full">
            <article className="group h-full rounded-xl border border-edge bg-bg-elevated p-6 transition-colors hover:border-accent/40">
              <span className="inline-flex size-12 items-center justify-center rounded-full border border-edge bg-bg text-accent transition-colors group-hover:border-accent/40">
                <FeatureIcon id={item.id as FeatureIconId} className="size-6" />
              </span>
              <h3 className="mt-5 font-medium text-fg">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {item.description}
              </p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
