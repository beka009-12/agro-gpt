"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/src/i18n/client";
import { ArrowLeftIcon } from "@/src/components/ui/icons";
import type { ChatListItemSchema } from "@/src/api/generated/models";
import { groupChatsByDay } from "./chat-history-groups";
import { ChatHistoryItem } from "./chat-history-item";
import { useChatHistory } from "./use-chat-history";

const SKELETON_WIDTHS = ["82%", "64%", "90%", "56%", "74%", "60%"];

function HistoryListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col pt-2">
      <span className="mx-2.5 mb-2 h-3 w-16 rounded-md bg-surface-muted motion-safe:animate-pulse" />
      {SKELETON_WIDTHS.map((width) => (
        <div key={width} className="flex min-h-10 items-center px-2.5 lg:min-h-9">
          <span
            className="h-3.5 rounded-md bg-surface-muted motion-safe:animate-pulse"
            style={{ width }}
          />
        </div>
      ))}
    </div>
  );
}

function HistorySection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col">
      <p aria-hidden className="px-2.5 pb-1 pt-2 text-[13px] font-bold text-fg-muted">
        {label}
      </p>
      {children}
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
  const isTrash = history.view === "trash";
  const groups = isTrash ? null : groupChatsByDay(history.items, new Date());

  const renderItems = (items: ChatListItemSchema[]) =>
    items.map((item) => (
      <ChatHistoryItem
        key={item.id}
        item={item}
        isActive={item.id === activeChatId}
        isTrash={isTrash}
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
    ));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3">
      {isTrash && (
        <div className="flex min-h-10 flex-none items-center gap-1">
          <button
            type="button"
            onClick={history.toggleView}
            aria-label={dict.chat.history.backToChats}
            title={dict.chat.history.backToChats}
            className="grid size-10 place-items-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeftIcon size={18} strokeWidth={2} />
          </button>
          <p className="text-sm font-bold text-fg">{dict.chat.history.trash}</p>
        </div>
      )}

      <div
        aria-busy={history.showSkeleton}
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pb-2"
      >
        {history.showSkeleton && <HistoryListSkeleton />}

        {isEmpty && (
          <p className="px-2 py-3 text-sm text-fg-faint">
            {isTrash ? dict.chat.history.emptyTrash : dict.chat.history.emptyChats}
          </p>
        )}

        {groups ? (
          <div className="flex flex-col gap-2">
            {groups.today.length > 0 && (
              <HistorySection label={dict.chat.history.today}>
                {renderItems(groups.today)}
              </HistorySection>
            )}
            {groups.earlier.length > 0 && (
              <HistorySection label={dict.chat.history.earlier}>
                {renderItems(groups.earlier)}
              </HistorySection>
            )}
          </div>
        ) : (
          renderItems(history.items)
        )}
      </div>

    </div>
  );
}
