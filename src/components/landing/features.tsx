import { getDict } from "@/src/i18n/server";
import {
  CameraIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "@/src/components/ui/icons";
import { SectionHeading } from "./section-heading";
import { SECTION_PADDING } from "./section-layout";
import { RevealGroup, RevealItem } from "./reveal";

export async function Features() {
  const ru = await getDict();
  const [photoCard, safetyCard] = ru.features.cards;

  return (
    <section
      id="features"
      className={`scroll-mt-24 bg-white ${SECTION_PADDING}`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading compact title={ru.features.title} />

        <RevealGroup className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          <RevealItem as="article" className="bg-brand-gradient relative overflow-hidden rounded-card p-6 text-white sm:p-8 lg:col-span-7 lg:flex lg:h-full lg:flex-col lg:justify-center lg:p-10">
            <h3 className="max-w-[580px] font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[36px]">
              {ru.features.panel.title}
            </h3>
            <p className="mt-4 max-w-[540px] text-base leading-7 text-white/75">
              {ru.features.panel.description}
            </p>
            <ul className="mt-6 grid gap-0 border-t border-white/20">
              {ru.features.panel.points.map((point) => (
                <li
                  key={point}
                  className="group flex items-start gap-3 border-b border-white/20 py-3 text-[15px] leading-6 text-white/90 transition-colors duration-200 hover:text-white"
                >
                  <CheckIcon
                    className="mt-1 shrink-0 text-lime transition-transform duration-200 group-hover:scale-110"
                    size={16}
                    weight="bold"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </RevealItem>

          <div className="grid gap-4 md:grid-cols-2 lg:col-span-5 lg:h-full lg:grid-cols-1 lg:content-center lg:gap-5">
            <RevealItem as="article" className="rounded-card border border-edge bg-white p-6 sm:p-7">
              <CameraIcon size={23} className="text-accent" />
              <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-fg sm:text-2xl">
                {photoCard.title}
              </h3>
              <p className="mt-2 text-base leading-7 text-fg-muted">
                {photoCard.description}
              </p>
            </RevealItem>

            <RevealItem as="article" className="rounded-card border border-edge bg-surface-muted p-6 sm:p-7">
              <ShieldCheckIcon size={24} className="text-accent" />
              <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-fg sm:text-2xl">
                {safetyCard.title}
              </h3>
              <p className="mt-2 text-base leading-7 text-fg-muted">
                {safetyCard.description}
              </p>
            </RevealItem>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
