interface SectionHeadingProps {
  eyebrow: string
  title: string
}

export function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="mx-auto mb-10 max-w-[700px] text-center">
      <p className="inline-flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.03em] text-accent">
        <span aria-hidden className="h-0.5 w-[22px] rounded-full bg-accent" />
        {eyebrow}
      </p>
      <h2 className="mt-3.5 text-3xl font-extrabold leading-[1.1] tracking-tight text-balance text-fg md:text-[40px]">
        {title}
      </h2>
    </div>
  )
}
