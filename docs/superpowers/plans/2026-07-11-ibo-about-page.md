# ibo About Page & Nav Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `/about` page (AGRO IBO / HYDROWOOLKS), rework header/footer nav, unify all chat CTAs to «Начать чат», turn hero trust items into mint chips, add card hover effects.

**Architecture:** Static Server Components only. New sections live in `src/components/about/`, one file per section, texts in `src/i18n/ru.json` under `about`. Icons extend the existing `src/components/ui/icons.tsx` registry pattern. Reveal animation reuses `SectionReveal`.

**Tech Stack:** Next.js App Router (see `node_modules/next/dist/docs/` — this version has breaking changes), React 19, Tailwind CSS v4 tokens from `app/globals.css`, TypeScript strict, bun.

**Spec:** `docs/superpowers/specs/2026-07-11-ibo-about-page-design.md`

## Global Constraints

- No `any`; no `.then()`; file names kebab-case.
- No `'use client'` in new components (only existing `header.tsx` already has it).
- All user-visible strings come from `src/i18n/ru.json` — no hardcoded Russian text in TSX.
- Design tokens only (`bg`, `card`, `section-alt`, `edge`, `fg`, `fg-muted`, `fg-faint`, `accent`, `accent-strong`, `mint`, `mint-soft`); the single allowed arbitrary color is hover border `#cfe3d6`.
- The unified chat CTA text is exactly «Начать чат», sourced from the single key `header.startChat`.
- No test framework in this repo: each task's test cycle is `bunx tsc --noEmit` + `bun run lint` (expect exit 0, zero warnings); final task adds `bun run build` + curl smoke.
- `src/components/landing/how-it-works.tsx` currently uses semicolons (formatter); preserve each file's existing style when editing.
- Conventional Commits, English, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` trailer.

---

### Task 1: New SVG icons + AboutIcon registry

**Files:**
- Modify: `src/components/ui/icons.tsx` (append after `CheckIcon`, lines ~134-140; extend the registry section at the end)

**Interfaces:**
- Consumes: existing `IconBase`, `IconProps`, `FlaskIcon`.
- Produces: exported components `SparkleIcon`, `GlobeIcon`, `ConsultIcon`, `SchemeIcon`, `LeafIcon`, `RootsIcon`, `GrowthIcon`, `ResilienceIcon`, `BloomIcon`, `HarvestIcon`, `StarIcon`, `RenewIcon`, `ShieldCheckIcon` — all `(props: IconProps) => ReactElement`; type `AboutIconId`; component `AboutIcon({ id, ...props }: { id: AboutIconId } & IconProps)`.

- [ ] **Step 1: Append the new icon components** after `CheckIcon` in `src/components/ui/icons.tsx`:

```tsx
export function SparkleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.5 13.7 9.8 19 11.5l-5.3 1.7L12 18.5l-1.7-5.3L5 11.5l5.3-1.7L12 4.5Z" />
    </IconBase>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.2 2 3.4 5 3.4 8s-1.2 6-3.4 8c-2.2-2-3.4-5-3.4-8s1.2-6 3.4-8Z" />
    </IconBase>
  )
}

export function ConsultIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10" cy="8.5" r="3" />
      <path d="M4.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="m16.5 12.5 1.6 1.6L21 11" />
    </IconBase>
  )
}

export function SchemeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="6" y="5" width="12" height="15" rx="1.6" />
      <path d="M9 4.5h6a1 1 0 0 1 1 1v1H8v-1a1 1 0 0 1 1-1Z" />
      <path d="M9 11h6M9 14.5h6M9 8h3" />
    </IconBase>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 18c-1-5 1-11 12-12 1 8-3 12-8 12-1.5 0-2.8-.2-4-1Z" />
      <path d="M6 18c1.6-3 4-5.4 8-7.2" />
    </IconBase>
  )
}

export function RootsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v6" />
      <path d="M12 10c-1.5 1-2.3 3-2 6M12 10c1.5 1 2.3 3 2 6M12 10c-2.8 1-4.3 3.6-4.5 6.5M12 10c2.8 1 4.3 3.6 4.5 6.5" />
    </IconBase>
  )
}

export function GrowthIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4 16 5-5 3.5 3.5L20 7" />
      <path d="M14.5 7H20v5.5" />
    </IconBase>
  )
}

export function ResilienceIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M11 5.5a2 2 0 1 1 4 0v8.4a4 4 0 1 1-4 0V5.5Z" />
      <path d="M13 9v5.5" />
    </IconBase>
  )
}

