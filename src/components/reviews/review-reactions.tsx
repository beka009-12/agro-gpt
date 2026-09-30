"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { ThumbsDownIcon, ThumbsUpIcon } from "@/src/components/ui/icons"
import { useI18n } from "@/src/i18n/client"
import {
  applyReaction,
  nextReaction,
  reviewReactionSchema,
  type ReactionKind,
  type ReviewReaction,
} from "@/src/lib/review-schemas"

interface ReviewReactionsProps {
  reviewId: string
  initial: ReviewReaction
  isAuthed: boolean
}

export function ReviewReactions({
  reviewId,
  initial,
  isAuthed,
}: ReviewReactionsProps) {
  const { dict } = useI18n()
  const router = useRouter()
  const [state, setState] = useState<ReviewReaction>(initial)
  const inFlight = useRef(false)

  async function handleClick(kind: ReactionKind) {
    if (!isAuthed) {
      router.push("/login")
      return
    }
    if (inFlight.current) return
    inFlight.current = true

    const previous = state
    const next = nextReaction(previous.my_reaction, kind)
    setState(applyReaction(previous, next))

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reaction`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: next }),
      })
      if (res.status === 401) {
        setState(previous)
        router.push("/login")
        return
      }
      const parsed = reviewReactionSchema.safeParse(
        res.ok ? await res.json() : null
      )
      // сверяем с ответом сервера; при ошибке откатываем
      setState(parsed.success ? parsed.data : previous)
    } catch {
      setState(previous)
    } finally {
      inFlight.current = false
    }
  }

  const buttons = [
    {
      kind: "like",
      Icon: ThumbsUpIcon,
      count: state.likes_count,
      label: dict.reviews.like,
    },
    {
      kind: "dislike",
      Icon: ThumbsDownIcon,
      count: state.dislikes_count,
      label: dict.reviews.dislike,
    },
  ] as const

  return (
    <div className="-ml-2 flex items-center gap-1">
      {buttons.map(({ kind, Icon, count, label }) => {
        const active = state.my_reaction === kind
        return (
          <button
            key={kind}
            type="button"
            onClick={() => void handleClick(kind)}
            aria-pressed={active}
            aria-label={label}
            title={isAuthed ? label : dict.reviews.loginToReact}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
              active
                ? "bg-mint-soft text-accent-strong"
                : "text-fg-muted hover:bg-mint-soft"
            }`}
          >
            <Icon size={18} weight={active ? "fill" : "regular"} />
            <span className="tabular-nums">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
