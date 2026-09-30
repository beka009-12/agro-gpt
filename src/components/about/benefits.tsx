import { getDict } from "@/src/i18n/server"
import { SectionHeading } from "@/src/components/landing/section-heading"
import { SECTION_PADDING } from "@/src/components/landing/section-layout"
import { BenefitsGrid } from "./benefits-grid"
import { BenefitsStack } from "./benefits-stack"

export async function Benefits() {
  const ru = await getDict()
  const { eyebrow, title, items } = ru.about.benefits

  return (
    <section className={`bg-tan-soft ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading compact eyebrow={eyebrow} title={title} />
        <div className="sm:hidden">
          <BenefitsStack items={items} />
        </div>
        <BenefitsGrid items={items} />
      </div>
    </section>
  )
}
