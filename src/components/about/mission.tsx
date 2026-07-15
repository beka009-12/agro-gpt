import { getDict } from "@/src/i18n/server"
import { PlantIcon } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export async function Mission() {
  const ru = await getDict()
  return (
    <section className="bg-card px-4 py-14 md:py-16">
      <SectionReveal className="mx-auto block max-w-6xl">
        <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(170deg,#123625,#1a5c3c)] px-6 py-12 text-center md:rounded-[32px] md:px-10 md:py-20">
          {/* горизонт поля на рассвете — свет поднимается из-за кромки */}
          <span
            aria-hidden
            className="absolute left-1/2 top-full h-[480px] w-[150%] min-w-[620px] -translate-x-1/2 -translate-y-[64px] rounded-[100%] border-t border-lime/30 bg-[radial-gradient(ellipse_at_top,rgba(203,232,107,0.16),transparent_55%)] md:-translate-y-[92px]"
          />
          <div className="relative">
            <span
              aria-hidden
              className="mx-auto grid size-12 place-items-center rounded-full bg-lime text-deep"
            >
              <PlantIcon size={22} strokeWidth={1.8} />
            </span>
            <h2 className="mt-5 text-[12px] font-extrabold uppercase tracking-[0.22em] text-lime">
              {ru.about.mission.title}
            </h2>
            <p className="mx-auto mt-4 max-w-[860px] text-balance text-[19px] font-bold leading-snug tracking-tight text-white sm:text-[22px] md:text-[28px] md:leading-[1.4]">
              {ru.about.mission.text}
            </p>
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
