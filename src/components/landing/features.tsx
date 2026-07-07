import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <SectionReveal>
        <h2 className="text-center font-display text-3xl font-bold text-fg md:text-4xl">
          {ru.features.title}
        </h2>
      </SectionReveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ru.features.items.map((item, i) => (
          <SectionReveal key={item.title} delay={i * 0.08} className="h-full">
            <article className="h-full rounded-2xl border border-edge bg-bg-elevated p-6 transition-shadow hover:shadow-[0_0_24px_rgba(74,222,128,0.15)]">
              <span className="text-3xl" aria-hidden="true">
                {item.icon}
              </span>
              <h3 className="mt-4 font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{item.description}</p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