export function BloomIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="7" r="2.3" />
      <circle cx="12" cy="17" r="2.3" />
      <circle cx="7" cy="12" r="2.3" />
      <circle cx="17" cy="12" r="2.3" />
    </IconBase>
  )
}

export function HarvestIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 19v-8M12 19V5M19 19v-6" />
    </IconBase>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 4.2 2.2 4.6 5 .7-3.6 3.5.8 5-4.4-2.4-4.4 2.4.8-5-3.6-3.5 5-.7L12 4.2Z" />
    </IconBase>
  )
}

export function RenewIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7" />
      <path d="M17.7 3.5v3.3h-3.3M6.3 20.5v-3.3h3.3" />
    </IconBase>
  )
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3.5 7 2.4v5.4c0 4.6-2.9 7.9-7 9.2-4.1-1.3-7-4.6-7-9.2V5.9l7-2.4Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </IconBase>
  )
}
```

- [ ] **Step 2: Append the About registry** at the end of `src/components/ui/icons.tsx` (after the existing `LandingIcon` function):

```tsx
export type AboutIconId =
  | "flask"
  | "consult"
  | "scheme"
  | "globe"
  | "leaf"
  | "roots"
  | "growth"
  | "resilience"
  | "bloom"
  | "harvest"
  | "star"
  | "renew"
  | "shield"

const ABOUT_ICONS: Record<AboutIconId, (props: IconProps) => ReactElement> = {
  flask: FlaskIcon,
  consult: ConsultIcon,
  scheme: SchemeIcon,
  globe: GlobeIcon,
  leaf: LeafIcon,
  roots: RootsIcon,
  growth: GrowthIcon,
  resilience: ResilienceIcon,
  bloom: BloomIcon,
  harvest: HarvestIcon,
  star: StarIcon,
  renew: RenewIcon,
  shield: ShieldCheckIcon,
}

export function AboutIcon({ id, ...props }: { id: AboutIconId } & IconProps) {
  const Component = ABOUT_ICONS[id]
  return <Component {...props} />
}
```

- [ ] **Step 3: Verify**

Run: `bunx tsc --noEmit && bun run lint`
Expected: both exit 0, no warnings.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/icons.tsx
git commit -m "feat: add about page icon set and AboutIcon registry"
```

---

### Task 2: Unified CTA + hero trust chips

**Files:**
- Modify: `src/i18n/ru.json` (`hero` section, lines 10-26)
- Modify: `src/components/landing/hero.tsx`

**Interfaces:**
- Consumes: `CheckIcon`, `SparkleIcon`, `GlobeIcon` from Task 1; existing key `header.startChat` («Начать чат»).
- Produces: `hero.trust` in ru.json becomes `Array<{ icon: "check" | "sparkle" | "globe"; text: string }>`; key `hero.ctaPrimary` is deleted (all chat CTAs read `header.startChat`).

- [ ] **Step 1: Update `ru.json` hero section** — delete `"ctaPrimary": "Задать вопрос",` and replace the `trust` array:

```json
    "trust": [
      { "icon": "check", "text": "Бесплатно" },
      { "icon": "sparkle", "text": "Работает на основе ИИ" },
      { "icon": "globe", "text": "RU / KY" }
    ],
```

- [ ] **Step 2: Update `src/components/landing/hero.tsx`.** Replace the import line 3 and the two JSX fragments:

Import:
```tsx
import { CheckIcon, GlobeIcon, SparkleIcon, type IconProps } from "@/src/components/ui/icons"
```

