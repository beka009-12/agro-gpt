import Image from "next/image"
import { getDict } from "@/src/i18n/server"
import { CameraIcon, CheckIcon, ShieldCheckIcon } from "@/src/components/ui/icons"
import { SectionHeading } from "./section-heading"

export async function Features() {
  const ru = await getDict()
  const [photoCard, safetyCard] = ru.features.cards

  return (
    <section id="features" className="scroll-mt-24 bg-white px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={ru.features.title} />

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          <article className="bg-brand-gradient relative overflow-hidden rounded-card p-7 text-white sm:p-9 lg:col-span-7 lg:p-10">
            <div className="flex flex-col">
              <div>
                <h3 className="max-w-[580px] font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
                  {ru.features.panel.title}
                </h3>
                <p className="mt-5 max-w-[540px] text-base leading-7 text-white/75">
                  {ru.features.panel.description}
                </p>
              </div>
              <ul className="mt-10 grid gap-0 border-t border-white/20">
                {ru.features.panel.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 border-b border-white/20 py-4 text-[15px] leading-6 text-white/90">
                    <CheckIcon className="mt-1 shrink-0 text-lime" size={16} weight="bold" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <div className="grid gap-5 lg:col-span-5 lg:gap-6">
            <article className="overflow-hidden rounded-card border border-edge bg-white">
              <div className="relative aspect-[16/7] overflow-hidden">
                <Image
                  src="/images/powdery-mildew.jpg"
                  alt={photoCard.title}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 sm:p-7">
                <CameraIcon size={23} className="text-accent" />
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.025em] text-fg">
                  {photoCard.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-fg-muted">
                  {photoCard.description}
                </p>
              </div>
            </article>

            <article className="rounded-card border border-edge bg-surface-muted p-6 sm:p-7">
              <ShieldCheckIcon size={24} className="text-accent" />
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.025em] text-fg">
                {safetyCard.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-fg-muted">
                {safetyCard.description}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
