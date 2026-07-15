import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { ChevronRightIcon, CloudIcon } from "@/src/components/ui/icons"
import { DiagnosisCard } from "./diagnosis-card"

const TRUST_TONES = [
  "bg-tan-soft text-[#4a4633]",
  "bg-mint-soft text-accent-strong",
  "bg-tan-soft text-[#4a4633]",
]

export async function Hero() {
  const ru = await getDict()
  return (
    <section className="relative overflow-hidden bg-card">
      <div
        aria-hidden
        className="absolute -right-24 -top-40 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(31,145,83,0.10),transparent_68%)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-24 md:gap-12 md:pb-16 md:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-mint bg-mint-soft px-3.5 py-2 text-[12px] font-bold text-accent-strong sm:text-[13px]">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full bg-accent shadow-[0_0_0_5px_rgba(31,145,83,0.12)]"
            />
            {ru.hero.badge}
          </p>
          <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-tight text-balance text-[#10261c] sm:text-[44px] md:text-[54px] md:leading-[1.06]">
            {ru.hero.titleStart}
            <span className="text-accent">{ru.hero.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-[560px] text-[15.5px] leading-relaxed text-pretty text-fg-muted sm:text-[17px]">
            {ru.hero.subtitle}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-[15px] bg-accent px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_13px_28px_rgba(31,145,83,0.22)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-[0_16px_34px_rgba(31,145,83,0.28)] motion-reduce:transform-none"
            >
              {ru.hero.ctaChat}
              <ChevronRightIcon size={17} strokeWidth={2} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-[15px] border border-edge bg-card px-6 py-3.5 text-[15px] font-extrabold text-deep transition-[transform,box-shadow,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-mint hover:bg-mint-soft hover:shadow-[0_13px_26px_rgba(20,42,31,0.10)] motion-reduce:transform-none"
            >
              {ru.hero.ctaAbout}
            </Link>
          </div>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {ru.hero.trust.map((text, i) => (
              <li
                key={i}
                className={`rounded-full px-3.5 py-2 text-[12.5px] font-bold ${TRUST_TONES[i % TRUST_TONES.length]}`}
              >
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* визуал: карточка диагностики с ротацией кейсов */}
        <div
          aria-hidden
          className="relative mt-2 w-full min-w-0 max-w-[460px] justify-self-center lg:mt-0 lg:max-w-[420px]"
        >
          <DiagnosisCard
            label={ru.hero.visual.label}
            status={ru.hero.visual.status}
            cases={ru.hero.visual.cases}
          />
          <div className="absolute -bottom-4 right-3 flex animate-floaty items-center gap-2 rounded-2xl border border-edge bg-card px-3.5 py-3 text-[12.5px] font-extrabold text-deep shadow-[0_10px_26px_rgba(20,42,31,0.08)] motion-reduce:animate-none lg:-top-4 lg:bottom-auto lg:right-auto lg:-left-2 min-[1200px]:-left-8">
            <CloudIcon size={15} strokeWidth={2} className="text-accent" />
            {ru.hero.visual.chipWeather}
          </div>
        </div>
      </div>
    </section>
  )
}
