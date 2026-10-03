"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import {
  ArrowCounterClockwiseIcon,
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={`flex min-h-9 w-full min-w-0 items-center truncate rounded-lg py-1.5 pl-2 pr-9 text-left text-sm transition-colors duration-150 [@media(hover:none)]:pr-16 ${
          isActive
            ? "bg-accent-soft text-accent-strong"
            : "text-fg-muted hover:bg-surface-muted hover:text-fg"
        }`}
      >
        <span className="truncate" title={displayTitle}>{displayTitle}</span>
      </button>

      <div className="absolute right-1 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        {isTrash ? (
          <button
            type="button"
            onClick={() => onRestore(item.id)}
            aria-label={dict.chat.history.restore}
            className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg"
          >
            <ArrowCounterClockwiseIcon size={16} strokeWidth={1.8} />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onStartRename(item.id)}
              aria-label={dict.chat.history.rename}
              className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg"
            >
              <PencilSimpleIcon size={16} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => onRequestDelete(item.id)}
              aria-label={dict.chat.history.delete}
              className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-danger"
            >
              <TrashIcon size={16} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

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
