interface SectionHeadingProps {
  eyebrow?: string
  title: string
  /** плотный вариант для уплотнённых секций; по умолчанию — прежний вид */
  compact?: boolean
}

export function SectionHeading({ eyebrow, title, compact = false }: SectionHeadingProps) {
  return (
    <div
      className={
        compact
          ? "mb-8 max-w-[820px] md:mb-10"
          : "mb-12 max-w-[820px] md:mb-16"
      }
    >
      {eyebrow ? (
        <p
          className={`font-semibold text-accent ${compact ? "mb-3 text-sm" : "mb-5 text-sm"}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={
          compact
            ? "font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-fg sm:text-[36px] lg:text-[44px]"
            : "font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[44px] lg:text-[56px]"
        }
      >
        {title}
      </h2>
    </div>
  )
}
