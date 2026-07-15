import { getDict } from "@/src/i18n/server"
import { SectionReveal } from "@/src/components/landing/section-reveal"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { BenefitsCarousel } from "./benefits-carousel"

export async function Benefits() {
  const ru = await getDict()
  const { eyebrow, title, tapHint, items } = ru.about.benefits

  // раскладка по колонкам: левая колонка — первая половина (01..n), правая — вторая (n+1..last),
  // но в DOM идут построчно (лево, право, лево, право…), чтобы grid-flow выстроил их в два ряда столбцов
  const half = Math.ceil(items.length / 2)
  const rows = Array.from({ length: half }, (_, row) => [
    { item: items[row], num: row + 1 },
    items[half + row] ? { item: items[half + row], num: half + row + 1 } : null,
  ]).flat()

  return (
    <section className="bg-section-alt py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <SectionHeading eyebrow={eyebrow} title={title} />
        </SectionReveal>

        {/* десктоп: 2-колоночный список с разделителями */}
        <div className="mx-auto hidden max-w-[980px] md:grid md:grid-cols-2 md:gap-x-11">
          {rows.map((entry, i) =>
            entry ? (
              <SectionReveal key={entry.num} delay={i * 0.04}>
                <div
                  className={`flex gap-4 py-[22px] ${
                    i < rows.length - 2 ? "border-b border-edge" : ""
                  }`}
                >
                  <span
                    className={`grid size-10 flex-none place-items-center rounded-xl text-[13px] font-extrabold ${
                      entry.num <= half
                        ? "bg-mint-soft text-accent-strong"
                        : "bg-tan-soft text-tan-strong"
                    }`}
                  >
                    {String(entry.num).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="text-base font-extrabold text-fg">
                      {entry.item.title}
                    </div>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-muted">
                      {entry.item.description}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            ) : (
              <div key="empty" aria-hidden />
            )
          )}
        </div>

        {/* мобайл: авто-карусель */}
        <div className="md:hidden">
          <BenefitsCarousel
            items={items.map(({ title: t, description }) => ({
              title: t,
              description,
            }))}
            tapHint={tapHint}
          />
        </div>
      </div>
    </section>
  )
}
