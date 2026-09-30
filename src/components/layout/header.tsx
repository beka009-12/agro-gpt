"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens";
import {
  ChevronRightIcon,
  HomeIcon,
  LeafIcon,
} from "@/src/components/ui/icons";
import { LanguageSwitcher } from "./language-switcher";
import { LogoMark } from "./logo";
import { ProfileMenu, useProfile } from "./profile-menu";

const MENU_ID = "mobile-menu";
const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { dict: ru } = useI18n();
  const reduced = useReducedMotion();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const { profile, setProfile } = useProfile();

  // блокируем прокрутку страницы под открытой шторкой
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Esc закрывает, Tab не выходит за пределы шторки и бургера
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const inSheet = Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
      const items = [burgerRef.current, ...inSheet].filter(
        (el): el is HTMLElement => el !== null,
      );
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? items[(index <= 0 ? items.length : index) - 1]
        : items[(index + 1) % items.length];
      e.preventDefault();
      next.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // фокус: на первый пункт при открытии, обратно на бургер при закрытии
  useEffect(() => {
    if (menuOpen) {
      wasOpen.current = true;
      const id = requestAnimationFrame(() => {
        sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      burgerRef.current?.focus();
    }
  }, [menuOpen]);

  const close = () => setMenuOpen(false);
  const onAbout = pathname === "/about";
  const lineTransition = {
    duration: reduced ? 0.1 : DURATION.fast,
    ease: EASE_OUT,
  };
  const lineClass =
    "absolute left-1/2 top-1/2 -ml-2.5 -mt-px h-[2px] w-5 rounded-full bg-header-fg";

  return (
    <header
      style={{ fontFamily: "var(--font-header)" }}
      className="sticky inset-x-0 top-0 z-50 border-b border-header-edge bg-white/95 backdrop-blur-[2px]"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:h-16 md:px-8">
        <Link
          href="/"
          aria-label={ru.header.logoAria}
          onClick={close}
          className="flex min-h-11 items-center gap-2.5"
        >
          <LogoMark size={26} />
          <span className="font-display text-[19px] font-semibold tracking-[-0.025em] text-header-fg">
            ibo
          </span>
        </Link>

        {/* десктоп-навигация */}
        <nav className="hidden items-center gap-6 sm:flex">
          <LanguageSwitcher />
          <Link
            href={onAbout ? "/" : "/about"}
            className="-mx-2 inline-flex min-h-11 items-center px-2 text-sm font-medium text-header-fg-muted transition-colors hover:text-header-fg"
          >
            {onAbout ? ru.header.nav.home : ru.header.nav.about}
          </Link>
          <Link
            href="/chat"
            className="inline-flex min-h-10 items-center rounded-control bg-header-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition-[background-color,transform] hover:bg-header-accent-strong active:translate-y-px"
          >
            {ru.header.startChat}
          </Link>
          {profile && (
            <ProfileMenu profile={profile} onProfileChange={setProfile} />
          )}
        </nav>

        {/* мобильный бургер: три линии, при открытии — крестик */}
        <button
          ref={burgerRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          aria-label={ru.header.menuLabel}
          className="relative -mr-3 size-11 rounded-control sm:hidden"
        >
          <motion.span
            aria-hidden
            initial={false}
            animate={menuOpen ? { y: 0, rotate: 45 } : { y: -6, rotate: 0 }}
            transition={lineTransition}
            className={lineClass}
          />
          <motion.span
            aria-hidden
            initial={false}
            animate={{ opacity: menuOpen ? 0 : 1 }}
            transition={lineTransition}
            className={lineClass}
          />
          <motion.span
            aria-hidden
            initial={false}
            animate={menuOpen ? { y: 0, rotate: -45 } : { y: 6, rotate: 0 }}
            transition={lineTransition}
            className={lineClass}
          />
        </button>
      </div>

      {/* шторка — порталом в body: backdrop-filter шапки ломает fixed-позиционирование */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.button
                  key="mobile-menu-backdrop"
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={close}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                  className="fixed inset-x-0 bottom-0 top-14 z-30 cursor-default bg-black/50 sm:hidden"
                />
                <motion.div
                  key="mobile-menu"
                  id={MENU_ID}
                  ref={sheetRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={ru.header.menuLabel}
                  initial={{ opacity: 0, y: reduced ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -8 }}
                  transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                  className="fixed inset-x-0 top-14 z-40 flex max-h-[calc(100dvh-3.5rem)] flex-col rounded-b-2xl bg-white shadow-lg sm:hidden"
                >
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-1 pt-4">
                    {profile && (
                      <div className="mb-3 overflow-hidden rounded-2xl border border-header-edge bg-card">
                        <ProfileMenu
                          profile={profile}
                          onProfileChange={setProfile}
                          variant="row"
                          onDone={close}
                        />
                      </div>
                    )}
                    <ul className="divide-y divide-header-edge overflow-hidden rounded-2xl border border-header-edge bg-card">
                      {[
                        {
                          href: "/",
                          label: ru.header.nav.home,
                          Icon: HomeIcon,
                        },
                        {
                          href: "/about",
                          label: ru.header.nav.about,
                          Icon: LeafIcon,
                        },
                      ].map(({ href, label, Icon }) => {
                        const active = pathname === href;
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              onClick={close}
                              aria-current={active ? "page" : undefined}
                              className="flex min-h-[52px] items-center gap-3 px-4 transition-colors hover:bg-header-mint-soft active:bg-header-mint-soft"
                            >
                              <span
                                aria-hidden
                                className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                                  active
                                    ? "bg-header-accent text-accent-contrast"
                                    : "bg-header-mint-soft text-header-accent"
                                }`}
                              >
                                <Icon size={18} />
                              </span>
                              <span
                                className={`flex-1 text-base ${
                                  active
                                    ? "font-bold text-header-accent-strong"
                                    : "font-medium text-header-fg"
                                }`}
                              >
                                {label}
                              </span>
                              <ChevronRightIcon
                                size={16}
                                className="text-fg-faint"
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* язык и главная кнопка — внизу шторки, ближе к большому пальцу */}
                  <div className="flex flex-col gap-3 px-5 pb-5 pt-3">
                    <LanguageSwitcher variant="row" onDone={close} />
                    <Link
                      href="/chat"
                      onClick={close}
                      className="flex min-h-12 items-center justify-center rounded-control bg-header-accent px-5 text-[15px] font-semibold text-accent-contrast transition-colors hover:bg-header-accent-strong active:translate-y-px"
                    >
                      {ru.header.startChat}
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}
