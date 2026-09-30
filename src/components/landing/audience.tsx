import { getDict } from "@/src/i18n/server"
import { SectionHeading } from "./section-heading"
import { SECTION_PADDING } from "./section-layout"
import { AudienceCards } from "./audience-cards"

export async function Audience() {
  const ru = await getDict()
  return (
    <section className={`bg-tan-soft ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          compact
          eyebrow={ru.audience.eyebrow}
          title={ru.audience.title}
        />
        <AudienceCards items={ru.audience.items} />
      </div>
    </section>
  )
}
