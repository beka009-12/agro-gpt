"use client"

import { useRef, useState } from "react"
import type { FormEvent } from "react"
import ru from "@/src/i18n/ru.json"

interface ChatInputProps {
  pending: boolean
  onSend: (text: string, image?: File) => void
}

export function ChatInput({ pending, onSend }: ChatInputProps) {
  const [value, setValue] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (pending || !value.trim()) return
    onSend(value)
    setValue("")
  }

  const onFileChange = () => {
    const file = fileRef.current?.files?.[0]
    if (file && !pending) onSend("", file)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2.5 px-4 pb-5 pt-4 shadow-[0_-4px_20px_rgba(45,106,79,0.06)] sm:px-6"
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onFileChange}
        tabIndex={-1}
        aria-hidden
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={pending}
        aria-label={ru.chat.attachLabel}
        className="flex size-11 flex-none items-center justify-center rounded-full border border-edge bg-card text-[17px] transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        📎
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={ru.chat.inputPlaceholder}
        className="h-12 min-w-0 flex-1 rounded-full border border-edge bg-card px-5 text-[14.5px] text-fg shadow-[0_2px_8px_rgba(45,106,79,0.05)] outline-none transition-colors placeholder:text-fg-faint focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending || !value.trim()}
        aria-label={ru.chat.sendLabel}
        className="flex size-11 flex-none items-center justify-center rounded-full bg-accent text-[17px] text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent"
      >
        ↑
      </button>
    </form>
  )
}
