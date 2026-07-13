import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { SectionReveal } from "./section-reveal"

export async function CtaBanner() {
  const ru = await getDict()
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
      <SectionReveal>
        <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-[34px] bg-[linear-gradient(130deg,#063a2a,#0a6642)] p-8 text-white md:flex-row md:items-center md:justify-between md:gap-8 md:p-12">
          <div
            aria-hidden
            className="absolute -right-24 -top-36 size-[370px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.34),transparent_67%)]"
          />
          <div className="relative z-[2]">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-balance md:text-[33px]">
              {ru.cta.title}
            </h2>
            <p className="mt-2.5 max-w-[560px] text-[15px] leading-relaxed text-[#cbe9d8]">
              {ru.cta.description}
            </p>
          </div>
          <Link
            href="/chat"
            className="relative z-[2] whitespace-nowrap rounded-[15px] bg-white px-6 py-3.5 text-[15px] font-extrabold text-deep transition-colors hover:bg-[#f0fdf4]"
          >
            {ru.cta.button}
          </Link>
        </div>
      </SectionReveal>
    </section>
  )
}
