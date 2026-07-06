# ibo Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Одностраничный лендинг ibo в тёмном премиум-стиле с анимацией растущих неон-ростков.

**Architecture:** Next.js App Router, Server Components везде кроме компонентов с анимацией (`'use client'` только header, growing-sprouts, section-reveal). Тексты — из `src/i18n/ru.json`. Дизайн-токены — через Tailwind 4 `@theme` в `globals.css`. Анимации — motion/react (инлайн SVG path animation).

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, motion/react. Пакетный менеджер — **bun**.

**Spec:** `docs/superpowers/specs/2026-07-06-ibo-landing-design.md`

## Global Constraints

- Палитра строго из спеки: `bg #081410`, `bg-elevated #0D1F17`, `accent #4ADE80`, `accent-dim #22C55E`, `text #F0FDF4`, `text-muted #86A896`, `border #1E3A2C`
- Заголовки — шрифт Unbounded (Google Fonts, subsets latin+cyrillic), текст — Geist Sans
- Никакого `any`; интерфейсы для всех props
- Имена файлов — kebab-case
- `'use client'` только где есть анимация/интерактив
- Анимации: только `transform`/`opacity`; при `prefers-reduced-motion` — статичная версия
- Ссылки header/CTA: «Войти» → `/login`, «Начать бесплатно» → `/register` (роуты НЕ создавать — вне скоупа)
- Все пользовательские тексты — только из `src/i18n/ru.json`, не хардкодить в компонентах
- В проекте нет тест-раннера — верификация каждой задачи: `bunx tsc --noEmit` (чисто) + для финальной задачи прод-сборка и curl-проверки отрендеренного HTML
- Коммиты: Conventional Commits, английский

---

### Task 1: Дизайн-токены, шрифты и тексты

**Files:**
- Modify: `app/globals.css` (полная замена)
- Modify: `app/layout.tsx`
- Modify: `src/i18n/ru.json` (полная замена, сейчас там `{}`)

**Interfaces:**
- Consumes: —
- Produces: Tailwind-классы `bg-bg`, `bg-bg-elevated`, `text-fg`, `text-fg-muted`, `text-accent`, `bg-accent`, `border-edge`, `font-display`; CSS-переменная `--font-unbounded`; JSON-объект `ru` с ключами `header`, `hero`, `features`, `howItWorks`, `footer` (структуры ниже — задачи 3–6 импортируют `ru from "@/src/i18n/ru.json"`)

- [ ] **Step 1: Заменить `app/globals.css` целиком**

```css
@import "tailwindcss";

@theme {
  --color-bg: #081410;
  --color-bg-elevated: #0d1f17;
  --color-accent: #4ade80;
  --color-accent-dim: #22c55e;
  --color-fg: #f0fdf4;
  --color-fg-muted: #86a896;
  --color-edge: #1e3a2c;
  --font-display: var(--font-unbounded), var(--font-geist-sans), sans-serif;
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
```

- [ ] **Step 2: Обновить `app/layout.tsx`** — добавить Unbounded, `lang="ru"`

Полное содержимое файла:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
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
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Заполнить `src/i18n/ru.json`** (полная замена)

```json
{
  "header": {
    "login": "Войти",
    "register": "Начать бесплатно"
  },
  "hero": {
    "badge": "AI для агрономов",
    "title": "AI-агроном в вашем кармане",
    "subtitle": "Сфотографируйте растение — ibo определит болезнь и подскажет, как лечить. С учётом вашего региона, на трёх языках.",
    "ctaPrimary": "Начать бесплатно",
    "ctaSecondary": "Как это работает"
  },
  "features": {
    "title": "Всё, что нужно агроному",
    "items": [
      {
        "icon": "📷",
        "title": "Диагноз по фото",
        "description": "Загрузите фото растения — AI определит культуру и болезнь за секунды."
      },
      {
        "icon": "💬",
        "title": "AI-чат агроном",
        "description": "Задавайте вопросы про посевы, уход и защиту растений в любое время."
      },
      {
        "icon": "📍",
        "title": "Советы под ваш регион",
        "description": "ibo учитывает геолокацию и климат вашего поля."
      },
      {
        "icon": "🌐",
        "title": "Три языка",
        "description": "Кыргызский, русский и английский — общайтесь как удобно."
      }
    ]
  },
  "howItWorks": {
    "title": "Как это работает",
    "steps": [
      {
        "title": "Сфотографируйте",
        "description": "Сделайте фото проблемного растения прямо на поле."
      },
      {
        "title": "Отправьте в чат",
        "description": "Прикрепите фото и опишите, что беспокоит."
      },
      {
        "title": "Получите диагноз",
        "description": "ibo назовёт болезнь и даст план лечения."
      }
    ]
  },
  "footer": {
    "copyright": "© 2026 ibo — AI-помощник агронома"
  }
}
```

