import { getDict } from "@/src/i18n/server"
import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { BenefitsCarousel } from "./benefits-carousel"

export async function Benefits() {
  const ru = await getDict()
  const { eyebrow, title, tapHint, items } = ru.about.benefits
  return (
    <section className="bg-[linear-gradient(180deg,#f4fbf4,#edf8ef)] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <SectionHeading eyebrow={eyebrow} title={title} />
        </SectionReveal>

        {/* десктоп: сетка */}
        <div className="hidden gap-[18px] md:grid md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <SectionReveal key={i} delay={i * 0.05} className="h-full">
              <article className="h-full rounded-[23px] border border-edge bg-card p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,78,59,0.07)] motion-reduce:transform-none">
                <span
                  aria-hidden
                  className="grid size-[46px] place-items-center rounded-[15px] bg-mint-soft text-accent"
                >
                  <AboutIcon id={item.icon as AboutIconId} size={22} strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-fg">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  {item.description}
                </p>
              </article>
            </SectionReveal>
          ))}
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