Add above `export function Hero()`:
```tsx
type TrustIconId = "check" | "sparkle" | "globe"

const TRUST_ICONS: Record<TrustIconId, (props: IconProps) => React.ReactElement> = {
  check: CheckIcon,
  sparkle: SparkleIcon,
  globe: GlobeIcon,
}
```
(`import type { ReactElement } from "react"` + `ReactElement` instead of `React.ReactElement` if the file has no React namespace import — it doesn't, so use the type import form.)

CTA link (was `{ru.hero.ctaPrimary}`):
```tsx
            {ru.header.startChat}
```

Trust list (replace the whole `<ul>…</ul>`, lines 33-43):
```tsx
        <ul className="mt-10 flex flex-wrap items-center gap-3 border-t border-edge pt-7">
          {ru.hero.trust.map((item, i) => {
            const Icon = TRUST_ICONS[item.icon as TrustIconId]
            return (
              <li
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-4 py-2 text-[13px] font-semibold text-accent"
              >
                <Icon size={15} />
                {item.text}
              </li>
            )
          })}
        </ul>
```

- [ ] **Step 3: Verify no stale key usage**

Run: `grep -rn "ctaPrimary" src app && echo "STALE" || echo "clean"`
Expected: `clean`.

Run: `bunx tsc --noEmit && bun run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/ru.json src/components/landing/hero.tsx
git commit -m "feat: unify chat cta text and restyle hero trust badges as chips"
```

---

### Task 3: Card hover effects on landing

**Files:**
- Modify: `src/components/landing/features.tsx` (the `<article>` className, line ~17)
- Modify: `src/components/landing/how-it-works.tsx` (the `<article>` className, line ~19; this file uses semicolons — keep them)

**Interfaces:** none (pure styling).

- [ ] **Step 1: features.tsx** — replace the article className with:

```tsx
              <article className="h-full rounded-2xl border border-edge/60 bg-card p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] transition-all duration-300 hover:-translate-y-[3px] hover:border-[#cfe3d6] hover:shadow-[0_16px_34px_rgba(45,106,79,0.13)] motion-reduce:transform-none">
```

- [ ] **Step 2: how-it-works.tsx** — replace the article className with:

```tsx
            <article className="h-full rounded-2xl border border-edge bg-bg p-7 transition-all duration-300 hover:-translate-y-[3px] hover:border-[#cfe3d6] hover:shadow-[0_14px_32px_rgba(45,106,79,0.12)] motion-reduce:transform-none">
```

- [ ] **Step 3: Verify**

Run: `bunx tsc --noEmit && bun run lint`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/features.tsx src/components/landing/how-it-works.tsx
git commit -m "feat: add hover lift effect to landing cards"
```

---

### Task 4: About i18n + hero, brand, activities sections

**Files:**
- Modify: `src/i18n/ru.json` (insert `"about": {…}` between `hero` and `features`)
- Create: `src/components/about/about-hero.tsx`
- Create: `src/components/about/brand-card.tsx`
- Create: `src/components/about/activities.tsx`

**Interfaces:**
- Consumes: `SectionReveal` from `@/src/components/landing/section-reveal` (props: `children`, `delay?: number`, `className?: string`); `AboutIcon`/`AboutIconId`, `LeafIcon` from Task 1.
- Produces: exported components `AboutHero()`, `BrandCard()`, `Activities()` (no props); ru.json key `about` with sub-keys `metaTitle`, `metaDescription`, `badge`, `title`, `subtitle`, `brand{overline,name,description}`, `activities{title,items[{icon,title,description}]}`, `product{…}` (Task 5), `packaging{…}` (Task 5), `mission{…}` (Task 5). Add the WHOLE `about` object now so Task 5 only creates components.

- [ ] **Step 1: Insert into `ru.json`** after the `hero` object (before `"features"`):

```json
  "about": {
    "metaTitle": "О нас — ibo",
    "metaDescription": "AGRO IBO — отечественная компания, развивающая сельское хозяйство Кыргызстана. Органические удобрения HYDROWOOLKS и ИИ-помощник агронома.",
    "badge": "О компании",
    "title": "AGRO IBO — отечественная компания, развивающая сельское хозяйство Кыргызстана",
    "subtitle": "Наша главная цель — повышать урожайность и сохранять плодородие почвы, предлагая дыйканам качественные, экологически безопасные и высокоэффективные органические удобрения.",
    "brand": {
      "overline": "Наш бренд",
      "name": "HYDROWOOLKS",
      "description": "Жидкое органическое удобрение, полученное методом гидролиза овечьей шерсти по специальной технологии. Производится в Кыргызстане и подходит для всех видов сельскохозяйственных культур."
    },
    "activities": {
      "title": "Чем мы занимаемся",
      "items": [
        { "icon": "flask", "title": "Производство жидких удобрений", "description": "Органические жидкие удобрения собственного производства." },
        { "icon": "consult", "title": "Агрономические консультации", "description": "Даём дыйканам советы по уходу за посевами." },
        { "icon": "scheme", "title": "Схемы применения", "description": "Готовим схемы применения для выращивания растений." },
        { "icon": "globe", "title": "Экспорт продукции", "description": "Поставляем продукцию в Кыргызстан и за рубеж." },
        { "icon": "leaf", "title": "Развитие органического земледелия", "description": "Помогаем развивать органическое сельское хозяйство." }
      ]
    },
    "product": {
      "title": "Наша продукция",
      "subtitle": "HYDROWOOLKS — органическое жидкое удобрение",
      "composition": [
        "Органические вещества",
        "Свободные аминокислоты",
        "Органический азот",
        "Природные питательные элементы"
      ],
      "benefits": [
        { "icon": "roots", "title": "Укрепляет корни", "description": "Усиливает корневую систему растений." },
        { "icon": "growth", "title": "Ускоряет рост", "description": "Ускоряет рост и развитие растений." },
        { "icon": "resilience", "title": "Повышает стойкость", "description": "К жаре, холоду и засухе." },
        { "icon": "bloom", "title": "Улучшает цветение", "description": "И завязывание плодов." },
        { "icon": "harvest", "title": "Повышает урожай", "description": "Объём и качество урожая." },
        { "icon": "star", "title": "Улучшает вкус и хранение", "description": "Вкус, цвет и срок хранения плодов." },
        { "icon": "renew", "title": "Восстанавливает почву", "description": "Биологическую активность почвы." },
        { "icon": "shield", "title": "Безопасно и удобно", "description": "Экологически безопасно в применении." }
      ],
      "cultures": "Подходит для всех культур: полевые растения, деревья, цветы, овощи и фрукты."
    },
    "packaging": {
      "title": "Фасовка",
      "sizes": ["1 кг", "5 кг", "10 кг", "20 кг"],
      "bulk": "1000 кг · IBC-контейнер"
    },
    "mission": {
      "overline": "Наша цель",
      "text": "Вывести органическую продукцию, произведённую в Кыргызстане, на мировой рынок, увеличить доходы дыйкан, снизить зависимость от химических удобрений и сохранить плодородную, чистую почву для будущих поколений.",
      "note": "Сегодня AGRO IBO сотрудничает с дыйканами в разных регионах Кыргызстана и выводит продукцию на международный рынок — предлагая современные, эффективные и экологически безопасные решения в сельском хозяйстве."
    }
  },
```

- [ ] **Step 2: Create `src/components/about/about-hero.tsx`:**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function AboutHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-28 text-center md:pt-36">
      <SectionReveal>
        <p className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-4 py-2 text-[13px] font-semibold text-accent">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          {ru.about.badge}
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-bold leading-[1.2] tracking-tight text-fg md:text-[42px]">
          {ru.about.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-fg-muted">
          {ru.about.subtitle}
        </p>
      </SectionReveal>
    </section>
  )
}
```

- [ ] **Step 3: Create `src/components/about/brand-card.tsx`:**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"
import { LeafIcon } from "@/src/components/ui/icons"

export function BrandCard() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <SectionReveal>
        <div className="grid items-center gap-8 rounded-2xl bg-section-alt p-8 md:grid-cols-[0.9fr_1.1fr] md:p-11">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-mint">
              {ru.about.brand.overline}
            </p>
            <h2 className="mt-2.5 text-3xl font-bold tracking-tight text-fg">
              {ru.about.brand.name}
            </h2>
            <p className="mt-3.5 text-[15px] leading-relaxed text-fg-muted">
              {ru.about.brand.description}
            </p>
          </div>
          <div
            aria-hidden
            className="flex h-[220px] items-center justify-center rounded-[14px] bg-mint-soft"
          >
            <LeafIcon size={64} className="text-mint" />
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
```

- [ ] **Step 4: Create `src/components/about/activities.tsx`:**

```tsx
import ru from "@/src/i18n/ru.json"
import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function Activities() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <SectionReveal>
        <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[32px]">
          {ru.about.activities.title}
        </h2>
      </SectionReveal>
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ru.about.activities.items.map((item, i) => (
          <SectionReveal key={i} delay={i * 0.08} className="h-full">
            <article className="h-full rounded-2xl border border-edge bg-bg p-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-[#cfe3d6] hover:shadow-[0_14px_32px_rgba(45,106,79,0.12)] motion-reduce:transform-none">
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-xl bg-mint-soft text-accent"
              >
                <AboutIcon id={item.icon as AboutIconId} size={21} />
              </span>
              <h3 className="mt-3.5 font-bold text-fg">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                {item.description}
              </p>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Verify**

Run: `bunx tsc --noEmit && bun run lint`
Expected: exit 0. (Components are not yet imported anywhere — that's fine.)

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ru.json src/components/about/
git commit -m "feat: add about page content and hero, brand, activities sections"
```

---

### Task 5: Product, packaging, mission sections

**Files:**
- Create: `src/components/about/product.tsx`
- Create: `src/components/about/packaging.tsx`
- Create: `src/components/about/mission.tsx`

**Interfaces:**
- Consumes: ru.json `about.product`, `about.packaging`, `about.mission` (added in Task 4); `SectionReveal`; `AboutIcon`/`AboutIconId`.
- Produces: exported components `Product()`, `Packaging()`, `Mission()` (no props).

- [ ] **Step 1: Create `src/components/about/product.tsx`:**

```tsx
import ru from "@/src/i18n/ru.json"
import { AboutIcon, type AboutIconId } from "@/src/components/ui/icons"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function Product() {
  return (
    <section className="bg-section-alt py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionReveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-fg md:text-[32px]">
            {ru.about.product.title}
          </h2>
          <p className="mt-2 text-center text-[15px] font-medium text-accent">
            {ru.about.product.subtitle}
          </p>
        </SectionReveal>
        <SectionReveal delay={0.08}>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ru.about.product.composition.map((item, i) => (
              <li
                key={i}
                className="rounded-xl bg-card p-4 text-center text-sm font-medium text-fg"
              >
                {item}
              </li>
            ))}
          </ul>
        </SectionReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ru.about.product.benefits.map((item, i) => (
            <SectionReveal key={i} delay={i * 0.06} className="h-full">
              <article className="h-full rounded-2xl border border-edge/60 bg-card p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] transition-all duration-300 hover:-translate-y-[3px] hover:border-[#cfe3d6] hover:shadow-[0_16px_34px_rgba(45,106,79,0.13)] motion-reduce:transform-none">
                <span
                  aria-hidden
                  className="flex size-[38px] items-center justify-center rounded-[10px] bg-mint-soft text-accent"
                >
                  <AboutIcon id={item.icon as AboutIconId} size={19} />
                </span>
                <h3 className="mt-3 text-[14.5px] font-bold text-fg">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
                  {item.description}
                </p>
              </article>
            </SectionReveal>
          ))}
        </div>
        <p className="mt-10 text-center text-[14.5px] font-medium text-fg-muted">
          {ru.about.product.cultures}
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `src/components/about/packaging.tsx`:**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function Packaging() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionReveal>
        <h2 className="text-center text-[28px] font-bold tracking-tight text-fg">
          {ru.about.packaging.title}
        </h2>
        <ul className="mt-8 flex flex-wrap justify-center gap-4">
          {ru.about.packaging.sizes.map((size, i) => (
            <li
              key={i}
              className="rounded-full bg-mint-soft px-7 py-3.5 text-[15px] font-bold text-accent"
            >
              {size}
            </li>
          ))}
          <li className="rounded-full bg-accent px-7 py-3.5 text-[15px] font-bold text-white">
            {ru.about.packaging.bulk}
          </li>
        </ul>
      </SectionReveal>
    </section>
  )
}
```

- [ ] **Step 3: Create `src/components/about/mission.tsx`:**

```tsx
import ru from "@/src/i18n/ru.json"
import { SectionReveal } from "@/src/components/landing/section-reveal"

export function Mission() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <SectionReveal>
        <div className="rounded-2xl bg-fg p-8 text-center md:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-mint">
            {ru.about.mission.overline}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-pretty text-lg font-medium leading-relaxed text-bg md:text-[19px]">
            {ru.about.mission.text}
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-[14.5px] leading-relaxed text-bg/70">
            {ru.about.mission.note}
          </p>
        </div>
      </SectionReveal>
    </section>
  )
}
```

- [ ] **Step 4: Verify**

Run: `bunx tsc --noEmit && bun run lint`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/about/
git commit -m "feat: add product, packaging and mission sections for about page"
```

