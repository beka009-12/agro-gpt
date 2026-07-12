import { getDict } from "@/src/i18n/server"
import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export async function Product() {
  const ru = await getDict()
  return (
    <section className="bg-section-alt py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[32px]">
            {ru.about.product.title}
          </h2>
          <p className="mt-2 text-center text-[15px] font-medium text-accent">
            {ru.about.product.subtitle}
          </p>
        </SectionReveal>
        <SectionReveal delay={0.08}>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ru.about.product.composition.map((item, i) => (
              <li
                key={i}
                className="rounded-xl bg-card p-4 text-center text-sm font-medium text-fg"
              >
                {item}
              </li>
            ))}
          </ul>
        </SectionReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ru.about.product.benefits.map((item, i) => (
            <SectionReveal key={i} delay={i * 0.06} className="h-full">
              <article className="h-full rounded-2xl border border-edge/60 bg-card p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] transition-all duration-300 hover:-translate-y-[3px] hover:border-[#cfe3d6] hover:shadow-[0_16px_34px_rgba(45,106,79,0.13)] motion-reduce:transform-none">
                <span
                  aria-hidden
                  className="flex size-[38px] items-center justify-center rounded-[10px] bg-mint-soft text-accent"
                >
                  <AboutIcon id={item.icon as AboutIconId} size={19} />
                </span>
                <h3 className="mt-3 text-[14.5px] font-bold text-fg">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  {item.description}
                </p>
              </article>
            </SectionReveal>
          ))}
        </div>
        <p className="mt-10 text-center text-[14.5px] font-medium text-fg-muted">
          {ru.about.product.cultures}
        </p>
      </div>
    </section>
  )
}
