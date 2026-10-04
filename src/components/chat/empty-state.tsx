"use client";

import { useI18n } from "@/src/i18n/client";
import { CameraIcon, PlantIcon } from "@/src/components/ui/icons";

interface EmptyStateProps {
  onPickPhoto: () => void;
}

export function EmptyState({ onPickPhoto }: EmptyStateProps) {
  const { dict } = useI18n();

  return (
    <div className="w-full max-w-[600px] px-1 sm:px-4">
      <div className="text-center">
        <span
          aria-hidden
          className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent"
        >
          <PlantIcon size={30} strokeWidth={1.8} />
        </span>

        <h1 className="mx-auto mt-4 max-w-[520px] text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-fg sm:text-[32px]">
          {dict.chat.emptyTitle}
        </h1>

        <p className="mx-auto mt-2.5 max-w-[460px] text-[15px] leading-relaxed text-fg-muted sm:text-base">
          {dict.chat.emptySubtitle}
        </p>

        <button
          type="button"
          onClick={onPickPhoto}
          className="mx-auto mt-6 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-accent px-6 text-[15px] font-bold text-accent-contrast shadow-[0_8px_20px_rgba(22,163,74,0.24)] transition-colors duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto"
        >
          <CameraIcon size={20} strokeWidth={2} />
          {dict.chat.photoCta}
        </button>

        <p className="mt-2.5 text-xs text-fg-muted">{dict.chat.photoTip}</p>
      </div>
    </div>
  );
}
