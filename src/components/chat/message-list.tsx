"use client"

import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import { PaperclipIcon } from "@/src/components/ui/icons"
import { EmptyState } from "./empty-state"
import { TypingIndicator } from "./typing-indicator"
import type { ChatMessage } from "./types"

interface MessageListProps {
  messages: ChatMessage[]
  pending: boolean
  onSuggestion: (text: string) => void
}

export function MessageList({ messages, pending, onSuggestion }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, pending])

  const isEmpty = messages.length === 0 && !pending

  return (
    <div
      ref={scrollRef}
      aria-live="polite"
      className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 sm:p-6"
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
              <p className="rounded-[18px_18px_18px_6px] bg-[#f0f6ef] px-4 py-3 text-[14px] leading-relaxed text-[#34483d]">
                {m.text}
              </p>
            </div>
          ) : (
            <div className="flex justify-end pl-[12%]">
              <div className="flex flex-col items-end gap-2 rounded-[18px_18px_6px_18px] bg-accent px-4 py-3 text-[14px] leading-relaxed text-white">
                {m.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     blob-превью локального файла, next/image неприменим */
                  <img
                    src={m.imageUrl}
                    alt={m.imageName ?? ""}
                    className="max-h-40 rounded-lg"
                  />
                )}
                {m.imageName && (
                  <span className="flex items-center gap-1 text-xs text-white/80">
                    <PaperclipIcon size={12} />
                    {m.imageName}
                  </span>
                )}
                {m.text && <span>{m.text}</span>}
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
  )
}
