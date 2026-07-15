import { getDict } from "@/src/i18n/server"
import { SectionReveal } from "./section-reveal"
import { SectionHeading } from "./section-heading"

export async function HowItWorks() {
  const ru = await getDict()
  const steps = ru.howItWorks.steps
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-section-alt px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionReveal>
          <SectionHeading eyebrow={ru.howItWorks.eyebrow} title={ru.howItWorks.title} />
        </SectionReveal>

        {/* десктоп: горизонтальный таймлайн */}
        <div className="relative hidden md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-10 lg:grid-cols-4 lg:gap-x-0">
          <span
            aria-hidden
            className="absolute inset-x-[15%] top-[22px] hidden h-0.5 bg-edge lg:block"
          />
          {steps.map((step, i) => (
            <SectionReveal key={i} delay={i * 0.1}>
              <div className="px-4 text-center">
                <span
                  className={`relative z-[2] mx-auto grid size-11 place-items-center rounded-full text-[15px] font-extrabold ${
                    i === 0
                      ? "bg-accent text-white"
                      : "border-2 border-edge bg-card text-accent"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-[17px] font-extrabold text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">
                  {step.description}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* мобайл: вертикальный таймлайн */}
        <div className="flex flex-col md:hidden">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1
            return (
              <SectionReveal key={i} delay={i * 0.06}>
                <div className="grid grid-cols-[auto_1fr] gap-3.5">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid size-9 flex-none place-items-center rounded-xl text-[13px] font-extrabold ${
                        i === 0 ? "bg-accent text-white" : "bg-mint-soft text-accent"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {!isLast && (
                      <span aria-hidden className="my-1.5 w-0.5 flex-1 bg-edge" />
                    )}
                  </div>
                  <div className={isLast ? "" : "pb-5"}>
                    <h3 className="pt-2 text-[15px] font-extrabold text-fg">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
