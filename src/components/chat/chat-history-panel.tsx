"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import { ChevronDownIcon, LeafIcon, TrashIcon } from "@/src/components/ui/icons";
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens";
import { ChatHistoryItem } from "./chat-history-item";
import { groupChatsByTopic } from "./chat-history-grouping";
import { useChatHistory } from "./use-chat-history";

interface ChatHistoryPanelProps {
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onActiveChatRemoved: () => void;
  historyRefreshToken: number;
}

export function ChatHistoryPanel({
  activeChatId,
  onSelectChat,
  onActiveChatRemoved,
  historyRefreshToken,
}: ChatHistoryPanelProps) {
  const { dict } = useI18n();
  const history = useChatHistory(activeChatId, onActiveChatRemoved, historyRefreshToken);
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());
  const groups = groupChatsByTopic(history.items);
  const isEmpty = history.status === "ready" && groups.length === 0;

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={history.view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.base, ease: EASE_OUT }}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          {isEmpty && (
            <p className="px-2 py-3 text-sm text-fg-faint">
              {history.view === "trash" ? dict.chat.history.emptyTrash : dict.chat.history.emptyChats}
            </p>
          )}

          <AnimatePresence mode="popLayout">
            {groups.map((group) => {
              const isOpen = !collapsed.has(group.key);
              const listId = `chat-topic-${group.key}`;
              return (
                <div key={group.key} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={isOpen}
                    aria-controls={listId}
                    className="group/topic flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-xs font-semibold uppercase tracking-[0.06em] text-fg-faint transition-colors duration-150 hover:bg-surface-muted hover:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <LeafIcon size={14} strokeWidth={2} className="flex-none text-accent" />
                    <span className="min-w-0 flex-1 truncate">
                      {group.topic ?? dict.chat.history.otherTopic}
                    </span>
                    <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums tracking-normal text-fg-faint group-hover/topic:bg-white">
                      {group.items.length}
                    </span>
                    <ChevronDownIcon
                      size={14}
                      strokeWidth={2}
                      className={`flex-none transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={listId}
                        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                        className="ml-3 border-l border-edge pl-2"
                      >
                        {group.items.map(({ chat, label }) => (
                          <motion.div
                            key={chat.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                          >
                            <ChatHistoryItem
                              item={chat}
                              label={label}
                              isActive={chat.id === activeChatId}
                              isTrash={history.view === "trash"}
                              isRenaming={history.renamingId === chat.id}
                              isPendingDelete={history.pendingDeleteId === chat.id}
                              onSelect={onSelectChat}
                              onStartRename={history.startRename}
                              onCancelRename={history.cancelRename}
                              onSubmitRename={history.submitRename}
                              onRequestDelete={history.requestDelete}
                              onCancelDelete={history.cancelDelete}
                              onConfirmDelete={history.confirmDelete}
                              onRestore={history.restoreChat}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={history.toggleView}
        className="mt-2 flex min-h-11 flex-none items-center gap-2 rounded-xl px-2 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg"
      >
        <TrashIcon size={16} strokeWidth={1.8} />
        {history.view === "trash" ? dict.chat.history.backToChats : dict.chat.history.trash}
      </button>
    </div>
  );
}
