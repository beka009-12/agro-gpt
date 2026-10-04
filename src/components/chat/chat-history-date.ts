export interface ChatDateLabels {
  today: string
  yesterday: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

// «Сегодня»/«Вчера» считаем по календарным дням в часовом поясе пользователя, а не по 24 часам
export function formatChatDate(
  iso: string,
  now: Date,
  locale: string,
  labels: ChatDateLabels
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)
  if (daysAgo <= 1) {
    const time = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
    return `${daysAgo <= 0 ? labels.today : labels.yesterday}, ${time}`
  }

  const sameYear = date.getFullYear() === now.getFullYear()
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  }).format(date)
}
