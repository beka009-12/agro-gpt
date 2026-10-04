"use client";

import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import { PlantIcon } from "@/src/components/ui/icons";

const DOTS = [0, 1, 2];

interface TypingIndicatorProps {
  withPhoto: boolean;
}

export function TypingIndicator({ withPhoto }: TypingIndicatorProps) {
  const { dict } = useI18n();
  const reduced = useReducedMotion();

  return (
    <div role="status" className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="grid size-7 flex-none place-items-center rounded-lg bg-accent-soft text-accent"
      >
        <PlantIcon size={15} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 pt-0.5">
        <div className="flex items-center gap-2.5">
          <p className="text-sm font-bold text-fg">
            {withPhoto ? dict.chat.typingPhoto : dict.chat.typingText}
          </p>
          <span aria-hidden className="flex items-center gap-[5px]">
            {DOTS.map((i) => (
              <motion.span
                key={i}
                className="size-[6px] rounded-full bg-accent"
                animate={
                  reduced
                    ? undefined
                    : { y: [0, -3, 0], opacity: [0.45, 1, 0.45] }
                }
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }}
              />
            ))}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-fg-muted">{dict.chat.typingHint}</p>
      </div>
    </div>
  );
}
