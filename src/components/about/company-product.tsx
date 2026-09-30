import { getDict } from "@/src/i18n/server"
import {
  AboutIcon,
  type AboutIconId,
} from "@/src/components/ui/icons"
import { RevealGroup, RevealItem } from "@/src/components/landing/reveal"
import { SECTION_PADDING } from "@/src/components/landing/section-layout"
import { VolumeLadder } from "@/src/components/about/volume-ladder"

const POINT_ICONS: AboutIconId[] = [
  "flask",
  "consult",
  "scheme",
  "globe",
  "leaf",
]

const COMPOSITION_ICONS: AboutIconId[] = ["leaf", "flask", "renew", "bloom", "leaf", "flask"]

// строки состава приходят из словаря как «Название - значение»
function splitSpec(item: string): { label: string; value: string | null } {
  const index = item.indexOf(" - ")
  if (index === -1) return { label: item, value: null }
  return { label: item.slice(0, index), value: item.slice(index + 3) }
}

export async function CompanyProduct() {
  const ru = await getDict()

  return (
    <section className={`bg-white ${SECTION_PADDING}`}>
      <RevealGroup className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12 lg:gap-12">
        <RevealItem className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <h2 className="font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[36px] lg:text-[40px]">
            {ru.about.company.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-fg-muted">
            {ru.about.company.description}
          </p>
          <ul className="mt-6 border-t border-edge">
            {ru.about.company.points.map((point, index) => (
              <li key={point} className="flex items-center gap-4 border-b border-edge py-3">
                <AboutIcon
                  id={POINT_ICONS[index % POINT_ICONS.length]}
                  size={20}
                  className="shrink-0 text-accent"
                />
                <span className="text-[15px] font-medium leading-6 text-fg">{point}</span>
              </li>
            ))}
          </ul>
        </RevealItem>

        <RevealItem className="bg-brand-gradient rounded-card p-5 text-white min-[400px]:p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <h2 className="font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] min-[400px]:text-[28px] sm:text-[36px]">
            {ru.about.product.title}
          </h2>
          <p className="mt-3 max-w-[620px] text-[15px] leading-6 text-white/75 sm:mt-4 sm:text-base sm:leading-7">
            {ru.about.product.description}
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6">
            {ru.about.product.composition.map((item, index) => {
              const { label, value } = splitSpec(item)
              return (
                <li
                  key={item}
                  className="flex min-w-0 flex-col gap-2 rounded-control border border-white/20 bg-white/[0.04] p-3.5 [&:last-child:nth-child(odd)]:col-span-2"
                >
                  <AboutIcon
                    id={COMPOSITION_ICONS[index % COMPOSITION_ICONS.length]}
                    size={18}
                    className="shrink-0 text-lime"
                  />
                  {value ? (
                    <span className="font-display text-xl font-semibold leading-none text-white sm:text-2xl">
                      {value}
                    </span>
                  ) : null}
                  <span className="text-[13px] leading-snug text-white/75 sm:text-sm">
                    {label}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-[13px] leading-5 text-white/60 sm:mt-4 sm:text-sm sm:leading-6">
            {ru.about.product.registration}
          </p>

          <div className="mt-6 border-t border-white/20 pt-5">
            <h3 className="text-sm font-semibold text-white/70">
              {ru.about.product.applicationTitle}
            </h3>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {ru.about.product.application.map((step) => (
                <li
                  key={step.method}
                  className="rounded-control border border-white/20 p-3.5"
                >
                  <p className="text-sm text-white/70">{step.method}</p>
                  <p className="mt-1 break-words font-mono text-[15px] font-medium text-white sm:text-base">
                    {step.dose}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-6 text-white/75">
              {ru.about.product.applicationNote}
            </p>
          </div>

          <div className="mt-6 border-t border-white/20 pt-5">
            <VolumeLadder
              title={ru.about.product.volumesTitle}
              sizes={ru.about.product.sizes}
              bulk={ru.about.product.bulk}
            />
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  )
}
