# ibo v3 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести лендинг, auth-страницы и чат на стиль прототипа v3 (Manrope, зелёный `#2D6A4F`, светлые поверхности) и заменить заглушку `/chat` на рабочий чат поверх реального API (`POST /chat/` + `POST /diagnosis/`).

**Architecture:** Рестайл на месте: дизайн-токены меняются в `app/globals.css` (@theme, Tailwind 4), компоненты перерабатываются под макеты v3 с сохранением структуры (i18n, SectionReveal, motion-токены). Чат — клиентский `ChatView` (useState) поверх нового Route Handler `/api/chat/message`, который берёт токен из httpOnly-куки, лениво создаёт чат в бэкенде и проксирует multipart в `/diagnosis/`. Guard роутов уже есть (`proxy.ts`).

**Tech Stack:** Next.js 16.2.10 (App Router), React 19, TypeScript strict, Tailwind 4, motion/react, zod v4 (`z.uuid()`, не `z.string().uuid()`), next/font (Manrope). Пакетный менеджер — **bun**.

**Spec:** `docs/superpowers/specs/2026-07-09-ibo-v3-redesign-design.md`

**Отступления от спеки:**
- Крем `#F0EFE8` в прототипе — фон артборда (канвы), а не страницы. Фон страницы = `#FAFAF5` (в спеке — `surface`), токен `surface` не нужен: `bg` = `#FAFAF5`, `card` = `#FFFFFF`, `section-alt` = `#F5F4EC`.
- Хедер лендинга упрощается: убирается cookie-проверка авторизации (в v3 одна CTA «Начать чат» → `/chat`, неавторизованных редиректит `proxy.ts`).

## Global Constraints

- Палитра — только токены из Task 1: `bg-bg #FAFAF5`, `bg-card #FFFFFF`, `bg-section-alt #F5F4EC`, `bg-accent #2D6A4F`, `hover:bg-accent-strong #1F4E39`, `bg-mint #95D5B2`, `bg-mint-soft #E8F3EC`, `text-fg #1B2E24`, `text-fg-muted #4B5A4E`, `text-fg-faint #7C8A7F`, `border-edge #E5E4DA`, `text-danger #B3391F`
- Единственный шрифт — Manrope (`font-sans`, дефолт). Классы `font-display` / `font-mono` в новом коде запрещены (алиасы в Task 1 — только чтобы нерестайленные компоненты собирались до своей задачи)
- Тени: карточки `shadow-[0_4px_20px_rgba(45,106,79,0.06)]`, hero-мокап `shadow-[0_20px_50px_rgba(45,106,79,0.14)]`, CTA hero `shadow-[0_4px_20px_rgba(45,106,79,0.25)]`
- Кнопки и бейджи — pill (`rounded-full`), карточки — `rounded-2xl`
- Никакого `any`; интерфейсы для всех props; только `async/await`; kebab-case для файлов
- Все пользовательские тексты — из `src/i18n/ru.json`, не хардкодить
- `cookies()` в Next 16 — async: `const store = await cookies()`
- Анимации — motion/react с `useReducedMotion`-гардом (паттерн `section-reveal.tsx`); CSS-анимации получают `motion-reduce:animate-none`
- В проекте нет тест-раннера — верификация каждой задачи: `bunx tsc --noEmit` (чисто); финальная задача — `bun run lint`, `bun run build` и ручной флоу
- Коммиты: Conventional Commits, английский

---

### Task 1: Дизайн-токены v3 и Manrope

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: —
- Produces: Tailwind-классы токенов (см. Global Constraints) + временные алиасы `bg-elevated → #FFFFFF`, `fg-soft → #1F4E39`, `font-display`/`font-mono → Manrope`. Задачи 2–7 используют только новые токены; Task 8 удаляет алиасы.

- [ ] **Step 1: Переписать `@theme` в `app/globals.css`**

Заменить весь файл на:

```css
@import "tailwindcss";

@theme {
  --color-bg: #fafaf5;
  --color-card: #ffffff;
  --color-section-alt: #f5f4ec;
  --color-accent: #2d6a4f;
  --color-accent-strong: #1f4e39;
  --color-mint: #95d5b2;
  --color-mint-soft: #e8f3ec;
  --color-fg: #1b2e24;
  --color-fg-muted: #4b5a4e;
  --color-fg-faint: #7c8a7f;
  --color-edge: #e5e4da;
  --color-danger: #b3391f;

  --font-sans: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;

  /* временные алиасы до Task 8 (cleanup) — держат нерестайленные компоненты */
  --color-bg-elevated: #ffffff;
  --color-fg-soft: #1f4e39;
  --font-display: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  background-color: var(--color-bg);
  color: var(--color-fg);
}

::selection {
  background-color: var(--color-accent);
  color: #ffffff;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Заменить шрифты в `app/layout.tsx`**

Заменить весь файл на:

```tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ibo — AI-агроном в вашем кармане",
  description:
    "Диагностика болезней растений по фото и советы агронома от AI. На кыргызском, русском и английском.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Проверка**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add v3 design tokens and manrope font"
