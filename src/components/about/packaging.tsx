import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function Packaging() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionReveal>
        <h2 className="text-center text-[28px] font-bold tracking-tight text-fg">
          {ru.about.packaging.title}
        </h2>
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
      </SectionReveal>
    </section>
  )
}
