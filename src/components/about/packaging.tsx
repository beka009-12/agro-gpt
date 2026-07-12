import { getDict } from "@/src/i18n/server"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export async function Packaging() {
  const ru = await getDict()
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionReveal>
        <h2 className="text-center text-[28px] font-bold tracking-tight text-fg">
          {ru.about.packaging.title}
        </h2>
        <p className="mt-2 text-center text-sm text-fg-muted">
          {ru.about.packaging.subtitle}
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-4">
          {ru.about.packaging.sizes.map((size, i) => (
            <li
              key={i}
              className="rounded-full bg-mint-soft px-7 py-3.5 text-[15px] font-bold text-accent"
            >
              {size}
            </li>
          ))}
          <li className="rounded-full bg-accent px-7 py-3.5 text-[15px] font-bold text-white">
            {ru.about.packaging.bulk}
          </li>
        </ul>
        <p className="mt-5 text-center text-[13px] text-fg-faint">
          {ru.about.packaging.note}
        </p>
      </SectionReveal>
    </section>
  )
}
