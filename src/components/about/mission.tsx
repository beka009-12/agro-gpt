import { getDict } from "@/src/i18n/server"
import { SECTION_PADDING } from "@/src/components/landing/section-layout"
import { PlantIcon } from "@/src/components/ui/icons"

export async function Mission() {
  const ru = await getDict()

  return (
    <section className={`bg-white ${SECTION_PADDING}`}>
      <div className="bg-brand-gradient mx-auto max-w-7xl rounded-card px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <PlantIcon size={24} className="text-lime" />
        <h2 className="mt-4 text-sm font-semibold text-white/70">
          {ru.about.mission.title}
        </h2>
        <p className="mt-3 max-w-[1050px] font-display text-[20px] font-semibold leading-[1.32] tracking-[-0.01em] sm:text-[28px] sm:leading-[1.25] sm:tracking-[-0.025em] lg:text-[40px] lg:leading-[1.2]">
          {ru.about.mission.text}
        </p>
      </div>
    </section>
  )
}
