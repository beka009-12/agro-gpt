import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import {
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  CloudIcon,
  PlantIcon,
} from "@/src/components/ui/icons"

function ScanPanel({
  label,
  status,
  resultTitle,
  resultNote,
}: {
  label: string
  status: string
  resultTitle: string
  resultNote: string
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(155deg,#073c2d,#096044)] p-6 text-white">
      {/* сетка + свечение */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.11)_1px,transparent_1px)] [background-size:38px_38px]"
      />
      <div
        aria-hidden
        className="absolute left-16 top-10 size-[330px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.42),transparent_67%)]"
      />
      <div className="relative z-[2] flex items-center justify-between text-xs font-medium text-[#d9fbe6]">
        <span>{label}</span>
        <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5">
          ● {status}
        </span>
      </div>
      <div className="relative z-[2] grid h-[230px] place-items-center sm:h-[250px]">
        <svg
          width="200"
          height="200"
          viewBox="0 0 240 240"
          fill="none"
          aria-hidden
          className="drop-shadow-[0_28px_25px_rgba(0,0,0,0.25)]"
        >
          <path
            d="M119 212V100"
            stroke="#d6ff9a"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path d="M119 144C75 145 46 119 43 76c44-1 74 25 76 68Z" fill="#69c94c" />
          <path d="M119 174c43 0 72-26 75-68-43 0-72 25-75 68Z" fill="#9be15d" />
          <path d="M117 111c-28 0-49-18-52-49 31-1 51 17 52 49Z" fill="#4cad46" />
          <path d="M120 125c29 0 49-18 51-50-30 0-50 18-51 50Z" fill="#80d65a" />
          <ellipse cx="119" cy="216" rx="68" ry="12" fill="rgba(0,0,0,0.18)" />
        </svg>
        <div
          aria-hidden
          className="absolute inset-x-6 top-6 h-0.5 animate-scan bg-[linear-gradient(90deg,transparent,#c8ff6d,transparent)] shadow-[0_0_18px_#c8ff6d] motion-reduce:animate-none"
        />
      </div>
      <div className="relative z-[2] grid grid-cols-[auto_1fr] items-center gap-3 rounded-[20px] bg-white p-3.5 text-fg shadow-[0_16px_38px_rgba(0,0,0,0.18)]">
        <span className="grid size-11 place-items-center rounded-[14px] bg-[#dcfce7] text-accent">
          <PlantIcon size={21} strokeWidth={1.8} />
        </span>
        <span>
          <strong className="block text-sm">{resultTitle}</strong>
          <small className="text-xs text-fg-muted">{resultNote}</small>
        </span>
      </div>
    </div>
  )
}

export async function Hero() {
  const ru = await getDict()
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-28 md:pt-36 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-mint bg-mint-soft px-3.5 py-2 text-[13px] font-bold text-[#14733b]">
          <span
            aria-hidden
            className="size-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(22,163,74,0.12)]"
          />
          {ru.hero.badge}
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.06] tracking-tight text-balance text-[#0c3020] md:text-[54px]">
          {ru.hero.titleStart}
          <span className="text-accent">{ru.hero.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-[560px] text-[17px] leading-relaxed text-pretty text-fg-muted">
          {ru.hero.subtitle}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-[15px] bg-[linear-gradient(135deg,#16a34a,#15803d)] px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_13px_28px_rgba(22,163,74,0.22)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(22,163,74,0.28)] motion-reduce:transform-none"
          >
            {ru.hero.ctaChat}
            <ChevronRightIcon size={17} strokeWidth={2} />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center rounded-[15px] border border-edge bg-card px-6 py-3.5 text-[15px] font-extrabold text-deep transition-colors hover:bg-mint-soft"
          >
            {ru.hero.ctaAbout}
          </Link>
        </div>
        <ul className="mt-7 flex flex-wrap gap-5">
          {ru.hero.trust.map((text, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[13px] font-bold text-fg-faint"
            >
              <span
                aria-hidden
                className="grid size-5 place-items-center rounded-full bg-[#dcfce7] text-accent"
              >
                <CheckIcon size={11} strokeWidth={3} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* визуал AI-скан */}
      <div aria-hidden className="relative mt-2 lg:mt-0">
        <div className="rounded-[38px] border border-white/95 bg-white/90 p-4 shadow-[0_18px_55px_rgba(6,78,59,0.10)] lg:rotate-1">
          <ScanPanel
            label={ru.hero.visual.label}
            status={ru.hero.visual.status}
            resultTitle={ru.hero.visual.resultTitle}
            resultNote={ru.hero.visual.resultNote}
          />
        </div>
        <div className="absolute -left-2 top-24 hidden animate-floaty items-center gap-2 rounded-2xl border border-edge bg-card px-3.5 py-3 text-[13px] font-extrabold text-deep shadow-[0_10px_30px_rgba(6,78,59,0.07)] motion-reduce:animate-none min-[1200px]:-left-8 lg:flex">
          <CameraIcon size={16} strokeWidth={2} className="text-accent" />
          {ru.hero.visual.chipPhoto}
        </div>
        <div className="absolute -right-1 bottom-20 hidden animate-floaty items-center gap-2 rounded-2xl border border-edge bg-card px-3.5 py-3 text-[13px] font-extrabold text-deep shadow-[0_10px_30px_rgba(6,78,59,0.07)] [animation-delay:1.1s] motion-reduce:animate-none min-[1200px]:-right-6 lg:flex">
          <CloudIcon size={16} strokeWidth={2} className="text-accent" />
          {ru.hero.visual.chipWeather}
        </div>
      </div>
    </section>
  )
}
