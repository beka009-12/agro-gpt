"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import {
  ArrowCounterClockwiseIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@/src/components/ui/icons";
import { SPRING_SNAPPY } from "@/src/lib/motion-tokens";
import type { ChatListItemSchema } from "@/src/api/generated/models";

interface ChatHistoryItemProps {
  item: ChatListItemSchema;
  isActive: boolean;
  isTrash: boolean;
  isRenaming: boolean;
  isPendingDelete: boolean;
  onSelect: (id: string) => void;
  onStartRename: (id: string) => void;
  onCancelRename: () => void;
  onSubmitRename: (id: string, title: string) => void;
  onRequestDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function ChatHistoryItem({
  item,
  isActive,
  isTrash,
  isRenaming,
  isPendingDelete,
  onSelect,
  onStartRename,
  onCancelRename,
  onSubmitRename,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onRestore,
}: ChatHistoryItemProps) {
  const { dict, locale } = useI18n();
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState(item.title ?? "");
  const [trackedRenaming, setTrackedRenaming] = useState(isRenaming);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = `chat-actions-${item.id}`;

  if (isRenaming !== trackedRenaming) {
    setTrackedRenaming(isRenaming);
    if (isRenaming) setDraft(item.title ?? "");
  }

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const displayTitle =
    item.title ??
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(
      new Date(item.last_message_at),
    );

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.title) onSubmitRename(item.id, trimmed);
    else onCancelRename();
  };

  if (isRenaming) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitRename();
          if (event.key === "Escape") onCancelRename();
        }}
        onBlur={commitRename}
        aria-label={dict.chat.history.renameInputLabel}
        maxLength={200}
        className="w-full rounded-md border border-accent bg-white px-2 py-1.5 text-sm text-fg focus-visible:outline-none"
      />
    );
  }

  // кнопка действий видна при наведении, на активном чате, с открытым меню и всегда на тач-экранах
  const actionsVisible =
    isActive || menuOpen
      ? "opacity-100"
      : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100";

  return (
    <div ref={rootRef} className="group relative">
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-current={isActive ? "page" : undefined}
        className={`flex min-h-11 w-full min-w-0 items-center rounded-lg py-1.5 pl-2.5 pr-11 text-left transition-colors duration-150 ${
          isActive
            ? "bg-accent-soft text-accent-strong"
            : "text-fg hover:bg-surface-muted"
        }`}
      >
        <span className="truncate text-sm" title={displayTitle}>
          {displayTitle}
        </span>
      </button>

      <div
        className={`absolute right-1 top-1/2 -translate-y-1/2 transition-opacity duration-150 ${actionsVisible}`}
      >
        {isTrash ? (
          <button
            type="button"
            onClick={() => onRestore(item.id)}
            aria-label={dict.chat.history.restore}
            title={dict.chat.history.restore}
            className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-white hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowCounterClockwiseIcon size={17} strokeWidth={1.8} />
          </button>
        ) : (
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={dict.chat.history.actions}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-white hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <DotsThreeIcon size={20} weight="bold" />
          </button>
        )}
      </div>

      {menuOpen && (
        <div
          id={menuId}
          className="absolute right-1 top-full z-20 mt-1 flex w-52 flex-col rounded-xl border border-edge bg-white p-1 text-sm shadow-[0_12px_32px_rgba(6,40,28,0.16)]"
        >
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onStartRename(item.id);
            }}
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-fg hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
          >
            <PencilSimpleIcon size={16} strokeWidth={1.8} className="text-fg-muted" />
            {dict.chat.history.rename}
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onRequestDelete(item.id);
            }}
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-left text-danger hover:bg-danger/5 focus-visible:bg-danger/5 focus-visible:outline-none"
          >
            <TrashIcon size={16} strokeWidth={1.8} />
            {dict.chat.history.delete}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isPendingDelete && (
          <motion.div
            key="confirm-delete"
            role="alertdialog"
            aria-label={dict.chat.history.confirmDeleteTitle.replace("{title}", displayTitle)}
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING_SNAPPY}
            className="absolute right-0 top-full z-10 mt-1 w-56 rounded-xl border border-edge bg-white p-3 text-sm shadow-[0_12px_32px_rgba(6,40,28,0.16)]"
          >
            <p className="mb-2 text-fg">
              {dict.chat.history.confirmDeleteTitle.replace("{title}", displayTitle)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelDelete}
                className="rounded-lg px-2.5 py-1.5 text-fg-muted hover:bg-surface-muted"
              >
                {dict.chat.history.confirmDeleteCancel}
              </button>
              <button
                type="button"
                onClick={() => onConfirmDelete(item.id)}
                className="rounded-lg bg-danger px-2.5 py-1.5 font-semibold text-white hover:bg-danger/90"
              >
                {dict.chat.history.confirmDeleteConfirm}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
