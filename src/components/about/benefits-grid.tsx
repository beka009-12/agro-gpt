import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import { RevealGroup, RevealItem } from "@/src/components/landing/reveal"
import type { Dictionary } from "@/src/i18n/dictionaries"

type BenefitItem = Dictionary["about"]["benefits"]["items"][number]

/** Сетка для планшета и десктопа; на телефоне вместо неё стопка карточек. */
export function BenefitsGrid({ items }: { items: BenefitItem[] }) {
  return (
    <RevealGroup
      as="ul"
      className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
    >
      {items.map((item) => (
        <RevealItem
          as="li"
          key={item.title}
          className="group rounded-card border border-edge bg-white p-6 lg:transition-[transform,border-color] lg:duration-200 lg:hover:-translate-y-1 lg:hover:border-accent/40"
        >
          <span className="grid size-12 place-items-center rounded-control bg-accent-soft text-accent-strong transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
            <AboutIcon id={item.icon as AboutIconId} size={22} strokeWidth={1.8} />
          </span>
          <h3 className="mt-5 font-display text-xl font-semibold leading-tight tracking-[-0.02em] text-fg">
            {item.title}
          </h3>
          <p className="mt-2.5 text-[15px] leading-6 text-fg-muted">
            {item.description}
          </p>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
