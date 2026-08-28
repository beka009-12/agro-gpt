import Image from "next/image"
import { getDict } from "@/src/i18n/server"

export async function AboutHero() {
  const ru = await getDict()

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:px-8 md:py-20 lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="min-w-0 max-w-[720px]">
          <p className="mb-6 text-sm font-semibold text-accent">{ru.about.badge}</p>
          <h1 className="font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.05em] text-fg sm:text-[54px] lg:text-[58px]">
            {ru.about.titleStart}
            <span className="text-accent">
              {ru.about.titleAccent}
            </span>
          </h1>
          <p className="mt-7 max-w-[640px] text-lg leading-[1.65] text-fg-muted">
            {ru.about.subtitle}
          </p>
        </div>

        <figure className="min-w-0 overflow-hidden rounded-card border border-edge bg-white shadow-[0_24px_70px_rgba(13,59,41,0.12)]">
          <div className="relative aspect-[4/5] overflow-hidden lg:aspect-[4/3]">
            <Image
              src="/images/about-greenhouse.webp"
              alt={ru.about.bottle.note}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="flex items-end justify-between gap-6 px-6 py-5">
            <div>
              <p className="text-sm text-fg-muted">{ru.about.bottle.overline}</p>
              <p className="mt-1 font-display text-xl font-semibold text-fg">
                {ru.about.bottle.name}
              </p>
            </div>
            <p className="max-w-[220px] text-right text-sm leading-6 text-fg-muted">
              {ru.about.bottle.note}
            </p>
          </figcaption>
        </figure>
      </div>

      <div className="border-y border-edge">
        <ul className="mx-auto grid max-w-7xl px-5 sm:grid-cols-3 md:px-8">
          {ru.about.stats.map((stat) => (
            <li
              key={stat}
              className="flex min-h-16 items-center justify-center border-b border-edge py-5 text-center text-sm font-medium text-fg-muted last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0"
            >
              {stat}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
