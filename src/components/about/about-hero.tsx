import Image from "next/image"
import { getDict } from "@/src/i18n/server"
import { RevealGroup, RevealItem } from "@/src/components/landing/reveal"

export async function AboutHero() {
  const ru = await getDict()

  return (
    <section className="bg-white">
      <RevealGroup
        trigger="load"
        className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-[1fr_0.9fr] md:gap-8 md:px-8 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16"
      >
        <div className="min-w-0 max-w-[720px]">
          <RevealItem>
            <p className="mb-4 text-sm font-semibold text-accent">{ru.about.badge}</p>
          </RevealItem>
          <RevealItem>
          <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.04em] text-fg sm:text-[42px] md:text-[38px] lg:text-[56px]">
            {ru.about.titleStart}
            <span className="text-accent">
              {ru.about.titleAccent}
            </span>
          </h1>
          </RevealItem>
          <RevealItem>
            <p className="mt-5 max-w-[640px] text-base leading-[1.65] text-fg-muted sm:text-lg md:text-base lg:text-lg">
              {ru.about.subtitle}
            </p>
          </RevealItem>
        </div>

        <RevealItem as="div" className="min-w-0">
        <figure className="overflow-hidden rounded-card border border-edge bg-white shadow-[0_24px_70px_rgba(13,59,41,0.12)]">
          <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
            <Image
              src="/images/about-greenhouse.webp"
              alt={ru.about.bottle.note}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="flex flex-col gap-2 px-5 py-4 sm:px-6 md:flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-6">
            <div>
              <p className="text-sm text-fg-muted">{ru.about.bottle.overline}</p>
              <p className="mt-0.5 font-display text-xl font-semibold text-fg">
                {ru.about.bottle.name}
              </p>
            </div>
            <p className="max-w-[320px] text-sm leading-6 text-fg-muted lg:max-w-[220px] lg:text-right">
              {ru.about.bottle.note}
            </p>
          </figcaption>
        </figure>
        </RevealItem>
      </RevealGroup>

      <div className="border-y border-edge">
        <ul className="mx-auto grid max-w-7xl sm:grid-cols-3">
          {ru.about.stats.map((stat) => (
            <li
              key={stat}
              className="flex min-h-12 items-center justify-center border-b border-edge px-5 py-3 sm:min-h-14 text-center text-sm font-medium text-fg-muted transition-colors duration-200 last:border-b-0 hover:bg-accent-soft hover:text-accent-strong sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0"
            >
              {stat}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