```

---

### Task 2: Логотип, хедер и футер v3

**Files:**
- Create: `src/components/layout/logo.tsx`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/footer.tsx`
- Modify: `src/i18n/ru.json` (разделы `header`, `footer`)

**Interfaces:**
- Consumes: токены Task 1
- Produces: `LogoMark({ size?: number; className?: string })` — SVG-марка без текста; используется в Task 5 (auth-card). `ru.header.nav.features`, `ru.header.nav.howItWorks`, `ru.header.startChat`, `ru.footer.copyright`, `ru.footer.askLink`. Хедер ссылается на якоря `#features` (появится в Task 4) и `#how-it-works`.

- [ ] **Step 1: Создать `src/components/layout/logo.tsx`**

```tsx
interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 30, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle cx="15" cy="15" r="15" fill="#2D6A4F" />
      <path
        d="M15 22 C15 15 15 11 15 8"
        stroke="#95D5B2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M15 12 C15 12 11 11 10 15 C13 17 15 15 15 12 Z" fill="#95D5B2" />
      <path d="M15 16 C15 16 19 15 20 19 C17 21 15 19 15 16 Z" fill="#95D5B2" />
    </svg>
  )
}
```

- [ ] **Step 2: Обновить разделы `header` и `footer` в `src/i18n/ru.json`**

Заменить раздел `header` на:

```json
"header": {
  "nav": {
    "features": "Возможности",
    "howItWorks": "Как это работает"
  },
  "startChat": "Начать чат"
},
```

Заменить раздел `footer` на:

```json
"footer": {
  "copyright": "© 2026 ibo — ИИ-помощник агронома",
  "askLink": "Задать вопрос →"
},
```

Старые ключи `header.login`, `header.register`, `header.openChat` удаляются — их единственный потребитель (`header.tsx`) переписывается в этой же задаче.

- [ ] **Step 3: Переписать `src/components/layout/header.tsx`**

```tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ru from "@/src/i18n/ru.json"
import { LogoMark } from "./logo"

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-edge bg-bg/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link
          href="/"
          aria-label="ibo — на главную"
          className="flex items-center gap-2.5"
        >
          <LogoMark size={30} />
          <span className="text-[19px] font-bold tracking-tight text-fg">
            ibo
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <a
            href="#features"
            className="hidden text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:block"
          >
            {ru.header.nav.features}
          </a>
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:block"
          >
            {ru.header.nav.howItWorks}
          </a>
          <Link
            href="/chat"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            {ru.header.startChat}
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

Примечание: cookie-проверка `hasUserCookie` и импорт `USER_COOKIE` удаляются (см. «Отступления от спеки»).

- [ ] **Step 4: Переписать `src/components/layout/footer.tsx`**

```tsx
import Link from "next/link"
import ru from "@/src/i18n/ru.json"
import { LogoMark } from "./logo"

