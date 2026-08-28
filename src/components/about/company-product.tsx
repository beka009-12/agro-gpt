import { getDict } from "@/src/i18n/server"
import {
  AboutIcon,
  LeafIcon,
  type AboutIconId,
} from "@/src/components/ui/icons"
import { VolumeLadder } from "@/src/components/about/volume-ladder"

const POINT_ICONS: AboutIconId[] = [
  "flask",
  "consult",
  "scheme",
  "globe",
  "leaf",
]

const COMPOSITION_ICONS: AboutIconId[] = ["leaf", "flask", "renew", "bloom"]

export async function CompanyProduct() {
  const ru = await getDict()

  return (
    <section className="bg-white px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <LeafIcon size={28} className="text-accent" />
          <h2 className="mt-7 font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[46px]">
            {ru.about.company.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-fg-muted">
            {ru.about.company.description}
          </p>
          <ul className="mt-10 border-t border-edge">
            {ru.about.company.points.map((point, index) => (
              <li key={point} className="flex items-center gap-4 border-b border-edge py-4">
                <AboutIcon
                  id={POINT_ICONS[index % POINT_ICONS.length]}
                  size={20}
                  className="shrink-0 text-accent"
                />
                <span className="text-[15px] font-medium leading-6 text-fg">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-brand-gradient rounded-card p-7 text-white sm:p-10 lg:col-span-7 lg:p-14">
          <h2 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[44px]">
            {ru.about.product.title}
          </h2>
          <p className="mt-5 max-w-[620px] text-base leading-8 text-white/75">
            {ru.about.product.description}
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {ru.about.product.composition.map((item, index) => (
              <li
                key={item}
                className="flex min-h-24 items-start gap-4 rounded-control border border-white/20 p-4"
              >
                <AboutIcon
                  id={COMPOSITION_ICONS[index % COMPOSITION_ICONS.length]}
                  size={20}
                  className="mt-0.5 shrink-0 text-lime"
                />
                <span className="text-sm font-medium leading-6 text-white/90">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-white/20 pt-8">
            <VolumeLadder
              title={ru.about.product.volumesTitle}
              sizes={ru.about.product.sizes}
              bulk={ru.about.product.bulk}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
