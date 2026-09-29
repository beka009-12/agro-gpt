"use client";

import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/src/i18n/client";
import { TrashIcon } from "@/src/components/ui/icons";
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens";
import { ChatHistoryItem } from "./chat-history-item";
import { groupChatsByDate } from "./chat-history-grouping";
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
  const groups = groupChatsByDate(history.items, new Date());
  const isEmpty = history.status === "ready" && groups.length === 0;

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
            {groups.map((group) => (
              <div key={group.key} className="mb-2">
                {group.key !== "older" && (
                  <p className="px-2 pb-1 pt-3 text-xs text-fg-faint">
                    {dict.chat.history[group.key]}
                  </p>
                )}
                {group.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                  >
                    <ChatHistoryItem
                      item={item}
                      isActive={item.id === activeChatId}
                      isTrash={history.view === "trash"}
                      isRenaming={history.renamingId === item.id}
                      isPendingDelete={history.pendingDeleteId === item.id}
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
              </div>
            ))}
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
