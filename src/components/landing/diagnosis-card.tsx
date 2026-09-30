import Image from "next/image"
import { LeafIcon } from "@/src/components/ui/icons"

interface DiagnosisCase {
  crop: string
  title: string
  note: string
}

interface DiagnosisCardProps {
  label: string
  status: string
  cases: DiagnosisCase[]
}

export function DiagnosisCard({ label, status, cases }: DiagnosisCardProps) {
  const diagnosis = cases[0]

  if (!diagnosis) return null

  return (
    <figure className="min-w-0 overflow-hidden rounded-card border border-edge bg-surface-raised shadow-[0_24px_70px_rgba(13,59,41,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
        <Image
          src="/images/nitrogen-deficiency.webp"
          alt={diagnosis.title}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 to-transparent px-5 pb-5 pt-14 text-white sm:px-6 sm:pb-6 sm:pt-20">
          <p className="text-sm font-medium text-white/75">{diagnosis.crop}</p>
          <p className="mt-1 font-display text-xl font-semibold leading-tight sm:text-2xl">
            {diagnosis.title}
          </p>
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-5 px-5 py-3.5 sm:px-6 sm:py-4">
        <span className="flex min-w-0 items-center gap-3 text-sm font-semibold text-fg">
          <span className="grid size-9 place-items-center rounded-control bg-accent-soft text-accent-strong">
            <LeafIcon size={18} />
          </span>
          <span className="min-w-0">{label}</span>
        </span>
        <span className="text-sm text-fg-muted">{status}</span>
      </figcaption>
    </figure>
  )
}
