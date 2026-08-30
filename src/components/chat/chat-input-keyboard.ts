interface ChatInputKeyEvent {
  key: string
  shiftKey: boolean
  composing: boolean
  hasContent: boolean
}

export function shouldSubmitChatInput(event: ChatInputKeyEvent): boolean {
  return (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.composing &&
    event.hasContent
  )
}
