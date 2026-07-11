import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function Mission() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <SectionReveal>
        <div className="rounded-2xl bg-fg p-8 text-center md:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-mint">
            {ru.about.mission.overline}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-lg font-medium leading-relaxed text-bg md:text-[19px]">
            {ru.about.mission.text}
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-[14.5px] leading-relaxed text-bg/70">
            {ru.about.mission.note}
          </p>
        </div>
      </SectionReveal>
    </section>
  )
}
