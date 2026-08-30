"use client";

import { useI18n } from "@/src/i18n/client";
import { PlantIcon } from "@/src/components/ui/icons";

export function EmptyState() {
  const { dict } = useI18n();

  return (
    <div className="w-full max-w-[600px] px-2 text-center sm:px-5">
      <span
        aria-hidden
        className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent sm:size-[68px]"
      >
        <PlantIcon size={30} strokeWidth={1.8} />
      </span>

      <h1 className="mx-auto mt-5 max-w-[560px] text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-fg sm:text-[32px]">
        {dict.chat.emptyTitle}
      </h1>

      <p className="mx-auto mt-3 max-w-[540px] text-sm leading-relaxed text-fg-muted sm:text-base sm:leading-7">
        {dict.chat.emptySubtitle}
      </p>
    </div>
  );
}
