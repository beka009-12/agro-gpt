"use client";

import { useI18n } from "@/src/i18n/client";
import { PlantIcon } from "@/src/components/ui/icons";

interface EmptyStateProps {
  onSuggestion: (text: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  const { dict } = useI18n();

  return (
    <div className="w-full max-w-[660px] px-1 text-center sm:px-5">
      <span
        aria-hidden
        className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent sm:size-16"
      >
        <PlantIcon size={28} strokeWidth={1.8} />
      </span>

      <h1 className="mx-auto mt-4 max-w-[560px] text-[24px] font-extrabold leading-tight tracking-[-0.035em] text-fg sm:text-[30px]">
        {dict.chat.emptyTitle}
      </h1>

      <p className="mx-auto mt-2.5 max-w-[560px] text-sm leading-relaxed text-fg-muted sm:text-[15px]">
        {dict.chat.emptySubtitle}
      </p>

      <div className="mt-5 grid gap-2 text-left sm:mt-7 sm:grid-cols-2 sm:gap-3">
        {dict.chat.suggestions.map((suggestion, index) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion(suggestion)}
            className={`min-h-12 rounded-xl border border-edge bg-white px-3.5 py-3 text-left text-[13px] font-medium leading-snug text-fg-muted transition-[border-color,background-color,color] duration-150 hover:border-accent hover:bg-accent-soft hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              index > 1 ? "hidden sm:block" : "block"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
