"use client";

import { useI18n } from "@/src/i18n/client";
import { TrashIcon } from "@/src/components/ui/icons";
import { ChatHistoryItem } from "./chat-history-item";
import { useChatHistory } from "./use-chat-history";

const SKELETON_WIDTHS = ["82%", "64%", "90%", "56%", "74%", "60%"];

function HistoryListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      {SKELETON_WIDTHS.map((width) => (
        <div key={width} className="flex min-h-9 items-center px-2 py-1.5">
          <span
            className="h-3.5 rounded-md bg-surface-muted motion-safe:animate-pulse"
            style={{ width }}
          />
        </div>
      ))}
    </div>
  );
}

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
  const isEmpty = history.status === "ready" && history.items.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3">
      <div
        aria-busy={history.showSkeleton}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-2"
      >
        {history.showSkeleton && <HistoryListSkeleton />}

        {isEmpty && (
          <p className="px-2 py-3 text-sm text-fg-faint">
            {history.view === "trash" ? dict.chat.history.emptyTrash : dict.chat.history.emptyChats}
          </p>
        )}

        {history.items.map((item) => (
          <ChatHistoryItem
            key={item.id}
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
        ))}
      </div>

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
