import { getDict } from "@/src/i18n/server"
import { getDiseaseLandingData } from "@/src/lib/disease-data"
import { DiseaseIntelligenceInteractive } from "./disease-intelligence-interactive"
import { SectionHeading } from "./section-heading"

export async function DiseaseIntelligence() {
  const [dict, data] = await Promise.all([getDict(), getDiseaseLandingData()])

  return (
    <section
      id="disease-data"
      className="scroll-mt-24 border-b border-edge bg-white px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={dict.diseaseIntelligence.eyebrow}
          title={dict.diseaseIntelligence.title}
        />
        <p className="-mt-8 mb-10 max-w-2xl text-base leading-7 text-fg-muted md:-mt-12 md:mb-12">
          {dict.diseaseIntelligence.description}
        </p>
        <DiseaseIntelligenceInteractive
          {...data}
          labels={dict.diseaseIntelligence}
        />
      </div>
    </section>
  )
}
