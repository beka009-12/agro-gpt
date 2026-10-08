import { AudienceIcon, type AudienceIconId } from "@/src/components/ui/icons"
import type { Dictionary } from "@/src/i18n/dictionaries"
import { RevealGroup, RevealItem } from "./reveal"

type AudienceItem = Dictionary["audience"]["items"][number]

function AudienceArticle({ item }: { item: AudienceItem }) {
  return (
    <article className="group h-full py-6 transition-transform duration-200 md:flex md:items-start md:gap-6 lg:block lg:hover:-translate-y-1">
      <span className="grid size-11 shrink-0 place-items-center rounded-control bg-accent-soft text-accent-strong transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
        <AudienceIcon
          id={item.icon as AudienceIconId}
          size={22}
          strokeWidth={1.8}
        />
      </span>
      <div className="min-w-0">
        <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.025em] text-fg md:mt-0 lg:mt-4 lg:text-2xl">
          {item.title}
        </h3>
        <p className="mt-2 max-w-[560px] text-base leading-7 text-fg-muted">
          {item.description}
        </p>
      </div>
    </article>
  )
}

export function AudienceCards({ items }: { items: AudienceItem[] }) {
  if (items.length === 0) return null

  return (
    <RevealGroup className="grid border-y border-edge lg:grid-cols-3">
      {items.map((item, index) => (
        <RevealItem
          key={item.title}
          className={`border-b border-edge last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:last:border-r-0 ${index === 0 ? "lg:pl-0" : ""} ${index === items.length - 1 ? "lg:pr-0" : ""}`}
        >
          <AudienceArticle item={item} />
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
