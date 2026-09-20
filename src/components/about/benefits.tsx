import { getDict } from "@/src/i18n/server"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { BenefitsCarousel } from "./benefits-carousel"

export async function Benefits() {
  const ru = await getDict()
  const { eyebrow, title, tapHint, items } = ru.about.benefits

  return (
    <section className="bg-white px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <p className="-mt-6 mb-8 text-sm font-medium text-fg-faint md:hidden">
          {tapHint}
        </p>

        <BenefitsCarousel items={items} />
      </div>
    </section>
  )
}