- [ ] **Step 4: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: пустой вывод (0 ошибок)

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx src/i18n/ru.json
git commit -m "feat: add dark premium design tokens, unbounded font and ru texts"
```

---

### Task 2: Motion-токены и SectionReveal

**Files:**
- Create: `src/lib/motion-tokens.ts`
- Create: `src/components/landing/section-reveal.tsx`

**Interfaces:**
- Consumes: —
- Produces:
  - `motion-tokens.ts`: `DURATION: { fast: 0.2, base: 0.45, slow: 0.8 }`, `EASE_OUT: [number, number, number, number]`, `REVEAL_OFFSET: number`, `SPROUT_GROW_DURATION: number`, `SPROUT_STAGGER: number`
  - `SectionReveal({ children, className?, delay? }: SectionRevealProps)` — обёртка fade-up при скролле; задачи 5–6 оборачивают в неё контент

- [ ] **Step 1: Создать `src/lib/motion-tokens.ts`**

```ts
export const DURATION = {
  fast: 0.2,
  base: 0.45,
  slow: 0.8,
} as const

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

export const REVEAL_OFFSET = 24

export const SPROUT_GROW_DURATION = 1.2

export const SPROUT_STAGGER = 0.15
```

- [ ] **Step 2: Создать `src/components/landing/section-reveal.tsx`**

```tsx
"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"
import { DURATION, EASE_OUT, REVEAL_OFFSET } from "@/src/lib/motion-tokens"

interface SectionRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function SectionReveal({
  children,
  className,
  delay = 0,
}: SectionRevealProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: REVEAL_OFFSET }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: DURATION.base, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: пустой вывод

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion-tokens.ts src/components/landing/section-reveal.tsx
git commit -m "feat: add motion tokens and section reveal wrapper"
```

---

### Task 3: Header и Footer

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`

**Interfaces:**
- Consumes: `ru.header.login`, `ru.header.register`, `ru.footer.copyright` из `@/src/i18n/ru.json` (Task 1)
- Produces: `Header()` (client, sticky + блюр при скролле), `Footer()` (server) — Task 7 подключает их в `page.tsx`

- [ ] **Step 1: Создать `src/components/layout/header.tsx`**

```tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import ru from "@/src/i18n/ru.json"

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
          ? "border-b border-edge bg-bg-elevated/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-bold text-fg">
          ibo<span className="text-accent">●</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            {ru.header.login}
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg transition-shadow hover:shadow-[0_0_20px_rgba(74,222,128,0.4)]"
          >
            {ru.header.register}
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Создать `src/components/layout/footer.tsx`**

```tsx
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
```

- [ ] **Step 3: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: пустой вывод

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/footer.tsx
git commit -m "feat: add sticky header with scroll blur and footer"
```

---

### Task 4: Анимация растущих ростков (GrowingSprouts)

**Files:**
- Create: `src/components/landing/growing-sprouts.tsx`

**Interfaces:**
- Consumes: `SPROUT_GROW_DURATION`, `SPROUT_STAGGER` из `@/src/lib/motion-tokens` (Task 2)
- Produces: `GrowingSprouts({ className }: { className?: string })` — декоративный SVG (`aria-hidden`); Task 5 размещает его абсолютом внизу hero

- [ ] **Step 1: Создать `src/components/landing/growing-sprouts.tsx`**

7 стеблей, фазы: прорастание (`pathLength` 0→1, stagger), раскрытие листьев (scale от точки крепления), затем бесконечное покачивание (`rotate` ±1.5°). При `prefers-reduced-motion` — статика через `initial={false}`.

