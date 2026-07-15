import { getDict } from "@/src/i18n/server"
import { SectionReveal } from "./section-reveal"
import { SectionHeading } from "./section-heading"
import { AudienceCards } from "./audience-cards"

export async function Audience() {
  const ru = await getDict()
  return (
    <section className="bg-section-alt px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionReveal>
          <SectionHeading eyebrow={ru.audience.eyebrow} title={ru.audience.title} />
        </SectionReveal>
        <AudienceCards items={ru.audience.items} />
      </div>
    </section>
  )
}
