"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode, Ref } from "react";
import { useI18n } from "@/src/i18n/client";
import { CameraIcon, SendIcon, XIcon } from "@/src/components/ui/icons";
import { shouldSubmitChatInput } from "./chat-input-keyboard";

const MAX_TEXTAREA_HEIGHT = 160;

export interface ChatInputHandle {
  pickPhoto: () => void;
}

interface ChatInputProps {
  ref?: Ref<ChatInputHandle>;
  pending: boolean;
  notice?: ReactNode;
  onSend: (text: string, image?: File) => void;
}

export function ChatInput({ ref, pending, notice, onSend }: ChatInputProps) {
  const { dict } = useI18n();
  const [value, setValue] = useState("");
  const [image, setImageState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    pickPhoto: () => fileRef.current?.click(),
  }));

  const setImage = (file: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setImageState(file);
  };

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
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
    if (file && !pending) {
      setImage(file);
      textareaRef.current?.focus();
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="relative z-20 flex-none bg-white px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto w-full max-w-[832px]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          aria-label={dict.chat.attachLabel}
          className="hidden"
          tabIndex={-1}
        />

        {notice}

        {image && (
          <div className="mb-2 flex items-center gap-3 rounded-2xl border border-edge bg-white p-2 pr-1 shadow-[0_6px_20px_rgba(6,48,34,0.06)]">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob: превью, next/image тут не нужен
              <img
                src={previewUrl}
                alt=""
                className="size-12 flex-none rounded-xl bg-surface-muted object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-12 flex-none place-items-center rounded-xl bg-accent-soft text-accent"
              >
                <CameraIcon size={20} strokeWidth={2} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-bold text-fg">
                {dict.chat.imageChipTitle}
              </strong>
              <small className="block truncate text-xs text-fg-muted">
                {dict.chat.imageChipNote}
              </small>
            </span>
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label={dict.chat.removeImageLabel}
              className="grid size-11 flex-none place-items-center rounded-xl text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <XIcon size={18} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-[26px] border border-edge bg-white p-1.5 shadow-[0_8px_28px_rgba(6,48,34,0.08)] transition-[border-color,box-shadow] duration-150 focus-within:border-accent/70 focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.1),0_10px_32px_rgba(6,48,34,0.1)]">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
            aria-label={dict.chat.attachLabel}
            className="grid size-11 flex-none place-items-center rounded-full text-fg-muted transition-colors duration-150 hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CameraIcon size={22} strokeWidth={2} />
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
            className="chat-input-field min-h-11 min-w-0 flex-1 resize-none overflow-y-auto border-none bg-transparent px-1 py-2.5 text-base leading-6 text-fg outline-none placeholder:text-fg-faint disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={pending || (!value.trim() && !image)}
            aria-label={dict.chat.sendLabel}
            className="grid size-11 flex-none place-items-center rounded-full bg-accent text-accent-contrast shadow-[0_6px_16px_rgba(22,163,74,0.22)] transition-[background-color,box-shadow] duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-accent-soft disabled:text-accent/40 disabled:shadow-none"
          >
            <SendIcon size={19} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-2 px-2 text-center text-xs leading-snug text-fg-muted">
          {dict.chat.disclaimer}
        </p>
      </div>
    </form>
  );
}
