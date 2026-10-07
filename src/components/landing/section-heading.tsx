import type { ReactNode } from "react"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  /** плотный вариант для уплотнённых секций; по умолчанию — прежний вид */
  compact?: boolean
  /** элемент справа от заголовка (ссылка «Все …»), прижат к нижней линии */
  action?: ReactNode
}

export function SectionHeading({ eyebrow, title, compact = false, action }: SectionHeadingProps) {
  const spacing = compact ? "mb-8 md:mb-10" : "mb-12 md:mb-16"
  const heading = (
    <div className="max-w-[820px]">
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

  if (!action) return <div className={spacing}>{heading}</div>

  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-3 ${spacing}`}>
      {heading}
      {action}
    </div>
  )
}
