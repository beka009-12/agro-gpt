"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import type { Locale } from "@/src/i18n/config";
import { SPRING_SNAPPY } from "@/src/lib/motion-tokens";

/** в шапке доступны только эти два языка вне зависимости от общего списка LOCALES */
const HEADER_LOCALES: readonly [Locale, Locale] = ["ru", "en"];

interface LanguageSwitcherProps {
  /** compact — тумблер для хедера; row — тумблер во всю ширину для мобильного меню */
  variant?: "compact" | "row";
  /** вызывается после выбора языка, например для закрытия меню */
  onDone?: () => void;
}

export function LanguageSwitcher({
  variant = "compact",
  onDone,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const [pending, setPending] = useState(false);
  const reduced = useReducedMotion();

  const switchTo = async (next: Locale) => {
    if (pending || next === locale) return;

    setPending(true);

    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: next }),
      });

      router.refresh();
      onDone?.();
    } catch (error) {
      console.error("[language-switcher]", error);
    } finally {
      setPending(false);
    }
  };

  const activeIndex = HEADER_LOCALES.indexOf(
    locale === "en" ? "en" : "ru",
  );
  const rowVariant = variant === "row";

  return (
    <div
      role="group"
      aria-label={dict.languageSwitcher.title}
      className={`relative grid grid-cols-2 rounded-full border border-header-edge bg-header-mint-soft/50 p-0.5 ${
        rowVariant ? "w-full" : "w-24 flex-none"
      }`}
    >
      <motion.span
        aria-hidden
        animate={{ x: `${activeIndex * 100}%` }}
        transition={reduced ? { duration: 0 } : SPRING_SNAPPY}
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-header-accent"
      />
      {HEADER_LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => void switchTo(code)}
            aria-pressed={active}
            className={`relative z-10 flex w-full after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] items-center justify-center rounded-full text-[12px] font-bold uppercase tracking-[0.03em] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              rowVariant ? "h-11 text-[13px]" : "h-8"
            } ${active ? "text-accent-contrast" : "text-header-fg-muted hover:text-header-fg"}`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
