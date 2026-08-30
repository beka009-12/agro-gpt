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
      className="relative z-20 flex-none bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-3"
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

      <div className="rounded-[22px] border border-edge bg-white p-2 shadow-[0_10px_32px_rgba(6,48,34,0.08)] transition-[border-color,box-shadow] duration-150 focus-within:border-accent/70 focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.1),0_12px_36px_rgba(6,48,34,0.1)]">
        {image && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-accent-soft px-3 py-2">
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className="grid size-9 flex-none place-items-center rounded-lg bg-white text-accent shadow-[0_3px_10px_rgba(6,48,34,0.06)]"
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
          className="chat-input-field max-h-32 min-h-[52px] w-full resize-none overflow-y-auto border-none bg-transparent px-3 py-3 text-base leading-[24px] text-fg outline-none placeholder:text-fg-faint disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="flex min-w-0 items-center gap-2 px-0.5 pt-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
            aria-label={dict.chat.attachLabel}
            className="grid size-11 flex-none place-items-center rounded-full border border-edge bg-surface-muted text-fg-muted transition-[border-color,background-color,color] duration-150 hover:border-accent/40 hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CameraIcon size={20} strokeWidth={2} />
          </button>

          <p className="ml-1 hidden min-w-0 flex-1 text-left text-[11px] font-medium text-fg-faint sm:block">
            {dict.chat.inputHint}
          </p>
          <span aria-hidden className="flex-1 sm:hidden" />

          <button
            type="submit"
            disabled={pending || (!value.trim() && !image)}
            aria-label={dict.chat.sendLabel}
            className="grid size-11 flex-none place-items-center rounded-full bg-accent text-accent-contrast shadow-[0_6px_16px_rgba(22,163,74,0.22)] transition-[background-color,box-shadow] duration-150 hover:bg-accent-strong hover:shadow-[0_8px_20px_rgba(22,163,74,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-accent-soft disabled:text-accent/40 disabled:shadow-none"
          >
            <SendIcon size={19} strokeWidth={2} />
          </button>
        </div>
      </div>
    </form>
  );
}
