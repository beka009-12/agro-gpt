"use client";

import { useI18n } from "@/src/i18n/client";
import { PlantIcon } from "@/src/components/ui/icons";

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  const { dict: ru } = useI18n();

  return (
    <div className="w-full max-w-[640px] px-4 text-center sm:px-5 sm:pb-8">
      <span
        aria-hidden
        className="mx-auto grid size-14 place-items-center rounded-[18px] bg-[linear-gradient(145deg,#e8f8ea,#d5f0d9)] text-accent shadow-[0_12px_30px_rgba(22,163,74,0.08)] sm:size-[82px] sm:rounded-[26px]"
      >
        <PlantIcon size={28} strokeWidth={1.8} />
      </span>

      <h2 className="mt-3 text-[20px] font-extrabold tracking-tight text-fg sm:mt-5 sm:text-[26px] md:text-[30px]">
        <span className="sm:hidden">ИИ-помощник для агрономов</span>
        <span className="hidden sm:inline">{ru.chat.emptyTitle}</span>
      </h2>

      <p className="mx-auto mt-2 max-w-[540px] text-[13px] leading-relaxed text-fg-muted sm:mt-2.5 sm:text-sm">
        <span className="sm:hidden">
          Опишите проблему растения или добавьте фотографию.
        </span>
        <span className="hidden sm:inline">{ru.chat.emptySubtitle}</span>
      </p>

      <div className="mt-6 hidden gap-3 text-left sm:grid sm:grid-cols-2">
        {ru.chat.suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion(suggestion)}
            className="rounded-[15px] border border-edge bg-card p-3.5 text-left text-[13px] font-medium leading-snug text-[#46584f] transition-[border-color,background-color,transform] duration-200 hover:-translate-y-px hover:border-[#9fd3a8] hover:bg-[#f8fcf8] motion-reduce:transform-none"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
