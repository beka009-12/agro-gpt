import { getDict } from "@/src/i18n/server"
import { CameraIcon, CheckIcon, ShieldCheckIcon } from "@/src/components/ui/icons"
import { SectionReveal } from "./section-reveal"
import { SectionHeading } from "./section-heading"

export async function Features() {
  const ru = await getDict()
  const [photoCard, safetyCard] = ru.features.cards
  return (
    <section
      id="features"
      className="scroll-mt-24 bg-[linear-gradient(180deg,#f4fbf4,#edf8ef)] py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <SectionHeading eyebrow={ru.features.eyebrow} title={ru.features.title} />
        </SectionReveal>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionReveal className="h-full">
            <div className="relative h-full overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#063e2d,#086144)] p-7 text-white md:p-9">
              <div
                aria-hidden
                className="absolute -right-24 -top-32 size-[350px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.35),transparent_65%)]"
              />
              <h3 className="relative z-[2] max-w-[420px] text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
                {ru.features.panel.title}
              </h3>
              <p className="relative z-[2] mt-3.5 max-w-[500px] text-[15px] leading-relaxed text-[#c8ead7]">
                {ru.features.panel.description}
              </p>
              <ul className="relative z-[2] mt-6 grid gap-3">
                {ru.features.panel.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-[15px] border border-white/10 bg-white/[0.09] px-3.5 py-3"
                  >
                    <span
                      aria-hidden
                      className="grid size-6 flex-none place-items-center rounded-full bg-[rgba(200,255,109,0.17)] text-[#d7ff8d]"
                    >
                      <CheckIcon size={12} strokeWidth={3} />
                    </span>
                    <span className="text-sm leading-normal text-[#e7f7ee]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
            <SectionReveal delay={0.08} className="h-full">
              <article className="h-full rounded-[25px] border border-edge bg-card p-6">
                <span
                  aria-hidden
                  className="grid size-11 place-items-center rounded-[14px] bg-mint-soft text-accent"
                >
                  <CameraIcon size={22} strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-fg">
                  {photoCard.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                  {photoCard.description}
                </p>
              </article>
            </SectionReveal>
            <SectionReveal delay={0.16} className="h-full">
              <article className="h-full rounded-[25px] border border-edge bg-[#effaf1] p-6">
                <span
                  aria-hidden
                  className="grid size-11 place-items-center rounded-[14px] bg-card text-accent"
                >
                  <ShieldCheckIcon size={22} strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-fg">
                  {safetyCard.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                  {safetyCard.description}
                </p>
              </article>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