export function Footer() {
  return (
    <footer className="border-t border-edge py-7">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
        <span className="flex items-center gap-2">
          <LogoMark size={22} />
          <span className="text-[15px] font-bold text-fg">ibo</span>
        </span>
        <span className="text-[13px] text-fg-faint">{ru.footer.copyright}</span>
        <Link
          href="/chat"
          className="text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
        >
          {ru.footer.askLink}
        </Link>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Проверка**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/i18n/ru.json
git commit -m "feat: restyle header and footer to v3 with new logo"
```

---

### Task 3: Hero v3 с мокапом чата

**Files:**
- Modify: `src/components/landing/hero.tsx`
- Delete: `src/components/landing/growing-sprouts.tsx`
- Modify: `src/lib/motion-tokens.ts`
- Modify: `src/i18n/ru.json` (раздел `hero`)

**Interfaces:**
- Consumes: токены Task 1
- Produces: `ru.hero.{badge,title,subtitle,ctaPrimary,ctaSecondary,trust[],mockup[]}` (`trust` — массив из 3 строк, `mockup` — 3 строки: бот/юзер/бот)

- [ ] **Step 1: Заменить раздел `hero` в `src/i18n/ru.json`**

```json
"hero": {
  "badge": "ИИ-помощник для агрономов",
  "title": "Умный совет для вашего поля — за секунды",
  "subtitle": "Болезни растений, подбор удобрений, севооборот и погодные риски — просто спросите ibo. Отвечает на русском и кыргызском.",
  "ctaPrimary": "Задать вопрос",
  "ctaSecondary": "Как это работает",
  "trust": ["Бесплатно", "Работает на основе ИИ", "RU / KY"],
  "mockup": [
    "Салам! Я ibo — чем могу помочь на поле сегодня?",
    "Чем обработать томаты от фитофторы?",
    "Медьсодержащий фунгицид, обработка каждые 7–10 дней. Удалите поражённые листья заранее."
  ]
},
```

Ключи `figureCaption`, `figureLabel` удаляются — их потребитель переписывается здесь же.

- [ ] **Step 2: Переписать `src/components/landing/hero.tsx`**

```tsx
import Link from "next/link"
import ru from "@/src/i18n/ru.json"

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-28 md:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-2 text-[13px] font-semibold text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {ru.hero.badge}
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight text-balance text-fg md:text-[50px]">
          {ru.hero.title}
        </h1>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-fg-muted">
          {ru.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/chat"
            className="rounded-full bg-accent px-7 py-4 text-[15px] font-bold text-white shadow-[0_4px_20px_rgba(45,106,79,0.25)] transition-colors hover:bg-accent-strong"
          >
            {ru.hero.ctaPrimary}
          </Link>
          <a
            href="#how-it-works"
            className="px-1 py-4 text-sm font-semibold text-fg transition-colors hover:text-accent"
          >
            {ru.hero.ctaSecondary} ↓
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap items-center gap-5 border-t border-edge pt-7">
          {ru.hero.trust.map((item) => (
            <li key={item} className="text-[13px] font-medium text-fg-faint">
              ✓ {item}
            </li>
          ))}
        </ul>
      </div>
      <div
        aria-hidden
        className="overflow-hidden rounded-2xl border border-edge bg-card shadow-[0_20px_50px_rgba(45,106,79,0.14)]"
      >
        <div className="flex items-center gap-1.5 border-b border-edge px-4 py-3">
          <span className="size-2.5 rounded-full bg-edge" />
          <span className="size-2.5 rounded-full bg-edge" />
          <span className="size-2.5 rounded-full bg-edge" />
        </div>
        <div className="flex flex-col gap-3.5 bg-bg p-5">
          <p className="max-w-[78%] self-start rounded-[16px_16px_16px_4px] bg-mint-soft px-4 py-3 text-sm leading-normal text-fg">
            {ru.hero.mockup[0]}
          </p>
          <p className="max-w-[78%] self-end rounded-[16px_16px_4px_16px] bg-accent px-4 py-3 text-sm leading-normal text-white">
            {ru.hero.mockup[1]}
          </p>
          <p className="max-w-[84%] self-start rounded-[16px_16px_16px_4px] bg-mint-soft px-4 py-3 text-sm leading-normal text-fg">
            {ru.hero.mockup[2]}
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Удалить ростки**

```bash
git rm src/components/landing/growing-sprouts.tsx
```

- [ ] **Step 4: Убрать неиспользуемые константы из `src/lib/motion-tokens.ts`**

Удалить строки с `SPROUT_GROW_DURATION` и `SPROUT_STAGGER` (единственный потребитель удалён). Итоговый файл:

```ts
export const DURATION = {
  fast: 0.2,
  base: 0.45,
  slow: 0.8,
} as const

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const REVEAL_OFFSET = 24
```

- [ ] **Step 5: Проверка**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 6: Commit**

```bash
git add -A src/components/landing/ src/lib/motion-tokens.ts src/i18n/ru.json
git commit -m "feat: rebuild hero with chat mockup, drop sprouts animation"
```

---

### Task 4: Секции «Как это работает» и «Возможности» v3

**Files:**
- Modify: `src/components/landing/how-it-works.tsx`
- Modify: `src/components/landing/features.tsx`
- Delete: `src/components/landing/feature-icons.tsx`
- Modify: `src/i18n/ru.json` (разделы `howItWorks`, `features`)

**Interfaces:**
- Consumes: токены Task 1, `SectionReveal` (без изменений)
- Produces: секция features получает `id="features"` (якорь хедера из Task 2). `ru.howItWorks.{title,stepLabel,steps[{emoji,title,description}]}`, `ru.features.{title,items[{emoji,title,description}]}`

- [ ] **Step 1: Заменить разделы `howItWorks` и `features` в `src/i18n/ru.json`**

```json
"features": {
  "title": "Возможности",
  "items": [
    {
      "emoji": "🔬",
      "title": "Диагностика по фото",
      "description": "Определение болезней и вредителей по описанию или снимку."
    },
    {
      "emoji": "🧪",
      "title": "Подбор удобрений",
      "description": "Точные дозировки под культуру и состояние почвы."
    },
    {
      "emoji": "📅",
      "title": "Календарь работ",
      "description": "Сроки посева, обработки и сбора урожая для вашего региона."
    },
    {
      "emoji": "📚",
      "title": "Экспертные ответы",
      "description": "Рекомендации на основе агрономических баз данных."
    }
  ]
},
"howItWorks": {
  "title": "Как это работает",
  "stepLabel": "Шаг",
  "steps": [
    {
      "emoji": "💬",
      "title": "Задайте вопрос",
      "description": "Опишите проблему текстом или прикрепите фото растения."
    },
    {
      "emoji": "🧠",
      "title": "ИИ анализирует",
      "description": "ibo сверяется с агрономическими данными и вашим регионом."
    },
    {
      "emoji": "✅",
      "title": "Получите рекомендацию",
      "description": "Чёткий план действий — что делать и когда."
    }
  ]
},
```

Ключи `figLabel` и поле `id` у `features.items` удаляются — потребители переписываются здесь же.

- [ ] **Step 2: Переписать `src/components/landing/how-it-works.tsx`**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:py-20"
    >
      <SectionReveal>
        <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[34px]">
          {ru.howItWorks.title}
        </h2>
      </SectionReveal>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {ru.howItWorks.steps.map((step, i) => (
          <SectionReveal key={step.title} delay={i * 0.12} className="h-full">
            <article className="h-full rounded-2xl border border-edge bg-bg p-7">
              <span
                aria-hidden
                className="flex size-12 items-center justify-center rounded-xl bg-mint-soft text-[22px]"
              >
                {step.emoji}
              </span>
              <p className="mt-4 text-xs font-medium tracking-[0.1em] uppercase text-mint">
                {ru.howItWorks.stepLabel} {i + 1}
              </p>
              <h3 className="mt-1.5 text-lg font-bold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {step.description}
              </p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Переписать `src/components/landing/features.tsx`**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 bg-section-alt py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[34px]">
            {ru.features.title}
          </h2>
        </SectionReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ru.features.items.map((item, i) => (
            <SectionReveal key={item.title} delay={i * 0.08} className="h-full">
              <article className="h-full rounded-2xl bg-card p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
                <span className="text-[26px]" aria-hidden>
                  {item.emoji}
                </span>
                <h3 className="mt-3.5 font-bold text-fg">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  {item.description}
                </p>
              </article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Удалить иконки**

```bash
git rm src/components/landing/feature-icons.tsx
```

- [ ] **Step 5: Проверка**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 6: Commit**

```bash
git add -A src/components/landing/ src/i18n/ru.json
git commit -m "feat: restyle how-it-works and features sections to v3"
```

---

### Task 5: Рестайл auth-страниц и ui-примитивов

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/auth/auth-card.tsx`
- Modify: `app/login/login-form.tsx:161` (только className OTP-инпута)

**Interfaces:**
- Consumes: токены Task 1, `LogoMark` из Task 2
- Produces: те же публичные API компонентов (props не меняются) — формы login/register не трогаем

- [ ] **Step 1: Обновить `src/components/ui/button.tsx`**

Заменить `className` кнопки и спиннера (структура и props не меняются):

```tsx
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function Button({
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden
        />
      )}
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Обновить label и поле в `src/components/ui/input.tsx`**

Заменить className лейбла на:

```tsx
className="text-sm font-medium text-fg"
```

Заменить className инпута на:

```tsx
className={`rounded-xl border bg-card px-4 py-3 text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/25 ${
  error ? "border-danger/60" : "border-edge"
} ${className}`}
```

- [ ] **Step 3: Обновить label и поле в `src/components/ui/select.tsx`**

Заменить className лейбла на:

```tsx
className="text-sm font-medium text-fg"
```

Заменить className селекта на:

```tsx
className={`appearance-none rounded-xl border bg-card px-4 py-3 text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 ${
  error ? "border-danger/60" : "border-edge"
} ${className}`}
```

- [ ] **Step 4: Обновить `src/components/auth/auth-card.tsx`**

```tsx
import Link from "next/link"
import type { ReactNode } from "react"
import { SectionReveal } from "@/src/components/landing/section-reveal"
import { LogoMark } from "@/src/components/layout/logo"

interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <SectionReveal className="w-full max-w-md">
        <Link
          href="/"
          aria-label="ibo — на главную"
          className="mb-6 flex items-center justify-center gap-2.5"
        >
          <LogoMark size={30} />
          <span className="text-[19px] font-bold tracking-tight text-fg">
            ibo
          </span>
        </Link>
        <div className="rounded-2xl border border-edge bg-card p-6 shadow-[0_4px_20px_rgba(45,106,79,0.08)] sm:p-8">
          <h1 className="text-2xl font-bold text-fg sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <p className="mt-4 text-center text-sm text-fg-muted">{footer}</p>
        )}
      </SectionReveal>
    </main>
  )
}
```

- [ ] **Step 5: Убрать `font-mono` у OTP-инпута в `app/login/login-form.tsx`**

Строка 161: `className="font-mono tracking-[0.3em]"` → `className="tracking-[0.3em]"`

- [ ] **Step 6: Проверка**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/ src/components/auth/ app/login/login-form.tsx
git commit -m "feat: restyle auth pages and ui primitives to v3"
```

---

### Task 6: API-прослойка чата (multipart + route handler)

**Files:**
- Modify: `src/lib/api-server.ts` (только блок fetch)
- Create: `src/lib/chat-schemas.ts`
- Create: `app/api/chat/message/route.ts`

**Interfaces:**
- Consumes: `apiFetch(path, init)` / `ApiError` из `src/lib/api-server.ts`, `TOKEN_COOKIE` из `src/lib/auth-cookies.ts`, `ru.auth.errors.*`
- Produces: `POST /api/chat/message` — принимает FormData `{ chatId?: string; text?: string; image?: File }` (нужен `text` и/или `image`); ответ `200 { chatId: string; answer: string }` либо `{ message: string }` со статусом ошибки. Task 7 (ChatView) ходит только сюда.

- [ ] **Step 1: Научить `apiFetch` пропускать FormData**

В `src/lib/api-server.ts` заменить блок:

```ts
  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    })
  } catch (error) {
```

на:

```ts
  let res: Response
  try {
    // для FormData Content-Type ставит fetch (boundary), вручную нельзя
    const isFormData = init?.body instanceof FormData
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: isFormData
        ? init?.headers
        : { "Content-Type": "application/json", ...init?.headers },
    })
  } catch (error) {
```

- [ ] **Step 2: Создать `src/lib/chat-schemas.ts`**

```ts
import { z } from "zod"

export const chatCreateResponseSchema = z.object({
  id: z.uuid(),
})

export const diagnosisResponseSchema = z.object({
  answer: z.string(),
})
```

- [ ] **Step 3: Создать `app/api/chat/message/route.ts`**

```ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import ru from "@/src/i18n/ru.json"
import { ApiError, apiFetch } from "@/src/lib/api-server"
import { TOKEN_COOKIE } from "@/src/lib/auth-cookies"
import {
  chatCreateResponseSchema,
  diagnosisResponseSchema,
} from "@/src/lib/chat-schemas"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const store = await cookies()
    const token = store.get(TOKEN_COOKIE)?.value
    if (!token) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 401 }
      )
    }
    const authHeaders = { Authorization: `Bearer ${token}` }

    const form = await request.formData().catch(() => null)
    if (!form) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    const text = form.get("text")
    const image = form.get("image")
    const chatIdRaw = form.get("chatId")
    const trimmedText = typeof text === "string" ? text.trim() : ""
    const hasImage = image instanceof File && image.size > 0
    if (!trimmedText && !hasImage) {
      return NextResponse.json(
        { message: ru.auth.errors.checkData },
        { status: 400 }
      )
    }

    let chatId =
      typeof chatIdRaw === "string" && chatIdRaw.length > 0 ? chatIdRaw : null
    if (!chatId) {
      const created = await apiFetch("/chat/", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({}),
      })
      const parsed = chatCreateResponseSchema.safeParse(created)
      if (!parsed.success) {
        console.error("[chat/message] unexpected create-chat response:", created)
        return NextResponse.json(
          { message: ru.auth.errors.unexpectedResponse },
          { status: 502 }
        )
      }
      chatId = parsed.data.id
    }

    const backendForm = new FormData()
    backendForm.set("chat_id", chatId)
    if (trimmedText) backendForm.set("user_text", trimmedText)
    if (hasImage) backendForm.set("user_image", image)

    const data = await apiFetch("/diagnosis/", {
      method: "POST",
      headers: authHeaders,
      body: backendForm,
    })
    const diagnosis = diagnosisResponseSchema.safeParse(data)
    if (!diagnosis.success) {
      console.error("[chat/message] unexpected diagnosis response:", data)
      return NextResponse.json(
        { message: ru.auth.errors.unexpectedResponse },
        { status: 502 }
      )
    }

    return NextResponse.json({ chatId, answer: diagnosis.data.answer })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }
    console.error("[chat/message]", error)
    return NextResponse.json(
      { message: ru.auth.errors.unavailable },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: Проверка**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 5: Commit**

```bash
git add src/lib/api-server.ts src/lib/chat-schemas.ts app/api/chat/
git commit -m "feat: add chat message api route with lazy chat creation"
```

---

### Task 7: UI чата на реальном API

**Files:**
- Create: `src/components/chat/types.ts`
- Create: `src/components/chat/logout-button.tsx` (перенос из `app/chat/logout-button.tsx` + рестайл)
- Delete: `app/chat/logout-button.tsx`
- Create: `src/components/chat/chat-header.tsx`
- Create: `src/components/chat/empty-state.tsx`
- Create: `src/components/chat/typing-indicator.tsx`
- Create: `src/components/chat/message-list.tsx`
- Create: `src/components/chat/chat-input.tsx`
- Create: `src/components/chat/chat-view.tsx`
- Modify: `app/chat/page.tsx`
- Modify: `app/globals.css` (анимация ростка)
- Modify: `src/i18n/ru.json` (новый раздел `chat`, удалить `auth.chat`)

**Interfaces:**
- Consumes: `POST /api/chat/message` из Task 6, `DURATION`/`EASE_OUT` из `src/lib/motion-tokens.ts`, токены Task 1
- Produces: страница `/chat` целиком; `ChatMessage { id: string; role: "user" | "bot"; text: string; imageUrl?: string; imageName?: string }`

- [ ] **Step 1: Обновить `src/i18n/ru.json`**

Добавить верхнеуровневый раздел `chat` (после `footer`):

```json
"chat": {
  "back": "← На главную",
  "botName": "АгроБот",
  "online": "онлайн",
  "emptyTitle": "Чем помочь на поле сегодня?",
  "emptySubtitle": "Задайте вопрос или выберите один из примеров ниже",
  "suggestions": [
    "Чем обработать томаты от фитофторы?",
    "Когда сеять пшеницу?",
    "Какие удобрения нужны кукурузе?",
    "Как защитить сад от заморозков?"
  ],
  "inputPlaceholder": "Спросите про урожай, болезни, удобрения…",
  "attachLabel": "Прикрепить фото",
  "sendLabel": "Отправить",
  "logout": "Выйти",
  "errors": {
    "failed": "Не получилось получить ответ. Попробуйте ещё раз."
  }
},
```

Удалить раздел `auth.chat` целиком (`greetingNamed`, `greeting`, `wip`, `badge`, `logout`) — оба потребителя (`app/chat/page.tsx`, logout-button) переписываются в этой задаче.

- [ ] **Step 2: Добавить анимацию ростка в `app/globals.css`**

Внутрь блока `@theme`, сразу после строки `--font-sans: ...;` (не в блок временных алиасов — он удаляется в Task 8), добавить:

```css
  --animate-sprout-sway: sprout-sway 4s ease-in-out infinite;

  @keyframes sprout-sway {
    0%,
    100% {
      transform: rotate(-2deg);
    }
    50% {
      transform: rotate(2deg);
    }
  }
```

- [ ] **Step 3: Создать `src/components/chat/types.ts`**

```ts
export interface ChatMessage {
  id: string
  role: "user" | "bot"
  text: string
  imageUrl?: string
  imageName?: string
}
```

- [ ] **Step 4: Создать `src/components/chat/logout-button.tsx` и удалить старый**

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ru from "@/src/i18n/ru.json"

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("[logout]", error)
    }
    router.push("/")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className="text-[13px] font-semibold text-fg-faint transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
    >
      {ru.chat.logout}
    </button>
  )
}
```

```bash
git rm app/chat/logout-button.tsx
```

- [ ] **Step 5: Создать `src/components/chat/chat-header.tsx`**

```tsx
import Link from "next/link"
import ru from "@/src/i18n/ru.json"
import { LogoutButton } from "./logout-button"

