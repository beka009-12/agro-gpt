import ru from "@/src/i18n/ru.json"

export function Footer() {
  return (
    <footer className="border-t border-edge py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <span className="font-display text-lg font-bold text-fg">
          ibo<span className="text-accent">●</span>
        </span>
        <span className="text-sm text-fg-muted">{ru.footer.copyright}</span>
      </div>
    </footer>
  )
}
