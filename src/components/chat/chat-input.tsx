"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useI18n } from "@/src/i18n/client";
import { CameraIcon, SendIcon } from "@/src/components/ui/icons";

interface ChatInputProps {
  pending: boolean;
  onSend: (text: string, image?: File) => void;
}

export function ChatInput({ pending, onSend }: ChatInputProps) {
  const { dict: ru } = useI18n();
  const [value, setValue] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || (!value.trim() && !image)) return;
    onSend(value, image ?? undefined);
    setValue("");
    setImage(null);
  };

  const onFileChange = () => {
    const file = fileRef.current?.files?.[0];
    if (file && !pending) setImage(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form
      onSubmit={submit}
      className="
    relative
    z-20
    flex-none
    border-t
    border-[#e8efe8]
    bg-[linear-gradient(180deg,rgba(255,255,255,.96),rgba(247,251,246,.98))]
    px-4
    pt-3
    pb-[max(1rem,env(safe-area-inset-bottom))]
    sm:px-6
  "
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onFileChange}
        tabIndex={-1}
        aria-hidden
      />
      {image && (
        <div className="mb-2.5 flex animate-fade-up items-center justify-between gap-3 rounded-[15px] border border-[#cfe7d3] bg-[linear-gradient(135deg,rgba(235,249,238,0.96),rgba(246,252,246,0.96))] px-3 py-2.5 motion-reduce:animate-none">
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-9 flex-none place-items-center rounded-[11px] bg-card text-accent shadow-[0_5px_13px_rgba(6,78,59,0.07)]"
            >
              <CameraIcon size={16} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-[12px] font-extrabold text-[#234637]">
                {ru.chat.imageChipTitle}
              </strong>
              <small className="block truncate text-[10px] text-fg-faint">
                {image.name || ru.chat.imageChipNote}
              </small>
            </span>
          </span>
          <button
            type="button"
            onClick={() => setImage(null)}
            aria-label={ru.chat.removeImageLabel}
            className="grid size-7 flex-none place-items-center rounded-lg bg-white/80 text-fg-faint transition-colors hover:bg-white hover:text-danger"
          >
            ✕
          </button>
        </div>
      )}
      <div className="rounded-[18px] bg-[linear-gradient(120deg,rgba(22,163,74,0.34),rgba(132,204,22,0.14)_42%,rgba(255,255,255,0.95)_72%,rgba(22,163,74,0.24))] p-px shadow-[0_13px_34px_rgba(6,78,59,0.09)] transition-shadow duration-200 focus-within:bg-[linear-gradient(120deg,rgba(22,163,74,0.55),rgba(132,204,22,0.3)_42%,rgba(255,255,255,0.95)_72%,rgba(22,163,74,0.45))] focus-within:shadow-[0_0_0_4px_rgba(31,145,83,0.14),0_13px_34px_rgba(6,78,59,0.12)]">
        <div className="flex items-center gap-2 rounded-[17px] bg-white/[0.97] px-2 py-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
            aria-label={ru.chat.attachLabel}
            className="grid size-10 flex-none place-items-center rounded-[12px] border border-[#d0e5d3] bg-[linear-gradient(180deg,#fff,#f8fbf8)] text-[#52675d] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-px hover:border-[#9ed2a8] hover:bg-mint-soft motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CameraIcon size={18} strokeWidth={2} />
          </button>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={ru.chat.inputPlaceholder}
            className="chat-input-field h-10 min-w-0 flex-1 border-none bg-transparent px-1.5 text-base text-fg outline-none placeholder:text-fg-faint"
          />
          <button
            type="submit"
            disabled={pending || (!value.trim() && !image)}
            aria-label={ru.chat.sendLabel}
            className="grid size-10 flex-none place-items-center rounded-[12px] bg-[linear-gradient(145deg,#1bb052,#12853d)] text-white shadow-[0_9px_20px_rgba(22,163,74,0.24)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_13px_25px_rgba(22,163,74,0.31)] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_9px_20px_rgba(22,163,74,0.24)]"
          >
            <SendIcon size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </form>
  );
}
