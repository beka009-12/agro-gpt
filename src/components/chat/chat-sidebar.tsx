"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useI18n } from "@/src/i18n/client";
import { PlusIcon, SidebarIcon, XIcon } from "@/src/components/ui/icons";
import { LanguageSwitcher } from "@/src/components/layout/language-switcher";
import { LogoMark } from "@/src/components/layout/logo";
import { ProfileMenu } from "@/src/components/layout/profile-menu";
import type { UserProfile } from "@/src/lib/profile-schemas";

interface ChatSidebarProps {
  onNewChat: () => void;
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
  isDesktop: boolean;
  desktopExpanded: boolean;
  mobileOpen: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function ChatSidebar({
  onNewChat,
  profile,
  onProfileChange,
  isDesktop,
  desktopExpanded,
  mobileOpen,
  triggerRef,
  onToggle,
  onClose,
}: ChatSidebarProps) {
  const { dict } = useI18n();
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasMobileOpenRef = useRef(false);
  const expanded = !isDesktop || desktopExpanded;
  const visible = isDesktop || mobileOpen;

  useEffect(() => {
    if (isDesktop) {
      wasMobileOpenRef.current = false;
      return;
    }

    if (!mobileOpen) {
      if (wasMobileOpenRef.current) triggerRef.current?.focus();
      wasMobileOpenRef.current = false;
      return;
    }

    wasMobileOpenRef.current = true;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        asideRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDesktop, mobileOpen, onClose, triggerRef]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={dict.chat.closeSidebarLabel}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#071c13]/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        ref={asideRef}
        role={isDesktop ? "complementary" : "dialog"}
        aria-label={dict.chat.sidebarLabel}
        aria-modal={!isDesktop && mobileOpen ? true : undefined}
        aria-hidden={!visible}
        inert={!visible ? true : undefined}
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[min(84vw,304px)] flex-col overflow-hidden border-r border-edge bg-white transition-[transform,width,box-shadow] duration-200 ease-out lg:static lg:z-auto lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
          mobileOpen
            ? "translate-x-0 shadow-[20px_0_48px_rgba(6,40,28,0.16)]"
            : "pointer-events-none -translate-x-full shadow-none lg:pointer-events-auto"
        } ${desktopExpanded ? "lg:w-[272px]" : "lg:w-[72px]"}`}
      >
        <div
          className={`flex h-[72px] flex-none items-center border-b border-edge ${
            expanded ? "justify-between px-4" : "justify-center px-2"
          }`}
        >
          {expanded && (
            <Link
              href="/"
              aria-label={dict.header.logoAria}
              className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <LogoMark size={28} />
              <span className="text-lg font-bold tracking-tight text-fg">ibo</span>
            </Link>
          )}

          <button
            ref={closeButtonRef}
            type="button"
            onClick={isDesktop ? onToggle : onClose}
            className="grid size-11 flex-none place-items-center rounded-xl text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={
              isDesktop
                ? desktopExpanded
                  ? dict.chat.collapseSidebarLabel
                  : dict.chat.expandSidebarLabel
                : dict.chat.closeSidebarLabel
            }
          >
            {isDesktop ? <SidebarIcon size={21} /> : <XIcon size={20} />}
          </button>
        </div>

        <div className="px-3 py-4">
          <button
            type="button"
            onClick={onNewChat}
            aria-label={!expanded ? dict.chat.newChat : undefined}
            className={`flex min-h-11 items-center rounded-xl bg-accent font-bold text-accent-contrast transition-colors duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
              expanded
                ? "w-full justify-center gap-2.5 px-4 text-sm"
                : "size-12 justify-center"
            }`}
          >
            <PlusIcon size={18} strokeWidth={2.25} />
            {expanded && <span>{dict.chat.newChat}</span>}
          </button>
        </div>

        <div className="flex-1" />

        <div
          className={`flex flex-none border-t border-edge py-3 ${
            expanded
              ? "items-center justify-between gap-2 px-3"
              : "flex-col items-center gap-2 px-2"
          }`}
        >
          {expanded && <LanguageSwitcher />}
          {profile && (
            <ProfileMenu profile={profile} onProfileChange={onProfileChange} />
          )}
        </div>
      </aside>
    </>
  );
}
