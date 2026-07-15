import { getDict } from "@/src/i18n/server"
import { AboutIcon, LeafIcon, type AboutIconId } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"
import { VolumeLadder } from "@/src/components/about/volume-ladder"

const POINT_ICONS: AboutIconId[] = ["flask", "consult", "scheme", "globe", "leaf"]
const COMPOSITION_ICONS: AboutIconId[] = ["leaf", "flask", "renew", "bloom"]
const COMPOSITION_TONES = [
  "bg-mint-soft text-accent-strong",
  "bg-tan-soft text-tan-strong",
]

export async function CompanyProduct() {
  const ru = await getDict()
  return (
    <section className="bg-card px-4 pb-16">
      <div className="mx-auto grid max-w-6xl lg:grid-cols-[0.92fr_1.08fr] lg:gap-5">
        <SectionReveal className="lg:h-full">
          <div className="relative h-full overflow-hidden rounded-[28px] bg-[linear-gradient(150deg,#123625,#1f6b45)] p-7 pb-16 text-white md:p-8 md:pb-16 lg:pb-8">
            <span
              aria-hidden
              className="absolute -right-16 -top-20 size-60 rounded-full bg-[radial-gradient(circle,rgba(203,232,107,0.18),transparent_70%)]"
            />
            <LeafIcon
              aria-hidden
              size={210}
              strokeWidth={0.9}
              className="absolute -bottom-10 -right-10 text-white opacity-[0.07]"
            />
            <div className="relative">
              <h2 className="text-2xl font-extrabold tracking-tight">
                {ru.about.company.title}
              </h2>
              <p className="mt-3.5 text-[14.5px] leading-relaxed text-[#cfe6d6]">
                {ru.about.company.description}
              </p>
              <ul className="mt-6 divide-y divide-white/10">
                {ru.about.company.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      aria-hidden
                      className="grid size-10 flex-none place-items-center rounded-xl bg-white/10 text-lime"
                    >
                      <AboutIcon
                        id={POINT_ICONS[i % POINT_ICONS.length]}
                        size={19}
                        strokeWidth={1.8}
                      />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-[#e7f3ea]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionReveal>
        {/* на мобиле карточка продукта наезжает на тёмную — слоёная стопка вместо двух кирпичей */}
        <SectionReveal delay={0.1} className="relative -mt-9 lg:mt-0 lg:h-full">
          <div className="h-full rounded-[28px] border border-edge bg-bg p-6 shadow-[0_24px_48px_rgba(20,42,31,0.12)] md:p-8 lg:shadow-none">
            <h2 className="text-2xl font-extrabold tracking-tight text-fg">
              {ru.about.product.title}
            </h2>
            <p className="mt-3.5 text-[14.5px] leading-relaxed text-fg-muted">
              {ru.about.product.description}
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2.5">
              {ru.about.product.composition.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 rounded-2xl border border-edge bg-card p-3"
                >
                  <span
                    aria-hidden
                    className={`grid size-9 flex-none place-items-center rounded-[10px] ${COMPOSITION_TONES[i % COMPOSITION_TONES.length]}`}
                  >
                    <AboutIcon
                      id={COMPOSITION_ICONS[i % COMPOSITION_ICONS.length]}
                      size={17}
                      strokeWidth={1.8}
                    />
                  </span>
                  <span className="min-w-0 text-[12.5px] font-bold leading-tight text-fg">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-edge pt-5">
              <VolumeLadder
                title={ru.about.product.volumesTitle}
                sizes={ru.about.product.sizes}
                bulk={ru.about.product.bulk}
              />
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