---

### Task 6: /about route with metadata

**Files:**
- Create: `app/about/page.tsx`

**Interfaces:**
- Consumes: `Header`, `Footer`, all six about components, ru.json `about.metaTitle`/`about.metaDescription`.
- Produces: route `/about` (static).

- [ ] **Step 1: Create `app/about/page.tsx`:**

```tsx
import type { Metadata } from "next"
import { Header } from "@/src/components/layout/header"
import { Footer } from "@/src/components/layout/footer"
import { AboutHero } from "@/src/components/about/about-hero"
import { BrandCard } from "@/src/components/about/brand-card"
import { Activities } from "@/src/components/about/activities"
import { Product } from "@/src/components/about/product"
import { Packaging } from "@/src/components/about/packaging"
import { Mission } from "@/src/components/about/mission"
import ru from "@/src/i18n/ru.json"

export const metadata: Metadata = {
  title: ru.about.metaTitle,
  description: ru.about.metaDescription,
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutHero />
        <BrandCard />
        <Activities />
        <Product />
        <Packaging />
        <Mission />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Verify**

Run: `bunx tsc --noEmit && bun run lint`
Expected: exit 0.

Run: `bun run build 2>&1 | tail -20`
Expected: build succeeds; route list includes `○ /about` (static).

- [ ] **Step 3: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: add about page route"
```

