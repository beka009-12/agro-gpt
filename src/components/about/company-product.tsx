import { getDict } from "@/src/i18n/server"
import { CheckIcon } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export async function CompanyProduct() {
  const ru = await getDict()
  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-16 lg:grid-cols-2">
      <SectionReveal className="h-full">
        <div className="h-full rounded-[28px] bg-[linear-gradient(145deg,#063e2d,#07593e)] p-7 text-white md:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {ru.about.company.title}
          </h2>
          <p className="mt-3.5 text-[14.5px] leading-relaxed text-[#c8e8d6]">
            {ru.about.company.description}
          </p>
          <ul className="mt-6 grid gap-3">
            {ru.about.company.points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="grid size-6 flex-none place-items-center rounded-lg bg-white/10 text-[#d3ff81]"
                >
                  <CheckIcon size={11} strokeWidth={3} />
                </span>
                <span className="text-sm leading-normal text-[#e0f4e9]">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SectionReveal>
      <SectionReveal delay={0.1} className="h-full">
        <div className="h-full rounded-[28px] border border-edge bg-card p-7 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-fg">
            {ru.about.product.title}
          </h2>
          <p className="mt-3.5 text-[14.5px] leading-relaxed text-fg-muted">
            {ru.about.product.description}
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ru.about.product.composition.map((item, i) => (
              <li
                key={i}
                className="rounded-[14px] border border-[#e7f0e7] bg-[#f8fbf7] px-3.5 py-3 text-[13px] font-bold text-[#355044]"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-[#e7f0e7] pt-4">
            <h3 className="text-sm font-extrabold text-fg">
              {ru.about.product.volumesTitle}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ru.about.product.sizes.map((size, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-edge bg-card px-4 py-2.5 text-[13px] font-extrabold text-deep"
                >
                  {size}
                </li>
              ))}
              <li className="rounded-xl bg-[linear-gradient(135deg,#16a34a,#15803d)] px-4 py-2.5 text-[13px] font-extrabold text-white">
                {ru.about.product.bulk}
              </li>
            </ul>
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
