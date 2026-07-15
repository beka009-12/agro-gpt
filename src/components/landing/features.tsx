import { getDict } from "@/src/i18n/server"
import { CameraIcon, CheckIcon, ShieldCheckIcon } from "@/src/components/ui/icons"
import { SectionReveal } from "./section-reveal"
import { SectionHeading } from "./section-heading"

/** декоративная иллюстрация — заполняет пространство рядом с карточками справа */
function TreeIllustration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 260"
      className={`animate-sprout-sway motion-reduce:animate-none ${className ?? ""}`}
    >
      <ellipse cx="100" cy="248" rx="46" ry="8" fill="currentColor" className="text-edge" />
      <path
        d="M100 240V150"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        className="text-tan-strong/70"
      />
      <circle cx="100" cy="96" r="62" fill="currentColor" className="text-mint-soft" />
      <circle cx="60" cy="120" r="42" fill="currentColor" className="text-accent/85" />
      <circle cx="140" cy="118" r="46" fill="currentColor" className="text-accent-strong/80" />
      <circle cx="100" cy="150" r="40" fill="currentColor" className="text-accent" />
      <circle cx="72" cy="88" r="7" fill="currentColor" className="text-lime" />
      <circle cx="132" cy="72" r="5.5" fill="currentColor" className="text-lime" />
      <circle cx="118" cy="132" r="6" fill="currentColor" className="text-lime" />
    </svg>
  )
}

export async function Features() {
  const ru = await getDict()
  const [photoCard, safetyCard] = ru.features.cards
  return (
    <section id="features" className="scroll-mt-24 bg-card py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <SectionHeading eyebrow={ru.features.eyebrow} title={ru.features.title} />
        </SectionReveal>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <SectionReveal className="lg:h-full">
            <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#123625,#1f6b45)] p-7 text-white md:p-9 lg:h-full lg:min-h-[420px]">
              <div
                aria-hidden
                className="absolute -right-24 -top-32 size-[350px] rounded-full bg-[radial-gradient(circle,rgba(203,232,107,0.28),transparent_65%)]"
              />
              <h3 className="relative z-[2] max-w-[420px] text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
                {ru.features.panel.title}
              </h3>
              <p className="relative z-[2] mt-3.5 max-w-[500px] text-[15px] leading-relaxed text-[#cfe6d6]">
                {ru.features.panel.description}
              </p>
              <ul className="relative z-[2] mt-6 grid gap-3">
                {ru.features.panel.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-[15px] border border-white/10 bg-white/[0.09] px-3.5 py-3"
                  >
                    <span
                      aria-hidden
                      className="grid size-6 flex-none place-items-center rounded-full bg-[rgba(203,232,107,0.2)] text-lime"
                    >
                      <CheckIcon size={12} strokeWidth={3} />
                    </span>
                    <span className="text-sm leading-normal text-[#e7f3ea]">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>

          {/* правая колонка: карточки друг под другом, дерево стоит справа у границы */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-h-[420px] lg:grid-cols-[1fr_auto] lg:gap-5">
            <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
              <SectionReveal delay={0.08} className="lg:flex-1">
                <article className="h-full rounded-[28px] bg-tan-soft p-6 shadow-[0_10px_28px_rgba(20,42,31,0.05)]">
                  <span
                    aria-hidden
                    className="grid size-11 place-items-center rounded-[14px] bg-card text-tan-strong"
                  >
                    <CameraIcon size={22} strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-fg">
                    {photoCard.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                    {photoCard.description}
                  </p>
                </article>
              </SectionReveal>
              <SectionReveal delay={0.16} className="lg:flex-1">
                <article className="h-full rounded-[28px] bg-mint-soft p-6 shadow-[0_10px_28px_rgba(20,42,31,0.05)]">
                  <span
                    aria-hidden
                    className="grid size-11 place-items-center rounded-[14px] bg-card text-accent-strong"
                  >
                    <ShieldCheckIcon size={22} strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-fg">
                    {safetyCard.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                    {safetyCard.description}
                  </p>
                </article>
              </SectionReveal>
            </div>
            <SectionReveal delay={0.22} className="hidden lg:flex lg:items-end">
              <TreeIllustration className="pointer-events-none h-[235px] w-auto" />
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
