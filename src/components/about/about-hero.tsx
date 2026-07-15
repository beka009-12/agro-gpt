import { getDict } from "@/src/i18n/server"
import { PlantIcon } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

/** md+: бирка продукта висит на шнуре — гвоздик, шнур и люверс связаны, подвес слегка качается */
function ProductTag({
  overline,
  name,
  note,
}: {
  overline: string
  name: string
  note: string
}) {
  return (
    <div
      aria-hidden
      className="relative hidden min-h-[430px] overflow-hidden rounded-[34px] bg-tan-soft md:block"
    >
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:22px_22px] text-edge" />
      <div className="absolute left-1/2 top-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,145,83,0.14),transparent_68%)]" />

      <div className="absolute left-1/2 top-8 flex -translate-x-1/2 flex-col items-center">
        {/* гвоздик — закреплён, не качается */}
        <span className="z-[3] size-3 rounded-full bg-deep shadow-[0_2px_5px_rgba(20,42,31,0.35),inset_0_-1px_2px_rgba(255,255,255,0.35)]" />
        {/* шнур + бирка качаются вместе от точки крепления */}
        <div className="-mt-1.5 flex origin-top animate-sprout-sway flex-col items-center motion-reduce:animate-none">
          <svg viewBox="0 0 24 84" className="h-[84px] w-6 text-tan-strong/60">
            <path
              d="M12 1 C 8 26, 16 56, 12 82"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="relative -mt-1 w-[230px] rounded-[24px] border border-edge bg-card p-6 pt-7 text-center shadow-[0_30px_50px_rgba(20,42,31,0.14)] lg:w-[248px]">
            {/* люверс — шнур заходит прямо в него */}
            <span className="absolute -top-3 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full border-4 border-tan-soft bg-deep">
              <span className="size-1.5 rounded-full bg-card" />
            </span>
            <small className="text-[10px] font-extrabold tracking-[0.14em] text-accent">
              {overline}
            </small>
            <h3 className="mt-2 text-[24px] font-extrabold tracking-tight text-deep">
              {name}
            </h3>
            <p className="mt-2 text-[11.5px] leading-snug text-fg-muted">{note}</p>
            <span className="absolute -bottom-5 -right-5 grid size-16 rotate-6 place-items-center rounded-full bg-accent text-white shadow-[0_10px_20px_rgba(31,145,83,0.3)]">
              <PlantIcon size={26} strokeWidth={1.6} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** мобильный вариант — компактная бирка-«тикет» с перфорацией и просечками */
function ProductTicket({
  overline,
  name,
  note,
}: {
  overline: string
  name: string
  note: string
}) {
  return (
    <div
      aria-hidden
      className="relative flex items-center gap-4 overflow-hidden rounded-[24px] bg-tan-soft p-5 md:hidden"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-white shadow-[0_10px_20px_rgba(31,145,83,0.3)]">
        <PlantIcon size={26} strokeWidth={1.6} />
      </span>
      <span className="self-stretch border-l-2 border-dashed border-[#ddd3bc]" />
      <div className="min-w-0 py-0.5">
        <small className="text-[10px] font-extrabold tracking-[0.14em] text-accent">
          {overline}
        </small>
        <h3 className="mt-1 text-[20px] font-extrabold tracking-tight text-deep">
          {name}
        </h3>
        <p className="mt-1 text-[12px] leading-snug text-fg-muted">{note}</p>
      </div>
      {/* просечки по линии перфорации — как у настоящей бирки */}
      <span className="absolute -top-2 left-[85px] size-4 rounded-full bg-card" />
      <span className="absolute -bottom-2 left-[85px] size-4 rounded-full bg-card" />
    </div>
  )
}

const STAT_TONES = ["bg-tan-soft text-[#4a4633]", "bg-mint-soft text-accent-strong", "bg-tan-soft text-[#4a4633]"]

export async function AboutHero() {
  const ru = await getDict()
  return (
    <section className="bg-card px-4 pb-14 pt-24 md:pb-16 md:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-14">
        <SectionReveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-mint bg-mint-soft px-3.5 py-2 text-[13px] font-bold text-accent-strong">
            <span
              aria-hidden
              className="size-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(31,145,83,0.12)]"
            />
            {ru.about.badge}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-[#10261c] md:text-[46px]">
            {ru.about.titleStart}
            <span className="text-accent">{ru.about.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-[600px] text-[15.5px] leading-relaxed text-fg-muted sm:text-[17px]">
            {ru.about.subtitle}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {ru.about.stats.map((stat, i) => (
              <li
                key={i}
                className={`rounded-full px-3.5 py-2 text-[12.5px] font-bold ${STAT_TONES[i % STAT_TONES.length]}`}
              >
                {stat}
              </li>
            ))}
          </ul>
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <ProductTag
            overline={ru.about.bottle.overline}
            name={ru.about.bottle.name}
            note={ru.about.bottle.note}
          />
          <ProductTicket
            overline={ru.about.bottle.overline}
            name={ru.about.bottle.name}
            note={ru.about.bottle.note}
          />
        </SectionReveal>
      </div>
    </section>
  )
}
