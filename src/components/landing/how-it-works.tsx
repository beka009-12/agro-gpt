import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 md:py-28"
    >
      <SectionReveal>
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
          {ru.howItWorks.figLabel}
          <span aria-hidden className="h-px flex-1 bg-edge" />
        </p>
        <h2 className="mt-4 border-b-2 border-fg pb-5 font-display text-3xl font-semibold text-fg md:text-5xl">
          {ru.howItWorks.title}
        </h2>
      </SectionReveal>
      <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
        {ru.howItWorks.steps.map((step, i) => (
          <SectionReveal key={step.title} delay={i * 0.12}>
            <div className="border-t border-edge pt-5">
              <span className="font-mono text-sm font-medium text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-fg">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {step.description}
              </p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
