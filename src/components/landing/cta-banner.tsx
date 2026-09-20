import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { ChevronRightIcon, LeafIcon } from "@/src/components/ui/icons"

export async function CtaBanner() {
  const ru = await getDict()

  return (
    <section className="bg-white px-5 pb-24 md:px-8 md:pb-32">
      <div className="bg-brand-gradient relative mx-auto max-w-7xl overflow-hidden rounded-card px-6 py-10 text-white sm:px-10 sm:py-14 md:px-14 md:py-20">
        <LeafIcon
          aria-hidden
          size={340}
          weight="fill"
          className="pointer-events-none absolute -bottom-16 -right-16 hidden rotate-[-18deg] text-white/[0.06] lg:block"
        />
        <div className="relative max-w-[620px]">
          <h2 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[48px] sm:leading-[1.08] sm:tracking-[-0.035em] lg:text-[56px]">
            {ru.cta.title}
          </h2>
          <p className="mt-5 text-base leading-7 text-white/75">
            {ru.cta.description}
          </p>
          <Link
            href="/chat"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-control bg-white px-6 py-3 text-[15px] font-semibold text-forest transition-[background-color,transform] duration-200 hover:bg-accent-soft active:translate-y-px"
          >
            {ru.cta.button}
            <ChevronRightIcon size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
