import { getDict } from "@/src/i18n/server"
import { SectionHeading } from "./section-heading"

export async function HowItWorks() {
  const ru = await getDict()
  const steps = ru.howItWorks.steps

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={ru.howItWorks.title} />

        {/* мобилка: вертикальный таймлайн */}
        <ol className="border-t border-edge pt-10 md:hidden">
          {steps.map((step, index) => (
            <li key={step.title} className="relative pb-10 pl-14 last:pb-0">
              {index !== steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-10 bottom-0 w-px bg-edge"
                />
              )}
              <span
                aria-hidden
                className="absolute left-0 top-0 grid size-10 place-items-center rounded-full bg-accent-soft font-display text-sm font-semibold text-accent-strong"
              >
                {index + 1}
              </span>
              <h3 className="pt-1.5 font-display text-xl font-semibold tracking-[-0.02em] text-fg">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-fg-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        {/* планшет/десктоп: колонки */}
        <div className="hidden border-t border-edge pt-10 md:grid md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-0 lg:pt-12">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group relative transition-transform duration-200 lg:border-r lg:border-edge lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0 lg:hover:-translate-y-1"
            >
              <span
                aria-hidden
                className="grid size-11 place-items-center rounded-control bg-accent-soft font-display text-base font-semibold text-accent-strong transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-7 font-display text-xl font-semibold tracking-[-0.02em] text-fg">
                {step.title}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-fg-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
