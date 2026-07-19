"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"

interface BotMarkdownProps {
  text: string
}

const components: Components = {
  p: ({ children }) => (
    <p className="mb-2.5 leading-relaxed last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-[#1d3a2b]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-2.5 list-disc space-y-1.5 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2.5 list-decimal space-y-1.5 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <p className="mb-1.5 mt-3 text-[15px] font-extrabold text-[#1d3a2b] first:mt-0">
      {children}
    </p>
  ),
  h2: ({ children }) => (
    <p className="mb-1.5 mt-3 text-[15px] font-extrabold text-[#1d3a2b] first:mt-0">
      {children}
    </p>
  ),
  h3: ({ children }) => (
    <p className="mb-1.5 mt-3 text-[14px] font-extrabold text-[#1d3a2b] first:mt-0">
      {children}
    </p>
  ),
  h4: ({ children }) => (
    <p className="mb-1 mt-2.5 text-[14px] font-bold text-[#1d3a2b] first:mt-0">
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
    <code className="rounded bg-[#e3ede1] px-1.5 py-0.5 text-[12.5px]">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2.5 border-l-2 border-[#b9d5bd] pl-3 text-[#4a5f52] last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-[#d8e6d6]" />,
}

export function BotMarkdown({ text }: BotMarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
      {text}
    </ReactMarkdown>
  )
}
