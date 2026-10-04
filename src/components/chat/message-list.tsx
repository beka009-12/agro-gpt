"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import { ChevronDownIcon } from "@/src/components/ui/icons";
import { ErrorNotice, MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "./types";

// насколько пользователь должен отлистать вверх, чтобы показать кнопку «вниз»
const JUMP_BUTTON_THRESHOLD = 240;
const ANSWER_SCROLL_GAP = 16;

interface MessageListProps {
  messages: ChatMessage[];
  pending: boolean;
  loading?: boolean;
  hasMoreOlder?: boolean;
  emptyState: ReactNode;
  onLoadOlder?: () => void;
  onRetry: (message: ChatMessage) => void;
}

function HistorySkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="ml-auto h-11 w-[42%] rounded-[18px_18px_6px_18px] bg-accent-soft motion-safe:animate-pulse" />
      <div className="flex flex-col gap-2">
        <span className="h-7 w-36 rounded-lg bg-accent-soft" />
        <div className="h-28 max-w-[70ch] rounded-xl bg-surface-muted motion-safe:animate-pulse sm:ml-9" />
      </div>
      <div className="ml-auto h-11 w-[30%] rounded-[18px_18px_6px_18px] bg-accent-soft motion-safe:animate-pulse" />
    </div>
  );
}

// новый ответ показываем с вопроса над ним, а не с конца: длинный текст читают сверху
function scrollToAnswer(container: HTMLElement, answerId: string): void {
  const nodes = container.querySelectorAll<HTMLElement>("[data-message-id]");
  const answer = Array.from(nodes).find(
    (node) => node.dataset.messageId === answerId,
  );
  if (!answer) return;

  const containerTop = container.getBoundingClientRect().top;
  const answerTop = answer.getBoundingClientRect().top - containerTop;
  const question = answer.previousElementSibling;
  const questionTop =
    question instanceof HTMLElement && question.dataset.messageId
      ? question.getBoundingClientRect().top - containerTop
      : answerTop;
  const anchor =
    answerTop - questionTop > container.clientHeight / 2 ? answerTop : questionTop;

  container.scrollTop += anchor - ANSWER_SCROLL_GAP;
}

export function MessageList({
  messages,
  pending,
  loading = false,
  hasMoreOlder = false,
  emptyState,
  onLoadOlder,
  onRetry,
}: MessageListProps) {
  const { dict } = useI18n();
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showJump, setShowJump] = useState(false);
  const firstMessageIdRef = useRef<string | undefined>(undefined);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const lastScrollHeightRef = useRef(0);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const firstId = messages.at(0)?.id;
    const last = messages.at(-1);
    const prepended =
      firstMessageIdRef.current !== undefined &&
      firstId !== firstMessageIdRef.current;
    const answerArrived =
      lastMessageIdRef.current !== undefined &&
      last !== undefined &&
      last.id !== lastMessageIdRef.current &&
      last.role === "bot";

    if (prepended) {
      // сверху подгрузились старые сообщения — держим текущий экран на месте
      element.scrollTop += element.scrollHeight - lastScrollHeightRef.current;
    } else if (answerArrived) {
      scrollToAnswer(element, last.id);
    } else if (messages.length === 0 && !pending) {
      // стартовый экран длиннее маленьких телефонов — заголовок должен быть виден
      element.scrollTop = 0;
    } else {
      element.scrollTop = element.scrollHeight;
    }

    firstMessageIdRef.current = firstId;
    lastMessageIdRef.current = last?.id;
    lastScrollHeightRef.current = element.scrollHeight;
  }, [messages, pending, loading]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    setShowJump(distanceToBottom > JUMP_BUTTON_THRESHOLD);

    if (hasMoreOlder && onLoadOlder && element.scrollTop < 80) onLoadOlder();
  };

  const jumpToBottom = () => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: reduced ? "auto" : "smooth",
    });
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
  const pendingWithPhoto = pending && Boolean(messages.at(-1)?.imageUrl);

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          aria-live="polite"
          aria-busy={loading}
          className={`flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-5 [webkit-overflow-scrolling:touch] sm:px-6 sm:py-6 ${
            isEmpty ? "items-center" : ""
          }`}
        >
          {isEmpty && (
            <div className="relative flex w-full flex-1 items-center justify-center py-4 sm:py-8">
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/3 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[90px]"
              />
              <div className="relative w-full">{emptyState}</div>
            </div>
          )}

          {loading && <HistorySkeleton />}

          {messages.map((message) =>
            message.role === "error" ? (
              <ErrorNotice
                key={message.id}
                message={message}
                disabled={pending}
                onRetry={onRetry}
              />
            ) : (
              <MessageBubble
                key={message.id}
                message={message}
                onOpenImage={setActiveImage}
              />
            ),
          )}

          {pending && <TypingIndicator withPhoto={pendingWithPhoto} />}
        </div>

        {showJump && (
          <button
            type="button"
            onClick={jumpToBottom}
            aria-label={dict.chat.scrollToBottom}
            className="absolute bottom-3 left-1/2 z-10 grid size-11 -translate-x-1/2 place-items-center rounded-full border border-edge bg-white text-fg-muted shadow-[0_8px_24px_rgba(6,48,34,0.14)] transition-colors duration-150 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronDownIcon size={20} strokeWidth={2} />
          </button>
        )}
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
