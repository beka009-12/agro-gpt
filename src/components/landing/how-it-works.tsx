import { getDict } from "@/src/i18n/server"
import { ChevronRightIcon } from "@/src/components/ui/icons"
import { SectionHeading } from "./section-heading"

export async function HowItWorks() {
  const ru = await getDict()

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={ru.howItWorks.title} />

        <div className="grid gap-10 border-t border-edge pt-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:pt-12">
          {ru.howItWorks.steps.map((step, index) => (
            <article
              key={step.title}
              className="relative lg:border-r lg:border-edge lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <ChevronRightIcon
                aria-hidden
                size={20}
                className={index === ru.howItWorks.steps.length - 1 ? "text-accent" : "text-fg-faint"}
              />
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
