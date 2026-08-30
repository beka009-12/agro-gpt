import { AudienceIcon, type AudienceIconId } from "@/src/components/ui/icons"
import type { Dictionary } from "@/src/i18n/dictionaries"

type AudienceItem = Dictionary["audience"]["items"][number]

function AudienceArticle({ item }: { item: AudienceItem }) {
  return (
    <article className="h-full py-9 md:py-10">
      <span className="grid size-11 place-items-center rounded-control bg-accent-soft text-accent-strong">
        <AudienceIcon
          id={item.icon as AudienceIconId}
          size={22}
          strokeWidth={1.8}
        />
      </span>
      <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.025em] text-fg md:text-[28px]">
        {item.title}
      </h3>
      <p className="mt-3 max-w-[560px] text-base leading-7 text-fg-muted">
        {item.description}
      </p>
    </article>
  )
}

export function AudienceCards({ items }: { items: AudienceItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="grid border-y border-edge md:grid-cols-3">
      {items.map((item, index) => (
        <div
          key={item.title}
          className={`border-b border-edge last:border-b-0 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 ${index === 0 ? "md:pl-0" : ""} ${index === items.length - 1 ? "md:pr-0" : ""}`}
        >
          <AudienceArticle item={item} />
        </div>
      ))}
    </div>
  )
}
