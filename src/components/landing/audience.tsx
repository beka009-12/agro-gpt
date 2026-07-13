import { getDict } from "@/src/i18n/server"
import { AudienceIcon, type AudienceIconId } from "@/src/components/ui/icons"
import { SectionReveal } from "./section-reveal"
import { SectionHeading } from "./section-heading"

export async function Audience() {
  const ru = await getDict()
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <SectionReveal>
        <SectionHeading eyebrow={ru.audience.eyebrow} title={ru.audience.title} />
      </SectionReveal>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {ru.audience.items.map((item, i) => (
          <SectionReveal
            key={i}
            delay={i * 0.08}
            className="w-[260px] flex-none snap-start md:w-auto"
          >
            <article className="h-full rounded-[26px] border border-edge bg-card p-6 transition-[transform,box-shadow] duration-200 hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(6,78,59,0.07)] motion-reduce:transform-none md:p-7">
              <span
                aria-hidden
                className="grid size-[52px] place-items-center rounded-[17px] bg-mint-soft text-accent"
              >
                <AudienceIcon id={item.icon as AudienceIconId} size={25} strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-xl font-extrabold tracking-tight text-fg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {item.description}
              </p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
