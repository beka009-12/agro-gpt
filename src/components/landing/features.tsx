import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-section-alt py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[34px]">
            {ru.features.title}
          </h2>
        </SectionReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ru.features.items.map((item, i) => (
            <SectionReveal key={item.title} delay={i * 0.08} className="h-full">
              <article className="h-full rounded-2xl bg-card p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
                <span className="text-[26px]" aria-hidden>
                  {item.emoji}
                </span>
                <h3 className="mt-3.5 font-bold text-fg">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  {item.description}
                </p>
              </article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
