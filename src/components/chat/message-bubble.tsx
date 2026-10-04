"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/src/i18n/client";
import { PlantIcon } from "@/src/components/ui/icons";
import type { BotMarkdown as BotMarkdownComponent } from "./bot-markdown";
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
      <div className="flex items-start justify-start gap-2.5 pr-[8%] sm:pr-[16%]">
        <span
          aria-hidden
          className="mt-0.5 grid size-8 flex-none place-items-center rounded-lg bg-accent-soft text-accent"
        >
          <PlantIcon size={17} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 rounded-[4px_16px_16px_16px] border border-edge bg-surface-muted px-4 py-3 text-sm leading-relaxed text-fg-muted">
          <BotText text={message.text} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end pl-[8%] sm:pl-[16%]">
      <div className="flex max-w-full flex-col items-end gap-2">
        {imageUrl && (
          <button
            type="button"
            onClick={() => onOpenImage(imageUrl)}
            aria-label={dict.chat.imagePreviewLabel}
            className="group overflow-hidden rounded-[16px_16px_4px_16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
          <div className="whitespace-pre-wrap rounded-[16px_16px_4px_16px] bg-accent px-4 py-3 text-sm leading-relaxed text-accent-contrast">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
});
