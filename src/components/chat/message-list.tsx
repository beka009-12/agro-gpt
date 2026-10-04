"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/src/i18n/client";
import { EmptyState } from "./empty-state";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "./types";

interface MessageListProps {
  messages: ChatMessage[];
  pending: boolean;
  loading?: boolean;
  hasMoreOlder?: boolean;
  onLoadOlder?: () => void;
}

function HistorySkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="ml-auto h-11 w-[42%] rounded-[16px_16px_4px_16px] bg-accent-soft motion-safe:animate-pulse" />
      <div className="flex items-start gap-2.5 pr-[8%] sm:pr-[16%]">
        <span className="size-8 flex-none rounded-lg bg-accent-soft" />
        <div className="h-32 flex-1 rounded-[4px_16px_16px_16px] border border-edge bg-surface-muted motion-safe:animate-pulse" />
      </div>
      <div className="ml-auto h-11 w-[30%] rounded-[16px_16px_4px_16px] bg-accent-soft motion-safe:animate-pulse" />
      <div className="flex items-start gap-2.5 pr-[8%] sm:pr-[16%]">
        <span className="size-8 flex-none rounded-lg bg-accent-soft" />
        <div className="h-20 flex-1 rounded-[4px_16px_16px_16px] border border-edge bg-surface-muted motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  pending,
  loading = false,
  hasMoreOlder = false,
  onLoadOlder,
}: MessageListProps) {
  const { dict } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const firstMessageIdRef = useRef<string | undefined>(undefined);
  const lastScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const firstId = messages.at(0)?.id;
    const prepended =
      firstMessageIdRef.current !== undefined &&
      firstId !== firstMessageIdRef.current;

    if (prepended) {
      // сверху подгрузились старые сообщения — держим текущий экран на месте
      element.scrollTop += element.scrollHeight - lastScrollHeightRef.current;
    } else {
      element.scrollTop = element.scrollHeight;
    }

    firstMessageIdRef.current = firstId;
    lastScrollHeightRef.current = element.scrollHeight;
  }, [messages, pending, loading]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element || !hasMoreOlder || !onLoadOlder) return;
    if (element.scrollTop < 80) onLoadOlder();
  };

  useEffect(() => {
    if (!activeImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage]);

  const isEmpty = messages.length === 0 && !pending && !loading;

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        aria-live="polite"
        aria-busy={loading}
        className={`chat-dot-grid relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 [webkit-overflow-scrolling:touch] sm:p-6 ${
          isEmpty ? "items-center" : ""
        }`}
      >
        {isEmpty && (
          <div className="relative flex w-full flex-1 items-center justify-center py-6 sm:py-10">
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[90px]"
            />
            <EmptyState />
          </div>
        )}

        {loading && <HistorySkeleton />}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onOpenImage={setActiveImage}
          />
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
