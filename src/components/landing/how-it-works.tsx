import ru from "@/src/i18n/ru.json";
import { LandingIcon, type LandingIconId } from "@/src/components/ui/icons";
import { SectionReveal } from "./section-reveal";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:py-20"
    >
      <SectionReveal>
        <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[34px]">
          {ru.howItWorks.title}
        </h2>
      </SectionReveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {ru.howItWorks.steps.map((step, i) => (
          <SectionReveal key={i} delay={i * 0.12} className="h-full">
            <article className="h-full rounded-2xl border border-edge bg-bg p-7 transition-all duration-300 hover:-translate-y-[3px] hover:border-[#cfe3d6] hover:shadow-[0_14px_32px_rgba(45,106,79,0.12)] motion-reduce:transform-none">
              <span
                aria-hidden
                className="flex size-12 items-center justify-center rounded-xl bg-mint-soft text-accent"
              >
                <LandingIcon id={step.icon as LandingIconId} />
              </span>
              <p className="mt-4 text-xs font-medium tracking-[0.1em] uppercase text-mint">
                {ru.howItWorks.stepLabel} {i + 1}
              </p>
              <h3 className="mt-1.5 text-lg font-bold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {step.description}
              </p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
