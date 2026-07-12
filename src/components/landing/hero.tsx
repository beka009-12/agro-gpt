import Link from "next/link"
import type { ReactElement } from "react"
import { getDict } from "@/src/i18n/server"
import {
  CheckIcon,
  GlobeIcon,
  SparkleIcon,
  type IconProps,
} from "@/src/components/ui/icons"

type TrustIconId = "check" | "sparkle" | "globe"

const TRUST_ICONS: Record<TrustIconId, (props: IconProps) => ReactElement> = {
  check: CheckIcon,
  sparkle: SparkleIcon,
  globe: GlobeIcon,
}

export async function Hero() {
  const ru = await getDict()
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-28 md:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-2 text-[13px] font-semibold text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {ru.hero.badge}
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight text-balance text-fg md:text-[50px]">
          {ru.hero.title}
        </h1>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-fg-muted">
          {ru.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/chat"
            className="rounded-full bg-accent px-6 py-3 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(45,106,79,0.25)] transition-colors hover:bg-accent-strong sm:px-7 sm:py-3.5"
          >
            {ru.header.startChat}
          </Link>
          <a
            href="#how-it-works"
            className="px-1 py-4 text-sm font-semibold text-fg transition-colors hover:text-accent"
          >
            {ru.hero.ctaSecondary} ↓
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap items-center gap-3 border-t border-edge pt-7">
          {ru.hero.trust.map((item, i) => {
            const Icon = TRUST_ICONS[item.icon as TrustIconId]
            return (
              <li
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-4 py-2 text-[13px] font-semibold text-accent"
              >
                <Icon size={15} />
                {item.text}
              </li>
            )
          })}
        </ul>
      </div>
      <div
        aria-hidden
        className="overflow-hidden rounded-2xl border border-edge bg-card shadow-[0_20px_50px_rgba(45,106,79,0.14)]"
      >
        <div className="flex items-center gap-1.5 border-b border-edge px-4 py-3">
          <span className="size-2.5 rounded-full bg-edge" />
          <span className="size-2.5 rounded-full bg-edge" />
          <span className="size-2.5 rounded-full bg-edge" />
        </div>
        <div className="flex flex-col gap-3.5 bg-bg p-5">
          <p className="max-w-[78%] self-start rounded-[16px_16px_16px_4px] bg-mint-soft px-4 py-3 text-sm leading-normal text-fg">
            {ru.hero.mockup[0]}
          </p>
          <p className="max-w-[78%] self-end rounded-[16px_16px_4px_16px] bg-accent px-4 py-3 text-sm leading-normal text-white">
            {ru.hero.mockup[1]}
          </p>
          <p className="max-w-[84%] self-start rounded-[16px_16px_16px_4px] bg-mint-soft px-4 py-3 text-sm leading-normal text-fg">
            {ru.hero.mockup[2]}
          </p>
        </div>
      </div>
    </section>
  )
}
