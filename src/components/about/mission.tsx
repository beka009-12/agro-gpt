import { getDict } from "@/src/i18n/server"
import { PlantIcon } from "@/src/components/ui/icons"

export async function Mission() {
  const ru = await getDict()

  return (
    <section className="bg-white px-5 pb-24 md:px-8 md:pb-32">
      <div className="bg-brand-gradient mx-auto max-w-7xl rounded-card px-7 py-14 text-white sm:px-10 md:px-14 md:py-20">
        <PlantIcon size={28} className="text-lime" />
        <h2 className="mt-8 text-sm font-semibold text-white/70">
          {ru.about.mission.title}
        </h2>
        <p className="mt-6 max-w-[980px] font-display text-[32px] font-semibold leading-[1.2] tracking-[-0.03em] sm:text-[42px] lg:text-[52px]">
          {ru.about.mission.text}
        </p>
      </div>
    </section>
  )
}
