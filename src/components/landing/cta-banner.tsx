import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { ChevronRightIcon } from "@/src/components/ui/icons"
import { SectionReveal } from "./section-reveal"

export async function CtaBanner() {
  const ru = await getDict()
  return (
    <section className="bg-section-alt px-4 pb-16 md:pb-20">
      <div className="mx-auto max-w-6xl">
        <SectionReveal>
          <div className="relative overflow-hidden rounded-[26px] bg-deep md:rounded-[32px]">
            <div
              aria-hidden
              className="absolute inset-0 bg-accent-strong [clip-path:polygon(62%_0,100%_0,100%_100%,78%_100%)]"
            />
            <div className="relative z-[2] flex flex-col items-start gap-6 p-6 text-white sm:p-8 md:flex-row md:items-center md:justify-between md:gap-8 md:p-12">
              <div>
                <h2 className="text-[24px] font-extrabold leading-tight tracking-tight text-balance md:text-[33px]">
                  {ru.cta.title}
                </h2>
                <p className="mt-2.5 max-w-[560px] text-[15px] leading-relaxed text-[#cfe6d6]">
                  {ru.cta.description}
                </p>
              </div>
              <Link
                href="/chat"
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[15px] bg-white px-6 py-3.5 text-[15px] font-extrabold text-deep shadow-[0_13px_28px_rgba(10,26,18,0.25)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-lime hover:shadow-[0_16px_34px_rgba(10,26,18,0.3)] motion-reduce:transform-none md:w-auto"
              >
                {ru.cta.button}
                <ChevronRightIcon size={17} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
