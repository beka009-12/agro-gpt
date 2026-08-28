"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import { LOCALES, type Locale } from "@/src/i18n/config";
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens";
import {
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  XIcon,
} from "@/src/components/ui/icons";

function useLocaleSwitch() {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const [pending, setPending] = useState(false);

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
    } catch (error) {
      console.error("[language-switcher]", error);
    } finally {
      setPending(false);
    }
  };

  return { locale, dict, pending, switchTo };
}

const noopSubscribe = () => () => {};

/** true после гидратации — портал в body нельзя рендерить на сервере */
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

interface LanguageSwitcherProps {
  /** compact — кнопка для хедера; row — строка для бокового меню */
  variant?: "compact" | "row";
  /** вызывается после выбора языка, например для закрытия меню */
  onDone?: () => void;
}

export function LanguageSwitcher({
  variant = "compact",
  onDone,
}: LanguageSwitcherProps) {
  const { locale, dict, pending, switchTo } = useLocaleSwitch();
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const sheetRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable =
        sheetRef.current?.querySelectorAll<HTMLElement>("button");

      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    requestAnimationFrame(() => {
      sheetRef.current
        ?.querySelector<HTMLElement>("button[aria-pressed='true']")
        ?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (code: Locale) => {
    setOpen(false);
    onDone?.();
    void switchTo(code);
  };

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={dict.languageSwitcher.title}
          className="group flex h-9 min-w-[70px] flex-none items-center justify-center gap-1.5 rounded-xl border border-edge bg-card px-2.5 text-[13px] font-semibold text-fg shadow-[0_2px_8px_rgba(6,78,59,0.04)] transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-accent hover:bg-mint-soft hover:shadow-[0_5px_14px_rgba(6,78,59,0.08)] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GlobeIcon size={15} strokeWidth={1.9} className="text-accent" />

          <span className="leading-none tracking-[0.02em]">
            {locale.toUpperCase()}
          </span>

          <ChevronDownIcon
            size={12}
            className="text-fg-faint transition-transform duration-200 group-aria-expanded:rotate-180"
          />
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-[border-color,background-color] hover:border-edge hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-mint-soft text-accent"
          >
            <GlobeIcon size={17} strokeWidth={1.9} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold leading-tight text-fg">
              {dict.languageSwitcher[locale]}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-fg-faint">
              {locale}
            </span>
          </span>

          <ChevronDownIcon
            size={15}
            className="flex-none text-fg-faint transition-transform duration-200 group-aria-expanded:rotate-180"
          />
        </button>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                key="language-sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.fast }}
                className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-5"
              >
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 cursor-default bg-forest/50 backdrop-blur-[3px]"
                />

                <motion.div
                  ref={sheetRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={dict.languageSwitcher.title}
                  initial={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, y: 32, scale: 0.985 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, y: 28, scale: 0.985 }
                  }
                  transition={{
                    duration: DURATION.base * 0.72,
                    ease: EASE_OUT,
                  }}
                  className="relative w-full max-w-[420px] overflow-hidden rounded-t-[26px] border border-edge bg-card shadow-[0_-18px_55px_rgba(6,78,59,0.2)] sm:rounded-[24px] sm:shadow-[0_24px_70px_rgba(6,78,59,0.2)]"
                >
                  <span
                    aria-hidden
                    className="mx-auto mt-2.5 block h-1 w-10 rounded-full bg-edge sm:hidden"
                  />

                  <div className="flex items-center gap-3 border-b border-edge px-4 py-4 sm:px-5">
                    <span
                      aria-hidden
                      className="grid size-10 flex-none place-items-center rounded-[13px] bg-accent-soft text-accent"
                    >
                      <GlobeIcon size={20} strokeWidth={1.9} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-extrabold tracking-[-0.01em] text-fg">
                        {dict.languageSwitcher.title}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] font-medium text-fg-muted">
                        {dict.languageSwitcher[locale]}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={`${dict.languageSwitcher.title}: close`}
                      className="grid size-9 flex-none place-items-center rounded-xl text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>

                  <div className="grid gap-2 p-3.5 pb-[max(14px,env(safe-area-inset-bottom))] sm:p-4">
                    {LOCALES.map((code) => {
                      const active = code === locale;

                      return (
                        <button
                          key={code}
                          type="button"
                          disabled={pending}
                          onClick={() => choose(code)}
                          aria-pressed={active}
                          className={`group flex w-full items-center gap-3 rounded-[15px] border px-3 py-3 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 ${
                            active
                              ? "border-accent bg-accent-soft shadow-[0_5px_16px_rgba(22,163,74,0.07)]"
                              : "border-transparent bg-bg/70 hover:-translate-y-px hover:border-edge hover:bg-card hover:shadow-[0_5px_16px_rgba(6,78,59,0.06)]"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`grid size-10 flex-none place-items-center rounded-[12px] text-[11px] font-extrabold uppercase tracking-[0.07em] ${
                              active
                                ? "bg-accent text-accent-contrast shadow-[0_6px_15px_rgba(22,163,74,0.22)]"
                                : "border border-edge bg-card text-fg-muted"
                            }`}
                          >
                            {code}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[14px] leading-tight ${
                                active
                                  ? "font-bold text-fg"
                                  : "font-semibold text-fg"
                              }`}
                            >
                              {dict.languageSwitcher[code]}
                            </span>
                            <span
                              className={`mt-1 block text-[11px] font-medium uppercase tracking-[0.08em] ${
                                active ? "text-accent" : "text-fg-faint"
                              }`}
                            >
                              {code}
                            </span>
                          </span>

                          <span
                            aria-hidden
                            className={`grid size-8 flex-none place-items-center rounded-full transition-colors ${
                              active
                                ? "bg-white text-accent shadow-[0_3px_10px_rgba(6,78,59,0.08)]"
                                : "bg-transparent text-transparent group-hover:bg-mint-soft"
                            }`}
                          >
                            {active && (
                              <CheckIcon size={16} strokeWidth={2.2} />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
