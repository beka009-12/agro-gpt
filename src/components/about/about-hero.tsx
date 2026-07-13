import { getDict } from "@/src/i18n/server"
import { SectionReveal } from "@/src/components/landing/section-reveal"

function BottleVisual({
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
      className="relative grid min-h-[380px] place-items-center overflow-hidden rounded-[34px] bg-[linear-gradient(150deg,#06402f,#0a6a45)] shadow-[0_18px_55px_rgba(6,78,59,0.10)] md:min-h-[440px]"
    >
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute size-[350px] rounded-full bg-[radial-gradient(circle,rgba(132,204,22,0.42),transparent_67%)]" />
      <div className="relative z-[2] mt-8 flex h-[280px] w-[200px] -rotate-3 items-center justify-center rounded-[46px_46px_36px_36px] border-8 border-white/80 bg-[linear-gradient(145deg,#e9f8e6,#b9dda8)] shadow-[0_35px_50px_rgba(0,0,0,0.25)] md:h-[310px] md:w-[220px]">
        <div className="absolute -top-11 h-[52px] w-[84px] rounded-[15px_15px_7px_7px] border-[6px] border-white/70 bg-[#1a2c25]" />
        <div className="w-[160px] rounded-[20px] bg-white px-3.5 py-5 text-center shadow-[0_12px_22px_rgba(6,78,59,0.14)] md:w-[170px]">
          <small className="text-[10px] font-extrabold tracking-[0.12em] text-accent">
            {overline}
          </small>
          <h3 className="mt-1.5 text-[22px] font-extrabold tracking-tight text-deep">
            {name}
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-fg-muted">{note}</p>
        </div>
      </div>
    </div>
  )
}

export async function AboutHero() {
  const ru = await getDict()
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-28 md:pt-36 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
      <SectionReveal>
        <p className="inline-flex items-center gap-2 rounded-full border border-mint bg-mint-soft px-3.5 py-2 text-[13px] font-bold text-[#14733b]">
          <span
            aria-hidden
            className="size-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(22,163,74,0.12)]"
          />
          {ru.about.badge}
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-[#0c3020] md:text-[48px]">
          {ru.about.titleStart}
          <span className="text-accent">{ru.about.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-[600px] text-[17px] leading-relaxed text-fg-muted">
          {ru.about.subtitle}
        </p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {ru.about.stats.map((stat, i) => (
            <li
              key={i}
              className="rounded-[15px] border border-edge bg-card px-4 py-3"
            >
              <strong className="block text-[17px] font-bold text-deep">
                {stat.value}
              </strong>
              <small className="text-xs text-fg-muted">{stat.label}</small>
            </li>
          ))}
        </ul>
      </SectionReveal>
      <SectionReveal delay={0.1}>
        <BottleVisual
          overline={ru.about.bottle.overline}
          name={ru.about.bottle.name}
          note={ru.about.bottle.note}
        />
      </SectionReveal>
    </section>
  )
}
