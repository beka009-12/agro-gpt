import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { ChevronRightIcon } from "@/src/components/ui/icons"

export async function CtaBanner() {
  const ru = await getDict()

  return (
    <section className="bg-white px-5 pb-24 md:px-8 md:pb-32">
      <div className="bg-brand-gradient mx-auto max-w-7xl rounded-card px-7 py-14 text-white sm:px-10 md:px-14 md:py-20 lg:flex lg:items-end lg:justify-between lg:gap-12">
        <div>
          <h2 className="max-w-[760px] font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[48px] lg:text-[56px]">
            {ru.cta.title}
          </h2>
          <p className="mt-5 max-w-[620px] text-base leading-7 text-white/75">
            {ru.cta.description}
          </p>
        </div>
        <Link
          href="/chat"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-white px-6 py-3 text-[15px] font-semibold text-forest transition-[background-color,transform] duration-200 hover:bg-accent-soft active:translate-y-px lg:mt-0"
        >
          {ru.cta.button}
          <ChevronRightIcon size={17} />
        </Link>
      </div>
    </section>
  )
}