export function ChatHeader() {
  return (
    <header className="flex items-center gap-3.5 border-b border-edge bg-card px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:bg-mint-soft hover:text-fg"
      >
        {ru.chat.back}
      </Link>
      <span aria-hidden className="h-5 w-px bg-edge" />
      <span
        aria-hidden
        className="flex size-10 items-center justify-center rounded-full bg-accent text-lg"
      >
        🌱
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold text-fg">{ru.chat.botName}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {ru.chat.online}
        </p>
      </div>
      <LogoutButton />
    </header>
  )
}
```

- [ ] **Step 6: Создать `src/components/chat/empty-state.tsx`**

```tsx
import ru from "@/src/i18n/ru.json"

interface EmptyStateProps {
  onSuggestion: (text: string) => void
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="m-auto flex flex-col items-center gap-2 px-5 text-center">
      <span
        aria-hidden
        className="flex size-14 origin-bottom animate-sprout-sway items-center justify-center rounded-full bg-mint-soft text-[26px] motion-reduce:animate-none"
      >
        🌱
      </span>
      <h2 className="mt-2.5 text-xl font-bold text-fg">{ru.chat.emptyTitle}</h2>
      <p className="max-w-[340px] text-sm text-fg-muted">
        {ru.chat.emptySubtitle}
      </p>
      <div className="mt-5 flex max-w-[480px] flex-wrap justify-center gap-2.5">
        {ru.chat.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="rounded-full bg-mint-soft px-4 py-2.5 text-[13.5px] font-medium text-accent transition-colors hover:bg-mint hover:text-fg"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Создать `src/components/chat/typing-indicator.tsx`**

```tsx
"use client"

import { motion, useReducedMotion } from "motion/react"

const DOT_DELAYS = [0, 0.15, 0.3]

export function TypingIndicator() {
  const reduced = useReducedMotion()

  return (
    <span className="flex items-center gap-1.5 rounded-[16px_16px_16px_4px] bg-mint-soft px-4.5 py-4">
      {DOT_DELAYS.map((delay) => (
        <motion.span
          key={delay}
          className="size-1.5 rounded-full bg-accent"
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
        />
      ))}
    </span>
  )
}
```

- [ ] **Step 8: Создать `src/components/chat/message-list.tsx`**

```tsx
"use client"

import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { DURATION, EASE_OUT } from "@/src/lib/motion-tokens"
import { EmptyState } from "./empty-state"
import { TypingIndicator } from "./typing-indicator"
import type { ChatMessage } from "./types"

interface MessageListProps {
  messages: ChatMessage[]
  pending: boolean
  onSuggestion: (text: string) => void
}

function BotAvatar() {
  return (
    <span
      aria-hidden
      className="flex size-8 flex-none items-center justify-center rounded-full bg-accent text-[15px]"
    >
      🌱
    </span>
  )
}

export function MessageList({ messages, pending, onSuggestion }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, pending])

  const isEmpty = messages.length === 0 && !pending

  return (
    <div
      ref={scrollRef}
      aria-live="polite"
      className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4 sm:p-6"
    >
      {isEmpty && <EmptyState onSuggestion={onSuggestion} />}
      {messages.map((m) => (
        <motion.div
          key={m.id}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE_OUT }}
        >
          {m.role === "bot" ? (
            <div className="flex justify-start gap-2.5 pr-[15%]">
              <BotAvatar />
              <p className="rounded-[16px_16px_16px_4px] bg-mint-soft px-4 py-3 text-[14.5px] leading-relaxed text-fg">
                {m.text}
              </p>
            </div>
          ) : (
            <div className="flex justify-end pl-[15%]">
              <div className="flex flex-col items-end gap-2 rounded-[16px_16px_4px_16px] bg-accent px-4 py-3 text-[14.5px] leading-relaxed text-white">
                {m.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     blob-превью локального файла, next/image неприменим */
                  <img
                    src={m.imageUrl}
                    alt={m.imageName ?? ""}
                    className="max-h-40 rounded-lg"
                  />
                )}
                {m.imageName && (
                  <span className="text-xs text-white/80">📎 {m.imageName}</span>
                )}
                {m.text && <span>{m.text}</span>}
              </div>
            </div>
          )}
        </motion.div>
      ))}
      {pending && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.fast }}
          className="flex justify-start gap-2.5"
        >
          <BotAvatar />
          <TypingIndicator />
        </motion.div>
      )}
    </div>
  )
}
```

- [ ] **Step 9: Создать `src/components/chat/chat-input.tsx`**

```tsx
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
```

- [ ] **Step 10: Создать `src/components/chat/chat-view.tsx`**

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import ru from "@/src/i18n/ru.json"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import type { ChatMessage } from "./types"

interface MessageResponse {
  chatId: string
  answer: string
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
    return { chatId: data.chatId, answer: data.answer }
  }
  return null
}

function readErrorMessage(data: unknown): string | null {
  if (
    data !== null &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message
  }
  return null
}

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const chatIdRef = useRef<string | null>(null)
  const objectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [])

  const pushMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...message },
    ])
  }

  const send = async (text: string, image?: File) => {
    const trimmed = text.trim()
    if (pending || (!trimmed && !image)) return

    let imageUrl: string | undefined
    if (image) {
      imageUrl = URL.createObjectURL(image)
      objectUrlsRef.current.push(imageUrl)
    }
    pushMessage({ role: "user", text: trimmed, imageUrl, imageName: image?.name })
    setPending(true)

    try {
      const form = new FormData()
      if (chatIdRef.current) form.set("chatId", chatIdRef.current)
      if (trimmed) form.set("text", trimmed)
      if (image) form.set("image", image)

      const res = await fetch("/api/chat/message", { method: "POST", body: form })
      const data: unknown = await res.json().catch(() => null)

      if (!res.ok) {
        pushMessage({
          role: "bot",
          text: readErrorMessage(data) ?? ru.chat.errors.failed,
        })
        return
      }

      const parsed = parseMessageResponse(data)
      if (!parsed) {
        pushMessage({ role: "bot", text: ru.auth.errors.unexpectedResponse })
        return
      }
      chatIdRef.current = parsed.chatId
      pushMessage({ role: "bot", text: parsed.answer })
    } catch {
      pushMessage({ role: "bot", text: ru.auth.errors.network })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[800px] flex-1 flex-col">
      <MessageList
        messages={messages}
        pending={pending}
        onSuggestion={(text) => void send(text)}
      />
      <ChatInput pending={pending} onSend={(text, image) => void send(text, image)} />
    </div>
  )
}
```

- [ ] **Step 11: Переписать `app/chat/page.tsx`**

```tsx
import type { Metadata } from "next"
import { ChatHeader } from "@/src/components/chat/chat-header"
import { ChatView } from "@/src/components/chat/chat-view"

