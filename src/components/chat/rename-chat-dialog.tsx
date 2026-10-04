"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import type { ChatListItemSchema } from "@/src/api/generated/models";
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens";
import { getDialogFocusTarget } from "@/src/components/landing/disease-details-dialog";
import { canSubmitRename } from "./chat-history-state";

const FOCUSABLE_SELECTOR = "input:not([disabled]), button:not([disabled])";
const TITLE_MAX_LENGTH = 200;

interface RenameChatDialogProps {
  chat: ChatListItemSchema | null;
  onSubmit: (id: string, title: string) => void;
  onClose: () => void;
}

interface RenameFormProps {
  chat: ChatListItemSchema;
  onSubmit: (id: string, title: string) => void;
  onClose: () => void;
}

function RenameForm({ chat, onSubmit, onClose }: RenameFormProps) {
  const { dict } = useI18n();
  const [draft, setDraft] = useState(chat.title ?? "");
  const canSave = canSubmitRename(draft, chat.title);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave) onSubmit(chat.id, draft.trim());
  };

  return (
    <form
      onSubmit={submit}
      className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:p-6"
    >
      <h2 id="rename-chat-title" className="text-lg font-extrabold text-fg">
        {dict.chat.history.rename}
      </h2>

      <label
        htmlFor="rename-chat-input"
        className="mt-4 block text-sm font-semibold text-fg-muted"
      >
        {dict.chat.history.renameInputLabel}
      </label>
      <input
        id="rename-chat-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={TITLE_MAX_LENGTH}
        autoComplete="off"
        enterKeyHint="done"
        className="rename-chat-input mt-1.5 h-12 w-full rounded-xl border border-edge bg-white px-3.5 text-base text-fg transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent/15"
      />

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl px-4 text-sm font-semibold text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {dict.chat.history.cancel}
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="min-h-11 rounded-xl bg-accent px-5 text-sm font-bold text-accent-contrast transition-colors duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-accent-soft disabled:text-accent/50"
        >
          {dict.chat.history.save}
        </button>
      </div>
    </form>
  );
}

export function RenameChatDialog({ chat, onSubmit, onClose }: RenameChatDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const reduced = useReducedMotion();
  const open = chat !== null;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;

    // stopPropagation: Esc/Tab не должны дойти до обработчиков мобильного сайдбара под модалкой
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      event.stopPropagation();

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      const activeIndex = focusable.findIndex((element) => element === document.activeElement);
      const targetIndex = getDialogFocusTarget({
        activeIndex,
        focusableCount: focusable.length,
        shiftKey: event.shiftKey,
      });
      if (targetIndex === null) return;
      event.preventDefault();
      focusable[targetIndex]?.focus();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    // фокус переносим только после того, как запомнили, куда его вернуть
    const input = dialogRef.current?.querySelector<HTMLInputElement>("#rename-chat-input");
    input?.focus();
    input?.select();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {chat && (
        <motion.div
          key="rename-chat-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast }}
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-5"
        >
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-chat-title"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
            transition={{ duration: DURATION.base * 0.72, ease: EASE_OUT }}
            className="relative w-full max-w-md overflow-hidden rounded-t-[26px] border border-edge bg-white shadow-[0_-18px_55px_rgba(6,78,59,0.2)] sm:rounded-[24px] sm:shadow-[0_24px_70px_rgba(6,78,59,0.2)]"
          >
            <span
              aria-hidden
              className="mx-auto mt-2.5 block h-1 w-10 rounded-full bg-edge sm:hidden"
            />
            <RenameForm key={chat.id} chat={chat} onSubmit={onSubmit} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
