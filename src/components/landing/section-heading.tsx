interface SectionHeadingProps {
  eyebrow?: string
  title: string
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mb-12 max-w-[820px] md:mb-16">
      {eyebrow ? (
        <p className="mb-5 text-sm font-semibold text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-fg sm:text-[44px] lg:text-[56px]">
        {title}
      </h2>
    </div>
  )
}
