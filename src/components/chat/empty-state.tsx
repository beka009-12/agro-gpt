import ru from "@/src/i18n/ru.json"

interface EmptyStateProps {
  onSuggestion: (text: string) => void
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="m-auto flex flex-col items-center gap-2 px-5 text-center">
      <span
        aria-hidden
        className="flex size-14 origin-bottom animate-sprout-sway items-center justify-center rounded-full bg-mint-soft text-[26px] motion-reduce:animate-none"
      >
        🌱
      </span>
      <h2 className="mt-2.5 text-xl font-bold text-fg">{ru.chat.emptyTitle}</h2>
      <p className="max-w-[340px] text-sm text-fg-muted">
        {ru.chat.emptySubtitle}
      </p>
      <div className="mt-5 flex max-w-[480px] flex-wrap justify-center gap-2.5">
        {ru.chat.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="rounded-full bg-mint-soft px-4 py-2.5 text-[13.5px] font-medium text-accent transition-colors hover:bg-mint hover:text-fg"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