```tsx
"use client"

import { motion, useReducedMotion } from "motion/react"
import { SPROUT_GROW_DURATION, SPROUT_STAGGER } from "@/src/lib/motion-tokens"

interface SproutConfig {
  x: number
  height: number
  swayDuration: number
}

const SPROUTS: SproutConfig[] = [
  { x: 60, height: 140, swayDuration: 5.2 },
  { x: 260, height: 200, swayDuration: 4.4 },
  { x: 480, height: 120, swayDuration: 5.8 },
  { x: 720, height: 230, swayDuration: 4.8 },
  { x: 960, height: 150, swayDuration: 5.5 },
  { x: 1160, height: 210, swayDuration: 4.2 },
  { x: 1360, height: 130, swayDuration: 6.0 },
]

const BASE_Y = 320

function stemPath({ x, height }: SproutConfig): string {
  const topY = BASE_Y - height
  const c1y = BASE_Y - height * 0.45
  const c2y = BASE_Y - height * 0.7
  return `M ${x} ${BASE_Y} C ${x - 14} ${c1y}, ${x + 14} ${c2y}, ${x} ${topY}`
}

function leafPath(cx: number, cy: number, dir: 1 | -1): string {
  return [
    `M ${cx} ${cy}`,
    `C ${cx + 26 * dir} ${cy - 6}, ${cx + 34 * dir} ${cy - 28}, ${cx + 18 * dir} ${cy - 40}`,
    `C ${cx + 6 * dir} ${cy - 26}, ${cx} ${cy - 12}, ${cx} ${cy} Z`,
  ].join(" ")
}

interface GrowingSproutsProps {
  className?: string
}

export function GrowingSprouts({ className }: GrowingSproutsProps) {
  const reduced = useReducedMotion()

  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      {SPROUTS.map((sprout, i) => {
        const growDelay = i * SPROUT_STAGGER
        const leaves = [
          { cy: BASE_Y - sprout.height * 0.45, dir: 1 as const },
          { cy: BASE_Y - sprout.height * 0.65, dir: -1 as const },
        ]

        return (
          <motion.g
            key={sprout.x}
            animate={reduced ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
            transition={{
              duration: sprout.swayDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: growDelay + SPROUT_GROW_DURATION,
            }}
            style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
          >
            <motion.path
              d={stemPath(sprout)}
              fill="none"
              stroke="#4ade80"
              strokeWidth={3}
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: SPROUT_GROW_DURATION,
                delay: growDelay,
                ease: "easeOut",
              }}
            />
            {leaves.map((leaf) => (
              <motion.path
                key={leaf.dir}
                d={leafPath(sprout.x, leaf.cy, leaf.dir)}
                fill="#4ade80"
                fillOpacity={0.85}
                initial={reduced ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: growDelay + SPROUT_GROW_DURATION * 0.6,
                  ease: "backOut",
                }}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: leaf.dir === 1 ? "left bottom" : "right bottom",
                }}
              />
            ))}
          </motion.g>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: пустой вывод

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/growing-sprouts.tsx
git commit -m "feat: add growing neon sprouts svg animation"
```

---

### Task 5: Hero-секция

**Files:**
- Create: `src/components/landing/hero.tsx`

**Interfaces:**
- Consumes: `ru.hero.*` (Task 1), `GrowingSprouts` (Task 4)
- Produces: `Hero()` (server) — Task 7 подключает в `page.tsx`

- [ ] **Step 1: Создать `src/components/landing/hero.tsx`**

Server Component: текст рендерится первым (LCP), анимация — декоративный слой абсолютом внизу.

```tsx
import Link from "next/link"
import ru from "@/src/i18n/ru.json"
import { GrowingSprouts } from "./growing-sprouts"

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-40 pt-24 text-center md:pb-64">
      <span className="mb-6 rounded-full border border-edge bg-bg-elevated px-4 py-1.5 text-sm text-accent">
        {ru.hero.badge}
      </span>
      <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-fg md:text-6xl">
        {ru.hero.title}
      </h1>
      <p className="mt-6 max-w-xl text-base text-fg-muted md:text-lg">
        {ru.hero.subtitle}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/register"
          className="rounded-xl bg-accent px-6 py-3 font-semibold text-bg transition-shadow hover:shadow-[0_0_24px_rgba(74,222,128,0.45)]"
        >
          {ru.hero.ctaPrimary}
        </Link>
        <a
          href="#how-it-works"
          className="rounded-xl border border-edge px-6 py-3 text-fg-muted transition-colors hover:border-accent hover:text-fg"
        >
          {ru.hero.ctaSecondary} ↓
        </a>
      </div>
      <GrowingSprouts className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-90 md:h-64 [filter:drop-shadow(0_0_8px_rgba(74,222,128,0.35))]" />
    </section>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: пустой вывод

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat: add hero section with sprouts animation layer"
```

