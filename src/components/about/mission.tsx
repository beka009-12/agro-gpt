import { getDict } from "@/src/i18n/server"
import { PlantIcon } from "@/src/components/ui/icons"

export async function Mission() {
  const ru = await getDict()

  return (
    <section className="bg-white px-5 pb-20 md:px-8 md:pb-24">
      <div className="bg-brand-gradient mx-auto max-w-7xl rounded-card px-6 py-9 text-white sm:px-10 sm:py-12 md:px-12 md:py-14">
        <PlantIcon size={24} className="text-lime" />
        <h2 className="mt-5 text-sm font-semibold text-white/70">
          {ru.about.mission.title}
        </h2>
        <p className="mt-4 max-w-[1050px] font-display text-[22px] font-semibold leading-[1.32] tracking-[-0.01em] sm:mt-5 sm:text-[32px] sm:leading-[1.22] sm:tracking-[-0.03em] lg:text-[46px] lg:leading-[1.18]">
          {ru.about.mission.text}
        </p>
      </div>
    </section>
  )
}
