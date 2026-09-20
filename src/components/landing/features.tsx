import { getDict } from "@/src/i18n/server";
import {
  CameraIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "@/src/components/ui/icons";
import { SectionHeading } from "./section-heading";

export async function Features() {
  const ru = await getDict();
  const [photoCard, safetyCard] = ru.features.cards;

  return (
    <section
      id="features"
      className="scroll-mt-24 bg-white px-5 py-20 md:px-2 md:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading title={ru.features.title} />

        <div className="grid gap-2 lg:grid-cols-12 lg:gap-6">
          <article className="bg-brand-gradient relative overflow-hidden rounded-card p-7 text-white sm:p-9 lg:col-span-7 lg:flex lg:h-full lg:flex-col lg:justify-center lg:p-10">
            <h3 className="max-w-[580px] font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
              {ru.features.panel.title}
            </h3>
            <p className="mt-5 max-w-[540px] text-base leading-7 text-white/75">
              {ru.features.panel.description}
            </p>
            <ul className="mt-10 grid gap-0 border-t border-white/20">
              {ru.features.panel.points.map((point) => (
                <li
                  key={point}
                  className="group flex items-start gap-3 border-b border-white/20 py-4 text-[15px] leading-6 text-white/90 transition-colors duration-200 hover:text-white"
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
          </article>

          <div className="grid gap-5 lg:col-span-5 lg:h-full lg:content-center lg:gap-6">
            <article className="rounded-card border border-edge bg-white p-6 sm:p-7">
              <CameraIcon size={23} className="text-accent" />
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.025em] text-fg">
                {photoCard.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-fg-muted">
                {photoCard.description}
              </p>
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
  );
}
