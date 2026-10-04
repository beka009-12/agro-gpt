"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useI18n } from "@/src/i18n/client";
import {
  AlertTriangleIcon,
  ArrowCounterClockwiseIcon,
  CheckIcon,
  CopyIcon,
  PlantIcon,
} from "@/src/components/ui/icons";
import type { BotMarkdown as BotMarkdownComponent } from "./bot-markdown";
import { markdownToPlainText } from "./markdown-plain-text";
import type { ChatMessage } from "./types";

let BotMarkdown: typeof BotMarkdownComponent | null = null;

// парсер markdown (~50 KB gz) не нужен до первого ответа — грузим вне критического пути.
// ChatView дожидается его перед показом ответов, чтобы текст не прыгал при подмене.
export async function preloadBotMarkdown(): Promise<void> {
  if (BotMarkdown) return;
  try {
    BotMarkdown = (await import("./bot-markdown")).BotMarkdown;
  } catch (error) {
    console.error("[chat] markdown chunk failed to load:", error);
  }
}

function BotText({ text }: { text: string }) {
  const [ready, setReady] = useState(() => BotMarkdown !== null);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;

    const load = async () => {
      await preloadBotMarkdown();
      if (!cancelled && BotMarkdown) setReady(true);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (ready && BotMarkdown) return <BotMarkdown text={text} />;
  return <p className="whitespace-pre-wrap">{text}</p>;
}

function CopyButton({ text }: { text: string }) {
  const { dict } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdownToPlainText(text));
      setCopied(true);
    } catch (error) {
      console.error("[chat] copy failed:", error);
      toast.error(dict.chat.copyFailed);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={copied ? dict.chat.copied : dict.chat.copy}
        title={dict.chat.copy}
        className="-ml-3 grid size-11 place-items-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {copied ? (
          <CheckIcon size={18} strokeWidth={2} className="text-accent" />
        ) : (
          <CopyIcon size={18} />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? dict.chat.copied : ""}
      </span>
    </>
  );
}

interface ErrorNoticeProps {
  message: ChatMessage;
  disabled: boolean;
  onRetry: (message: ChatMessage) => void;
}

export function ErrorNotice({ message, disabled, onRetry }: ErrorNoticeProps) {
  const { dict } = useI18n();

  return (
    <div
      data-message-id={message.id}
      role="alert"
      className="flex w-fit max-w-[70ch] items-start gap-3 rounded-2xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger sm:ml-9"
    >
      <AlertTriangleIcon size={18} className="mt-0.5 flex-none" />
      <div className="min-w-0 flex-1">
        <p className="leading-relaxed">{message.text}</p>
        {message.retry && (
          <button
            type="button"
            onClick={() => onRetry(message)}
            disabled={disabled}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-danger/20 bg-white px-3.5 text-sm font-bold text-danger transition-colors duration-150 hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowCounterClockwiseIcon size={16} strokeWidth={2} />
            {dict.chat.retry}
          </button>
        )}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenImage: (url: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  onOpenImage,
}: MessageBubbleProps) {
  const { dict } = useI18n();
  const { imageUrl } = message;

  if (message.role === "bot") {
    return (
      <div data-message-id={message.id} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-fg">
          <span
            aria-hidden
            className="grid size-7 flex-none place-items-center rounded-lg bg-accent-soft text-accent"
          >
            <PlantIcon size={15} strokeWidth={1.8} />
          </span>
          {dict.chat.assistantLabel}
        </div>
        <div className="flex max-w-[70ch] flex-col gap-1 sm:pl-9">
          <div className="text-[15px] leading-[1.7] text-fg sm:text-base">
            <BotText text={message.text} />
          </div>
          <CopyButton text={message.text} />
        </div>
      </div>
    );
  }

  return (
    <div
      data-message-id={message.id}
      className="flex justify-end pl-[8%] sm:pl-[16%]"
    >
      <div className="flex max-w-full flex-col items-end gap-2">
        {imageUrl && (
          <button
            type="button"
            onClick={() => onOpenImage(imageUrl)}
            aria-label={dict.chat.imagePreviewLabel}
            className="group overflow-hidden rounded-[18px_18px_6px_18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <Image
              src={imageUrl}
              alt={message.imageName ?? dict.chat.imageChipTitle}
              width={288}
              height={192}
              sizes="(max-width: 640px) 70vw, 288px"
              unoptimized
              className="h-48 w-72 max-w-[70vw] cursor-zoom-in object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </button>
        )}

        {message.text && (
          <div className="whitespace-pre-wrap rounded-[18px_18px_6px_18px] bg-accent px-4 py-2.5 text-[15px] leading-relaxed text-accent-contrast">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
});
