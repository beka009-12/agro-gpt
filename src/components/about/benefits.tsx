import { getDict } from "@/src/i18n/server"
import { CheckIcon } from "@/src/components/ui/icons"
import { SectionHeading } from "@/src/components/landing/section-heading"

export async function Benefits() {
  const ru = await getDict()
  const { eyebrow, title, items } = ru.about.benefits

  return (
    <section className="bg-white px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={eyebrow} title={title} />

        <div className="grid border-t border-edge md:grid-cols-2 md:gap-x-16">
          {items.map((item) => (
            <article key={item.title} className="border-b border-edge py-8 md:py-10">
              <CheckIcon size={20} weight="bold" className="text-accent" />
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.025em] text-fg">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-fg-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
