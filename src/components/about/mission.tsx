import { getDict } from "@/src/i18n/server"
import { PlantIcon } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export async function Mission() {
  const ru = await getDict()
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
      <SectionReveal>
        <div className="grid items-center gap-8 rounded-[34px] border border-[#cfe7d2] bg-[linear-gradient(135deg,#edf9ef,#e0f3e3)] p-8 md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-fg md:text-[33px]">
              {ru.about.mission.title}
            </h2>
            <p className="mt-3 max-w-[780px] text-[15px] leading-relaxed text-[#5d6c65]">
              {ru.about.mission.text}
            </p>
            <p className="mt-3.5 max-w-[780px] text-sm leading-relaxed text-fg-faint">
              {ru.about.mission.note}
            </p>
          </div>
          <span
            aria-hidden
            className="hidden size-[105px] place-items-center rounded-[30px] bg-[linear-gradient(145deg,#16a34a,#064e3b)] text-white shadow-[0_18px_30px_rgba(22,163,74,0.2)] md:grid"
          >
            <PlantIcon size={53} strokeWidth={1.6} />
          </span>
        </div>
      </SectionReveal>
    </section>
  )
}
