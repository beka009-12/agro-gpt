"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens";
import { BotMarkdown } from "./bot-markdown";
import { EmptyState } from "./empty-state";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "./types";

interface MessageListProps {
  messages: ChatMessage[];
  pending: boolean;
  onSuggestion: (text: string) => void;
}

export function MessageList({
  messages,
  pending,
  onSuggestion,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, pending]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isEmpty = messages.length === 0 && !pending;

  return (
    <>
      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex min-h-0 flex-1  flex-col gap-3.5 overflow-y-auto overscroll-contain p-4 sm:p-6"
      >
        {isEmpty && <EmptyState onSuggestion={onSuggestion} />}

        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.base, ease: EASE_OUT }}
          >
            {m.role === "bot" ? (
              <div className="flex justify-start pr-[12%]">
                <div className="min-w-0 rounded-[18px_18px_18px_6px] bg-[#f0f6ef] px-4 py-3 text-[14px] text-[#34483d]">
                  <BotMarkdown text={m.text} />
                </div>
              </div>
            ) : (
              <div className="flex justify-end pl-[12%]">
                <div className="flex flex-col items-end gap-2">
                  {m.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveImage(m.imageUrl ?? null)}
                      className="group overflow-hidden rounded-[18px_18px_6px_18px] focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <img
                        src={m.imageUrl}
                        alt=""
                        className="h-48 w-72 cursor-zoom-in rounded-[18px_18px_6px_18px] object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </button>
                  )}

                  {m.text && (
                    <div className="rounded-[18px_18px_6px_18px] bg-accent px-4 py-3 text-[14px] leading-relaxed text-white">
                      <span>{m.text}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {pending && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.fast }}
          >
            <TypingIndicator />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              src={activeImage}
              alt="Увеличенное изображение"
              className="max-h-[90vh] max-w-[90vw] cursor-zoom-out rounded-xl object-contain shadow-2xl"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
