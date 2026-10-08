import { getDict } from "@/src/i18n/server"
import { getDiseaseLandingData } from "@/src/lib/disease-data"
import { DiseaseIntelligenceInteractive } from "./disease-intelligence-interactive"
import { SectionHeading } from "./section-heading"
import { SECTION_PADDING } from "./section-layout"

export async function DiseaseIntelligence() {
  const [dict, data] = await Promise.all([getDict(), getDiseaseLandingData()])

  return (
    <section
      id="disease-data"
      className={`scroll-mt-24 border-b border-edge bg-white ${SECTION_PADDING}`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          compact
          eyebrow={dict.diseaseIntelligence.eyebrow}
          title={dict.diseaseIntelligence.title}
          description={dict.diseaseIntelligence.description}
        />
        <DiseaseIntelligenceInteractive
          {...data}
          labels={dict.diseaseIntelligence}
        />
      </div>
    </section>
  )
}
