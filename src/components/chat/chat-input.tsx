"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useI18n } from "@/src/i18n/client";
import { CameraIcon, SendIcon, XIcon } from "@/src/components/ui/icons";
import { shouldSubmitChatInput } from "./chat-input-keyboard";

interface ChatInputProps {
  pending: boolean;
  onSend: (text: string, image?: File) => void;
}

export function ChatInput({ pending, onSend }: ChatInputProps) {
  const { dict } = useI18n();
  const [value, setValue] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [value]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || (!value.trim() && !image)) return;

    onSend(value, image ?? undefined);
    setValue("");
    setImage(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      shouldSubmitChatInput({
        key: event.key,
        shiftKey: event.shiftKey,
        composing: event.nativeEvent.isComposing,
        hasContent: Boolean(value.trim() || image),
      })
    ) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const onFileChange = () => {
    const file = fileRef.current?.files?.[0];
    if (file && !pending) setImage(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="relative z-20 flex-none border-t border-edge bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-4"
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        aria-label={dict.chat.attachLabel}
        className="hidden"
        tabIndex={-1}
      />

      {image && (
        <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-edge bg-surface-muted px-3 py-2">
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-9 flex-none place-items-center rounded-lg bg-white text-accent"
            >
              <CameraIcon size={17} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-xs font-bold text-fg">
                {dict.chat.imageChipTitle}
              </strong>
              <small className="block truncate text-[11px] text-fg-faint">
                {image.name || dict.chat.imageChipNote}
              </small>
            </span>
          </span>

          <button
            type="button"
            onClick={() => setImage(null)}
            aria-label={dict.chat.removeImageLabel}
            className="grid size-9 flex-none place-items-center rounded-lg text-fg-faint transition-colors duration-150 hover:bg-white hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <XIcon size={17} />
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-edge bg-white p-1.5 shadow-[0_8px_24px_rgba(6,48,34,0.07)] transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.1),0_8px_24px_rgba(6,48,34,0.08)]">
        <div className="flex min-w-0 items-end gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
            aria-label={dict.chat.attachLabel}
            className="grid size-11 flex-none place-items-center rounded-xl text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CameraIcon size={20} strokeWidth={2} />
          </button>

          <label htmlFor="chat-message" className="sr-only">
            {dict.chat.inputPlaceholder}
          </label>
          <textarea
            ref={textareaRef}
            id="chat-message"
            rows={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={pending}
            placeholder={dict.chat.inputPlaceholder}
            enterKeyHint="send"
            autoComplete="off"
            className="max-h-32 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto border-none bg-transparent px-1.5 py-[11px] text-base leading-[22px] text-fg outline-none placeholder:text-fg-faint disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={pending || (!value.trim() && !image)}
            aria-label={dict.chat.sendLabel}
            className="grid size-11 flex-none place-items-center rounded-xl bg-accent text-accent-contrast transition-colors duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-faint"
          >
            <SendIcon size={19} strokeWidth={2} />
          </button>
        </div>
      </div>

      <p className="mt-2 hidden text-center text-[11px] text-fg-faint sm:block">
        {dict.chat.inputHint}
      </p>
    </form>
  );
}
