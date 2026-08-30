"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/src/i18n/client";
import { ChatInput } from "./chat-input";
import { GeoWarningBanner } from "./geo-warning-banner";
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
}

export function ChatView({ hasProfileLocation }: ChatViewProps) {
  const router = useRouter();
  const { dict: ru } = useI18n();
  const { status: geoStatus, getCoords } = useChatGeo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const chatIdRef = useRef<string | null>(null);
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

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[880px] flex-1 flex-col overflow-hidden">
      {geoStatus === "denied" && !hasProfileLocation && <GeoWarningBanner />}

      <MessageList
        messages={messages}
        pending={pending}
      />

      <ChatInput
        pending={pending}
        onSend={(text, image) => void send(text, image)}
      />
    </div>
  );
}
