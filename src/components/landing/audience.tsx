import { getDict } from "@/src/i18n/server"
import { SectionHeading } from "./section-heading"
import { AudienceCards } from "./audience-cards"

export async function Audience() {
  const ru = await getDict()
  return (
    <section className="bg-white px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={ru.audience.eyebrow} title={ru.audience.title} />
        <AudienceCards items={ru.audience.items} />
      </div>
    </section>
  )
}