export const metadata: Metadata = {
  title: "ibo — чат",
}

export default function ChatPage() {
  return (
    <main className="flex h-dvh flex-col">
      <ChatHeader />
      <ChatView />
    </main>
  )
}
```

Импорты `cookies`, `parseAuthUser`, `USER_COOKIE` и greeting-логика удаляются.

- [ ] **Step 12: Проверка**

Run: `bunx tsc --noEmit`
Expected: без ошибок

- [ ] **Step 13: Commit**

```bash
git add -A app/chat/ app/globals.css src/components/chat/ src/i18n/ru.json
git commit -m "feat: add real-api chat ui with suggestions and photo upload"
```

---

### Task 8: Cleanup, lint, build и ручная проверка

**Files:**
- Modify: `app/globals.css` (удалить алиасы)

**Interfaces:**
- Consumes: результаты Task 1–7
- Produces: чистая кодовая база без переходных алиасов; зелёные lint/tsc/build

- [ ] **Step 1: Убедиться, что старые классы не используются**

Run: `grep -rn "font-display\|font-mono\|bg-elevated\|fg-soft" app src --include="*.tsx"`
Expected: пусто (exit code 1). Если есть совпадения — это пропуски задач 2–7, исправить по образцу соответствующей задачи.

- [ ] **Step 2: Удалить алиасы из `app/globals.css`**

Удалить блок:

```css
  /* временные алиасы до Task 8 (cleanup) — держат нерестайленные компоненты */
  --color-bg-elevated: #ffffff;
  --color-fg-soft: #1f4e39;
  --font-display: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-manrope), ui-sans-serif, system-ui, sans-serif;
```

- [ ] **Step 3: Полная верификация**

Run: `bunx tsc --noEmit && bun run lint && bun run build`
Expected: всё чисто, build успешен

- [ ] **Step 4: Ручной флоу (нужен `bun run dev` и доступный API_URL)**

1. `/` — лендинг в стиле v3: крем-палитра, Manrope, мокап чата в hero, секции how-it-works/features, футер; на ~375px нет горизонтального скролла
2. Хедер: якоря «Возможности»/«Как это работает» скроллят к секциям; «Начать чат» без логина → редирект на `/login`
3. Логин по OTP → `/chat`
4. Пустое состояние: росток покачивается, 4 чипа; клик по чипу → сообщение + typing-индикатор → реальный ответ
5. Текстовый вопрос через инпут (Enter и кнопка ↑) → ответ
6. 📎 → выбор фото → превью в баббле → ответ по фото
7. «← На главную» и «Выйти» работают
8. Результаты зафиксировать в `.superpowers/sdd/progress.md`

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "chore: drop transitional v2 token aliases"
```
