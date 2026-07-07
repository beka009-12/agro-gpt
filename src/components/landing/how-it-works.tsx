import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24"
    >
      <SectionReveal>
        <h2 className="text-center font-display text-3xl font-bold text-fg md:text-4xl">
          {ru.howItWorks.title}
        </h2>
      </SectionReveal>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {ru.howItWorks.steps.map((step, i) => (
          <SectionReveal key={step.title} delay={i * 0.12}>
            <div className="text-center">
              <span className="font-display text-5xl font-bold text-accent [text-shadow:0_0_20px_rgba(74,222,128,0.4)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-semibold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{step.description}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