---

### Task 7: Header and footer rework + final verification

**Files:**
- Modify: `src/i18n/ru.json` (`header.nav`, `footer` sections)
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/footer.tsx`

**Interfaces:**
- Consumes: route `/about` (Task 6).
- Produces: ru.json `header.nav` = `{ "about": "О нас" }` (keys `features`, `howItWorks` deleted); `footer` = `{ "copyright": …, "aboutLink": "О нас", "support": "Поддержка" }` (key `askLink` deleted).

- [ ] **Step 1: ru.json** — replace `header.nav` and `footer`:

```json
  "header": {
    "nav": {
      "about": "О нас"
    },
    "startChat": "Начать чат",
    "logoAria": "ibo — на главную"
  },
```

```json
  "footer": {
    "copyright": "© 2026 ibo — ИИ-помощник агронома",
    "aboutLink": "О нас",
    "support": "Поддержка"
  },
```

- [ ] **Step 2: header.tsx** — add `usePathname` and replace the `<nav>` block (lines 37-56). Change the import line 4 area:

```tsx
import { usePathname } from "next/navigation"
```

Inside `Header()` (after `useState`):
```tsx
  const pathname = usePathname()
```

Replace `<nav>…</nav>`:
```tsx
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/about"
            className={`text-sm transition-colors hover:text-fg ${
              pathname === "/about"
                ? "font-bold text-fg"
                : "font-medium text-fg-muted"
            }`}
          >
            {ru.header.nav.about}
          </Link>
          <Link
            href="/chat"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-accent-strong"
          >
            {ru.header.startChat}
          </Link>
        </nav>
