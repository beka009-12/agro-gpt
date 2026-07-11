import ru from "@/src/i18n/ru.json"
import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function Activities() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <SectionReveal>
        <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[32px]">
          {ru.about.activities.title}
        </h2>
      </SectionReveal>
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ru.about.activities.items.map((item, i) => (
          <SectionReveal key={i} delay={i * 0.08} className="h-full">
            <article className="h-full rounded-2xl border border-edge bg-bg p-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-[#cfe3d6] hover:shadow-[0_14px_32px_rgba(45,106,79,0.12)] motion-reduce:transform-none">
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-xl bg-mint-soft text-accent"
              >
                <AboutIcon id={item.icon as AboutIconId} size={21} />
              </span>
              <h3 className="mt-3.5 font-bold text-fg">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                {item.description}
              </p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
