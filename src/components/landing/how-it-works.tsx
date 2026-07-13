import { getDict } from "@/src/i18n/server"
import { SectionReveal } from "./section-reveal"
import { SectionHeading } from "./section-heading"

export async function HowItWorks() {
  const ru = await getDict()
  const steps = ru.howItWorks.steps
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:py-20"
    >
      <SectionReveal>
        <SectionHeading eyebrow={ru.howItWorks.eyebrow} title={ru.howItWorks.title} />
      </SectionReveal>

      {/* десктоп: карточки со стрелками */}
      <div className="hidden gap-[18px] md:grid md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <SectionReveal key={i} delay={i * 0.1} className="h-full">
            <article className="relative h-full rounded-[25px] border border-edge bg-card p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(6,78,59,0.07)] motion-reduce:transform-none">
              <span className="grid size-11 place-items-center rounded-[14px] bg-mint-soft text-[15px] font-extrabold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-7 text-lg font-extrabold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3.5 top-12 z-[2] hidden size-[26px] place-items-center rounded-full bg-accent text-[13px] text-white lg:grid"
                >
                  ›
                </span>
              )}
            </article>
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
                      i === 0
                        ? "bg-[linear-gradient(145deg,#16a34a,#15803d)] text-white"
                        : "bg-mint-soft text-accent"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden
                      className="my-1.5 w-0.5 flex-1 bg-[linear-gradient(180deg,#b7e3c0,#dcebdc)]"
                    />
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
    </section>
  )
}