```
(The two `<a href="#…">` anchors are deleted; «О нас» is visible on mobile — no `hidden sm:block`.)

- [ ] **Step 3: footer.tsx** — replace the trailing `<Link>` block with:

```tsx
        <span className="flex items-center gap-5">
          <Link
            href="/about"
            className="text-[13px] font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            {ru.footer.aboutLink}
          </Link>
          <span className="text-[13px] font-semibold text-fg-faint">
            {ru.footer.support}
          </span>
        </span>
```

- [ ] **Step 4: Verify no stale keys**

Run: `grep -rn "askLink\|nav.features\|nav.howItWorks" src app && echo "STALE" || echo "clean"`
Expected: `clean`.

- [ ] **Step 5: Full verification**

Run: `bunx tsc --noEmit && bun run lint && bun run build 2>&1 | tail -20`
Expected: all pass; routes include `○ /` and `○ /about`.

Smoke (production server):
```bash
(bun run start > /tmp/ibo-start.log 2>&1 &) && sleep 4 \
  && for p in / /about /login /chat; do echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"; done \
  && curl -s http://localhost:3000/ | grep -c "Начать чат" \
  && curl -s http://localhost:3000/ | grep -c "Задать вопрос" \
  && curl -s http://localhost:3000/about | grep -c "HYDROWOOLKS"; pkill -f "next start"
```
Expected: `/ -> 200`, `/about -> 200`, `/login -> 200`, `/chat -> 307`; «Начать чат» count ≥ 2 on `/`; «Задать вопрос» count 0 on `/`; HYDROWOOLKS ≥ 2 on `/about`.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ru.json src/components/layout/header.tsx src/components/layout/footer.tsx
git commit -m "feat: rework header and footer nav around about page"
```

---

## Self-Review Notes

- Spec coverage: §1 хедер → Task 7; §2 /about (все 6 секций + метаданные + иконки) → Tasks 1, 4, 5, 6; §3 единый CTA → Task 2 (+ Task 7 удаляет askLink); §4 футер → Task 7; §5 чипы hero → Task 2; §6 hover → Task 3 (лендинг) + hover-классы включены в карточки about (Tasks 4–5). Ограничения спеки — в Global Constraints.
- Types: `AboutIconId` (Task 1) используется в Tasks 4–5 через `item.icon as AboutIconId`; `TrustIconId` локален в hero.tsx; ru.json-ключи согласованы между задачами (Task 4 добавляет весь `about`, Task 7 меняет `header`/`footer`).
