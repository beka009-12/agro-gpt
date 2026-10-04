// ответ копируют в мессенджеры, где markdown не рендерится — оставляем только текст и структуру строк
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^(\s*)[*-]\s+/gm, "$1• ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(?<![*\w])\*(?!\s)([^*\n]+?)\*(?![*\w])/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, "$1 ($2)")
}
