"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"

interface BotMarkdownProps {
  text: string
}

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-bold text-fg">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 marker:text-accent last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 marker:font-bold marker:text-accent last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  h1: ({ children }) => (
    <p className="mb-2 mt-5 text-[17px] font-extrabold text-fg first:mt-0">
      {children}
    </p>
  ),
  h2: ({ children }) => (
    <p className="mb-2 mt-5 text-[17px] font-extrabold text-fg first:mt-0">
      {children}
    </p>
  ),
  h3: ({ children }) => (
    <p className="mb-1.5 mt-4 text-base font-extrabold text-fg first:mt-0">
      {children}
    </p>
  ),
  h4: ({ children }) => (
    <p className="mb-1.5 mt-4 text-[15px] font-bold text-fg first:mt-0">
      {children}
    </p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-accent-strong underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-muted px-1.5 py-0.5 text-[0.9em]">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-accent/40 pl-3 text-fg-muted last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-edge" />,
}

export function BotMarkdown({ text }: BotMarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
      {text}
    </ReactMarkdown>
  )
}
