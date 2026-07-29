"use client";

import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";

const DOTS = [0, 1, 2];

export function TypingIndicator() {
  const { dict: ru } = useI18n();
  const reduced = useReducedMotion();

  return (
    <div className="flex justify-start pr-[12%]">
      <div className="flex h-9 items-center gap-[5px] rounded-[16px_16px_16px_5px] bg-[#f0f6ef] px-3.5">
        <span className="sr-only">{ru.chat.typingTitle}</span>
        {DOTS.map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="size-[7px] rounded-full bg-accent"
            animate={
              reduced
                ? undefined
                : { y: [0, -3.5, 0], opacity: [0.45, 1, 0.45] }
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
