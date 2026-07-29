"use client";

import { useI18n } from "@/src/i18n/client";
import { PlantIcon } from "@/src/components/ui/icons";

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  const { dict: ru } = useI18n();
  return (
    <div className="mx-auto pt-16 pb-8 w-full max-w-[640px] px-5 text-center">
      <span
        aria-hidden
        className="mx-auto grid size-[82px] place-items-center rounded-[26px] bg-[linear-gradient(145deg,#e8f8ea,#d5f0d9)] text-accent"
      >
        <PlantIcon size={39} strokeWidth={1.7} />
      </span>
      <h2 className="mt-5 text-[26px] font-extrabold tracking-tight text-fg md:text-[30px]">
        {ru.chat.emptyTitle}
      </h2>
      <p className="mx-auto mt-2.5 max-w-[540px] text-sm leading-relaxed text-fg-muted">
        {ru.chat.emptySubtitle}
      </p>
      <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
        {ru.chat.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="rounded-[15px] border border-edge bg-card p-3.5 text-left text-[13px] font-medium leading-snug text-[#46584f] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-px hover:border-[#9fd3a8] hover:bg-[#f8fcf8] motion-reduce:transform-none"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
