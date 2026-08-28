import { getDict } from "@/src/i18n/server"
import { PlantIcon } from "@/src/components/ui/icons"

export async function Mission() {
  const ru = await getDict()

  return (
    <section className="bg-white px-5 pb-20 md:px-8 md:pb-24">
      <div className="bg-brand-gradient mx-auto max-w-7xl rounded-card px-7 py-12 text-white sm:px-10 md:px-12 md:py-14">
        <PlantIcon size={28} className="text-lime" />
        <h2 className="mt-6 text-sm font-semibold text-white/70">
          {ru.about.mission.title}
        </h2>
        <p className="mt-5 max-w-[1050px] font-display text-[30px] font-semibold leading-[1.18] tracking-[-0.03em] sm:text-[38px] lg:text-[46px]">
          {ru.about.mission.text}
        </p>
      </div>
    </section>
  )
}
