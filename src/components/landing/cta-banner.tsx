import Link from "next/link"
import { getDict } from "@/src/i18n/server"
import { ChevronRightIcon, LeafIcon } from "@/src/components/ui/icons"

export async function CtaBanner() {
  const ru = await getDict()

  return (
    <section className="bg-white px-5 pb-12 md:px-8 md:pb-16 lg:pb-20">
      <div className="bg-brand-gradient relative mx-auto max-w-7xl overflow-hidden rounded-card px-6 py-8 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <LeafIcon
          aria-hidden
          size={340}
          weight="fill"
          className="pointer-events-none absolute -bottom-16 -right-16 hidden rotate-[-18deg] text-white/[0.06] lg:block"
        />
        <div className="relative max-w-[620px]">
          <h2 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[40px] sm:leading-[1.1] sm:tracking-[-0.03em] lg:text-[48px]">
            {ru.cta.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/75">
            {ru.cta.description}
          </p>
          <Link
            href="/chat"
            className="mt-6 flex w-full min-h-12 items-center justify-center gap-2 sm:inline-flex sm:w-auto whitespace-nowrap rounded-control bg-white px-6 py-3 text-[15px] font-semibold text-forest transition-[background-color,transform] duration-200 hover:bg-accent-soft active:translate-y-px"
          >
            {ru.cta.button}
            <ChevronRightIcon size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