---

### Task 6: Секции «Возможности» и «Как это работает»

**Files:**
- Create: `src/components/landing/features.tsx`
- Create: `src/components/landing/how-it-works.tsx`

**Interfaces:**
- Consumes: `ru.features.*`, `ru.howItWorks.*` (Task 1), `SectionReveal` (Task 2)
- Produces: `Features()`, `HowItWorks()` (server) — Task 7 подключает в `page.tsx`; `HowItWorks` имеет `id="how-it-works"` (якорь для CTA из hero)

- [ ] **Step 1: Создать `src/components/landing/features.tsx`**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <SectionReveal>
        <h2 className="text-center font-display text-3xl font-bold text-fg md:text-4xl">
          {ru.features.title}
        </h2>
      </SectionReveal>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ru.features.items.map((item, i) => (
          <SectionReveal key={item.title} delay={i * 0.08} className="h-full">
            <article className="h-full rounded-2xl border border-edge bg-bg-elevated p-6 transition-shadow hover:shadow-[0_0_24px_rgba(74,222,128,0.15)]">
              <span className="text-3xl" aria-hidden="true">
                {item.icon}
              </span>
              <h3 className="mt-4 font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{item.description}</p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Создать `src/components/landing/how-it-works.tsx`**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "./section-reveal"

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24"
    >
      <SectionReveal>
        <h2 className="text-center font-display text-3xl font-bold text-fg md:text-4xl">
          {ru.howItWorks.title}
        </h2>
      </SectionReveal>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {ru.howItWorks.steps.map((step, i) => (
          <SectionReveal key={step.title} delay={i * 0.12}>
            <div className="text-center">
              <span className="font-display text-5xl font-bold text-accent [text-shadow:0_0_20px_rgba(74,222,128,0.4)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-semibold text-fg">{step.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{step.description}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Проверить типы**

Run: `bunx tsc --noEmit`
Expected: пустой вывод

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/features.tsx src/components/landing/how-it-works.tsx
git commit -m "feat: add features and how-it-works sections"
```

---

### Task 7: Сборка страницы и финальная верификация

**Files:**
- Modify: `app/page.tsx` (полная замена дефолтного содержимого)

**Interfaces:**
- Consumes: `Header`, `Footer` (Task 3), `Hero` (Task 5), `Features`, `HowItWorks` (Task 6)
- Produces: готовый лендинг на `/`

- [ ] **Step 1: Заменить `app/page.tsx` целиком**

```tsx
import { Header } from "@/src/components/layout/header"
import { Footer } from "@/src/components/layout/footer"
import { Hero } from "@/src/components/landing/hero"
import { Features } from "@/src/components/landing/features"
import { HowItWorks } from "@/src/components/landing/how-it-works"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Типы и линт**

Run: `bunx tsc --noEmit && bun run lint`
Expected: 0 ошибок

- [ ] **Step 3: Прод-сборка**

Run: `bun run build`
Expected: `✓ Generating static pages`, роут `/` присутствует, 0 ошибок

- [ ] **Step 4: Проверить отрендеренный HTML**

```bash
PORT=3100 bun run start &
sleep 4
curl -s http://localhost:3100 | grep -c "AI-агроном"        # ожидается ≥ 1
curl -s http://localhost:3100 | grep -c 'href="/login"'     # ожидается ≥ 1
curl -s http://localhost:3100 | grep -c 'href="/register"'  # ожидается ≥ 2 (header + hero CTA)
curl -s http://localhost:3100 | grep -c 'id="how-it-works"' # ожидается ≥ 1
kill %1
```

Expected: все grep вернули число ≥ указанного

- [ ] **Step 5: Визуальная проверка** (вручную или скриншотом): `bun run dev`, открыть `http://localhost:3000` — ростки прорастают при загрузке, header блюрится при скролле, секции появляются fade-up. Проверить ширины 360px / 768px / 1440px — ничего не ломается. Прогнать Lighthouse (mobile) в Chrome DevTools на прод-сборке: performance ≥ 90

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble ibo landing page"
```
