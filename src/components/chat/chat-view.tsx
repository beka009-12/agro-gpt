"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useI18n } from "@/src/i18n/client";
import { mapHistoryMessage, parseHistoryResponse } from "./chat-history-mapping";
import { ChatInput } from "./chat-input";
import { GeoStatusNotice } from "./geo-status-notice";
import { MessageList } from "./message-list";
import type { ChatMessage } from "./types";
import { useChatGeo } from "./use-chat-geo";

interface MessageResponse {
  chatId: string;
  answer: string;
}

function parseMessageResponse(data: unknown): MessageResponse | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "chatId" in data &&
    typeof data.chatId === "string" &&
    "answer" in data &&
    typeof data.answer === "string"
  ) {
    return { chatId: data.chatId, answer: data.answer };
  }
  return null;
}

function readErrorMessage(data: unknown): string | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }
  return null;
}

interface ChatViewProps {
  hasProfileLocation: boolean;
  initialChatId: string | null;
  onChatCreated?: (id: string) => void;
}

export function ChatView({
  hasProfileLocation,
  initialChatId,
  onChatCreated,
}: ChatViewProps) {
  const router = useRouter();
  const { dict: ru } = useI18n();
  const { status: geoStatus, hasCoords, getCoords, enable: enableGeo } = useChatGeo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [enablingGeo, setEnablingGeo] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const chatIdRef = useRef<string | null>(initialChatId);
  const oldestCreatedAtRef = useRef<string | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    if (!initialChatId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/chat/${initialChatId}/messages?limit=50`);
        const data: unknown = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          toast.error(
            res.status === 403
              ? ru.chat.history.errors.noAccess
              : ru.chat.history.errors.notFound,
          );
          router.push("/chat");
          return;
        }

        const parsed = parseHistoryResponse(data);
        if (!parsed) {
          toast.error(ru.auth.errors.unexpectedResponse);
          router.push("/chat");
          return;
        }

        setMessages(parsed.messages.flatMap(mapHistoryMessage));
        setHasMoreOlder(parsed.has_more);
        oldestCreatedAtRef.current = parsed.messages.at(0)?.created_at ?? null;
      } catch {
        if (!cancelled) {
          toast.error(ru.auth.errors.network);
          router.push("/chat");
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChatId]);

  const loadOlderMessages = async () => {
    if (!chatIdRef.current || !hasMoreOlder || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const before = oldestCreatedAtRef.current
        ? `&before=${encodeURIComponent(oldestCreatedAtRef.current)}`
        : "";
      const res = await fetch(
        `/api/chat/${chatIdRef.current}/messages?limit=50${before}`,
      );
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) return;

      const parsed = parseHistoryResponse(data);
      if (!parsed) return;

      const mapped = parsed.messages.flatMap(mapHistoryMessage);
      setMessages((prev) => [...mapped, ...prev]);
      setHasMoreOlder(parsed.has_more);
      oldestCreatedAtRef.current =
        parsed.messages.at(0)?.created_at ?? oldestCreatedAtRef.current;
    } finally {
      setLoadingOlder(false);
    }
  };

  const pushMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), ...message }]);
  };

  const send = async (text: string, image?: File) => {
    const trimmed = text.trim();
    if (pending || (!trimmed && !image)) return;

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = URL.createObjectURL(image);
      objectUrlsRef.current.push(imageUrl);
    }
    pushMessage({
      role: "user",
      text: trimmed,
      imageUrl,
      imageName: image?.name,
    });
    const wasNewChat = !chatIdRef.current;
    setPending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const coords = await getCoords();

      const form = new FormData();
      if (chatIdRef.current) form.set("chatId", chatIdRef.current);
      if (trimmed) form.set("text", trimmed);
      if (image) form.set("image", image);
      if (coords) {
        form.set("latitude", String(coords.latitude));
        form.set("longitude", String(coords.longitude));
      }

      const res = await fetch("/api/chat/message", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);

      if (!res.ok && res.status === 401) {
        router.push("/login");
        router.refresh();
        return;
      }

      if (!res.ok) {
        pushMessage({
          role: "bot",
          text: readErrorMessage(data) ?? ru.chat.errors.failed,
        });
        return;
      }

      const parsed = parseMessageResponse(data);
      if (!parsed) {
        pushMessage({ role: "bot", text: ru.auth.errors.unexpectedResponse });
        return;
      }
      chatIdRef.current = parsed.chatId;
      pushMessage({ role: "bot", text: parsed.answer });
      if (wasNewChat) onChatCreated?.(parsed.chatId);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      pushMessage({ role: "bot", text: ru.auth.errors.network });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setPending(false);
      }
    }
  };

  const enableGeolocation = async () => {
    setEnablingGeo(true);
    try {
      const next = await enableGeo();
      if (next === "denied") toast.error(ru.chat.geoStatus.deniedHint);
      else if (next === "unavailable") toast.error(ru.chat.geoStatus.failedHint);
    } finally {
      setEnablingGeo(false);
    }
  };

  const geoNoticeStatus =
    geoStatus === "denied" || geoStatus === "unavailable"
      ? geoStatus
      : geoStatus === "locating" && enablingGeo
        ? geoStatus
        : null;
  const geoNotice =
    geoNoticeStatus && !hasCoords && !hasProfileLocation ? (
      <GeoStatusNotice status={geoNoticeStatus} onEnable={() => void enableGeolocation()} />
    ) : null;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[880px] flex-1 flex-col overflow-hidden">
      <MessageList
        messages={messages}
        pending={pending}
        hasMoreOlder={hasMoreOlder}
        onLoadOlder={() => void loadOlderMessages()}
      />

      <ChatInput
        pending={pending}
        notice={geoNotice}
        onSend={(text, image) => void send(text, image)}
      />
    </div>
  );
}
