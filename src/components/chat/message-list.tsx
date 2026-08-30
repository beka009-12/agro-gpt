"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/src/i18n/client";
import { PlantIcon } from "@/src/components/ui/icons";
import { BotMarkdown } from "./bot-markdown";
import { EmptyState } from "./empty-state";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "./types";

interface MessageListProps {
  messages: ChatMessage[];
  pending: boolean;
}

export function MessageList({ messages, pending }: MessageListProps) {
  const { dict } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length, pending]);

  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage]);

  const isEmpty = messages.length === 0 && !pending;

  return (
    <>
      <div
        ref={scrollRef}
        aria-live="polite"
        className={`flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 [webkit-overflow-scrolling:touch] sm:p-6 ${
          isEmpty ? "items-center" : ""
        }`}
      >
        {isEmpty && (
          <div className="flex w-full flex-1 items-center justify-center py-6 sm:py-10">
            <EmptyState />
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            {message.role === "bot" ? (
              <div className="flex items-start justify-start gap-2.5 pr-[8%] sm:pr-[16%]">
                <span
                  aria-hidden
                  className="mt-0.5 grid size-8 flex-none place-items-center rounded-lg bg-accent-soft text-accent"
                >
                  <PlantIcon size={17} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 rounded-[4px_16px_16px_16px] border border-edge bg-surface-muted px-4 py-3 text-sm leading-relaxed text-fg-muted">
                  <BotMarkdown text={message.text} />
                </div>
              </div>
            ) : (
              <div className="flex justify-end pl-[8%] sm:pl-[16%]">
                <div className="flex max-w-full flex-col items-end gap-2">
                  {message.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveImage(message.imageUrl ?? null)}
                      aria-label={dict.chat.imagePreviewLabel}
                      className="group overflow-hidden rounded-[16px_16px_4px_16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      <Image
                        src={message.imageUrl}
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
            )}
          </div>
        ))}

        {pending && <TypingIndicator />}
      </div>

      {activeImage && (
        <button
          type="button"
          onClick={() => setActiveImage(null)}
          aria-label={dict.chat.closeImageLabel}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="relative block h-[90vh] w-[90vw]">
            <Image
              src={activeImage}
              alt={dict.chat.enlargedImageAlt}
              fill
              sizes="90vw"
              unoptimized
              className="object-contain"
            />
          </span>
        </button>
      )}
    </>
  );
}
