# ibo Field Intelligence Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` and execute this plan inline, task by task, with review checkpoints. The user explicitly requested no subagents.

**Goal:** Redesign the complete ibo frontend into the approved Field Intelligence system while preserving routes, localization, backend contracts, authentication behavior, SEO, and disease-ranking behavior.

**Architecture:** Build one semantic foundation, then three shells: `MarketingShell` for `/` and `/about`, `AuthShell` for all authentication routes, and `ProductShell` for `/chat` and profile surfaces. Server Components remain the default. Browser state, forms, Motion, geolocation, and file previews stay in small client leaves. Chat request/state logic moves into a typed controller while presentational components receive props only.

**Tech Stack:** Next.js 16.2.10 App Router, React 19.2, TypeScript strict, Tailwind CSS 4, `motion/react`, React Hook Form, Zod 4, Bun tests, `next/font`, `next/image`, Phosphor Icons.

**Spec:** `docs/superpowers/specs/2026-08-28-ibo-field-intelligence-redesign-design.md`

## Global Constraints

- Work only on `codex/taste-ai-site-redesign`, based on `main` commit `abd782d`.
- Read the relevant local Next.js 16 guides before changing framework code. In particular: `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`, `02-components/font.md`, `02-components/image.md`, `03-file-conventions/loading.md`, and `03-file-conventions/error.md`.
- Use `ui-ux-pro-max`, `design-taste-frontend`, `frontend-design`, and `motion-ui` as design constraints throughout implementation. Use `imagegen` only for the four photographic assets in Task 4.
- Preserve every route slug, API route, request field, generated API type, auth field name/order/autocomplete value, httpOnly-cookie behavior, metadata/JSON-LD/sitemap/robots behavior, and `src/lib/disease-ranking.ts` behavior.
- Do not edit backend code or generated OpenAPI types.
- No `any`; use interfaces/types for props, API responses, state, and reducer actions. Use `async/await` only. New filenames are kebab-case.
- Server Components are the default. Add `"use client"` only to stateful forms, browser APIs, Motion wrappers, and interactive shells.
- All visible strings and accessible names belong in `src/i18n/ru.json`, `ky.json`, and `en.json` together. No visible em dash or en dash characters.
- The site is light-first and theme-locked by explicit product direction. White is the page background; dark green and brand green are accents, not full-page surfaces.
- Brand colors: forest `#0D3B29`, green `#169653`, white surface `#FFFFFF`, muted control surface `#F4F6F4`, light text `#10251A`, light border `#DCE3DE`. Status colors are semantic only.
- Radius system: 12px controls, 16px cards/sheets, full circles/pills only for avatars and compact tags.
- Icons: Phosphor only for interface controls; keep `LogoMark` as the sole custom brand SVG.
- Motion durations: 180ms, 280ms, 420ms maximum. Use motion only for direct interaction feedback and required state changes. Marketing sections do not animate on scroll.
- Do not ship equal three-card feature rows, fake product screenshots, decorative weather/version/number/status/scroll labels, unmanaged presentation-only scroll listeners, decorative infinite animation, duplicate CTA intent, or light-only styling.
- Each task begins with a failing targeted test or invariant, ends with targeted tests plus `bunx tsc --noEmit`, and gets one English Conventional Commit.
- Do not claim completion until Task 10 passes tests, TypeScript, lint, production build, browser QA, accessibility checks, and the design pre-flight audit.

---

### Task 1: Semantic design foundation, fonts, icons, and motion

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `src/lib/motion-tokens.ts`
- Modify: `src/components/ui/icons.tsx`
- Create: `src/lib/design-contract.test.ts`

**Interfaces:**
- Produces CSS fonts `--font-manrope`, `--font-onest`, `--font-plex-mono` and Tailwind families `font-display`, `font-sans`, `font-mono`.
- Produces semantic colors `bg`, `surface`, `surface-raised`, `surface-muted`, `fg`, `fg-muted`, `fg-faint`, `edge`, `accent`, `accent-strong`, `accent-soft`, `danger`, `warning`, and `success` in the light theme.
- Preserves existing icon export names temporarily, but implements them as typed Phosphor adapters with one `ICON_WEIGHT`.
- Produces `DURATION.fast = 0.18`, `DURATION.base = 0.28`, `DURATION.slow = 0.42`, `REVEAL_OFFSET = 16`.

- [x] **Step 1: Add a failing design-contract test**

Create `src/lib/design-contract.test.ts`. The test covers the executable motion contract. CSS and `next/font` are framework configuration and are verified through TypeScript, the production build, and computed styles in the browser instead of brittle source-text assertions:

```ts
import { describe, expect, test } from "bun:test"
import { DURATION, REVEAL_OFFSET } from "./motion-tokens"

describe("Field Intelligence motion contract", () => {
  test("keeps feedback and transitions within the approved motion scale", () => {
    expect(DURATION).toEqual({ fast: 0.18, base: 0.28, slow: 0.42 })
  })

  test("limits reveal movement to a short spatial cue", () => {
    expect(REVEAL_OFFSET).toBe(16)
  })
})
```

- [x] **Step 2: Run the test and confirm the expected failure**

Run: `bun test src/lib/design-contract.test.ts`

Expected: failure because the old durations and 24px reveal offset remain.

- [x] **Step 3: Install the single icon family**

Run: `bun add @phosphor-icons/react`

Expected: `package.json` and `bun.lock` contain `@phosphor-icons/react`; no other icon package is added.

- [x] **Step 4: Configure typography in `app/layout.tsx`**

Replace Plus Jakarta with `Onest`, add `IBM_Plex_Mono`, preserve `generateMetadata`, `I18nProvider`, and `Providers`, and configure:

```ts
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
})
```

Apply all three variables to `<html>`; keep `font-sans` on `<body>`.

- [x] **Step 5: Replace the global token system**

In `app/globals.css`:

- Keep Tailwind 4 `@import "tailwindcss"`.
- Define the light semantic tokens with the approved five core values.
- Lock the root to the light theme: page background `#FFFFFF`, muted control surface `#F4F6F4`, text `#10251A`, muted text `#55635B`, border `#DCE3DE`, accent `#169653`, accent strong `#0D7440`, accent soft `#E8F5ED`, forest `#0D3B29`.
- Map `font-display`, `font-sans`, and `font-mono` to Manrope, Onest, and IBM Plex Mono.
- Add semantic layer values (`--z-header`, `--z-drawer`, `--z-sheet`, `--z-toast`) and 12px/16px radius values.
- Remove the separate header palette values, decorative infinite keyframes, and the old inline chat pattern. Keep temporary header/card token aliases pointing at the new semantic values until their consumers migrate in Tasks 2-9, so each intermediate commit remains buildable.
- Retain safe dynamic viewport support, global selection, body color, and a visible `:focus-visible` ring.
- Add `color-scheme: light`; reduced-motion and slow-update rules disable nonessential animation and scrolling behavior.

- [x] **Step 6: Replace custom interface paths with Phosphor adapters**

In `src/components/ui/icons.tsx`, export:

```ts
import type { ComponentProps } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  CaretDown,
  CaretRight,
  Check,
  Cloud,
  Eye,
  EyeSlash,
  Globe,
  House,
  Leaf,
  MapPin,
  Paperclip,
  Plant,
  Plus,
  ShieldCheck,
  Sparkle,
  Sprout,
  Warning,
  X,
} from "@phosphor-icons/react/dist/ssr"

export type IconProps = ComponentProps<typeof Leaf>
export const ICON_WEIGHT: IconProps["weight"] = "regular"
```

Re-export the current component names as small typed wrappers with `weight={props.weight ?? ICON_WEIGHT}`. Keep `AudienceIcon` and `AboutIcon` as typed ID-to-component maps, not custom SVG paths. Replace `BloomIcon` with the Phosphor `Sparkle` adapter until consumers are redesigned.

- [x] **Step 7: Update motion tokens**

```ts
export const DURATION = { fast: 0.18, base: 0.28, slow: 0.42 } as const
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const REVEAL_OFFSET = 16
```

- [x] **Step 8: Verify and commit**

Run: `bun test src/lib/design-contract.test.ts && bunx tsc --noEmit`

Expected: both pass.

```bash
git add package.json bun.lock app/layout.tsx app/globals.css src/lib/motion-tokens.ts src/components/ui/icons.tsx src/lib/design-contract.test.ts
git commit -m "feat: establish field intelligence design system"
```

---

### Task 2: Accessible primitives and interaction infrastructure

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/password-input.tsx`
- Modify: `src/components/ui/select.tsx`
- Create: `src/components/ui/icon-button.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/status-message.tsx`
- Create: `src/components/ui/ui-primitives.test.tsx`

**Interfaces:**
- `Button`: `variant: "primary" | "secondary" | "ghost" | "danger"`, `size: "sm" | "md" | "lg"`, `loading`, native button props.
- `IconButton`: requires `label`, supports `variant`, and enforces a 44px target.
- Inputs expose `aria-invalid`, stable `aria-describedby`, inline errors, hints, and warnings.
- `Sheet`: controlled `open`, `onOpenChange`, localized `label`, `children`; traps focus, closes on Escape/scrim, locks scroll, restores trigger focus, and uses bottom-sheet motion below 640px and side-sheet motion above it.
- `StatusMessage`: `tone: "info" | "success" | "warning" | "danger"`, optional action, live-region behavior.

- [ ] **Step 1: Add failing primitive markup tests**

Create `src/components/ui/ui-primitives.test.tsx` using `renderToStaticMarkup` and assert:

```tsx
const loading = renderToStaticMarkup(<Button loading>Save</Button>)
expect(loading).toContain('aria-busy="true"')
expect(loading).toContain("disabled")

const invalid = renderToStaticMarkup(
  <Input id="email" label="Email" error="Required" />,
)
expect(invalid).toContain('aria-invalid="true"')
expect(invalid).toContain('aria-describedby="email-error"')
expect(invalid).toContain('id="email-error"')

const icon = renderToStaticMarkup(
  <IconButton label="Close"><span aria-hidden>x</span></IconButton>,
)
expect(icon).toContain('aria-label="Close"')
```

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/components/ui/ui-primitives.test.tsx`

Expected: missing `IconButton` plus missing ARIA state.

- [ ] **Step 3: Implement Button and form primitives**

- Use 12px radii, token colors, a minimum 44px height, transform/opacity-only hover/press feedback, and no pill default.
- Add `aria-busy={loading || undefined}` and keep native disabled semantics.
- Generate `${id}-error`, `${id}-warning`, or `${id}-hint` and wire the active ID through `aria-describedby`.
- Keep React 19 ref props, native attributes, visible labels, autocomplete behavior, and existing warning/hint precedence.
- Render Select’s Phosphor caret as a pointer-events-none overlay.

- [ ] **Step 4: Implement the shared infrastructure**

- `IconButton` composes native button props and requires a localized `label`.
- `Skeleton` is a neutral surface pulse with `aria-hidden`; its parent owns the readable loading label.
- `StatusMessage` renders `role="alert"` for danger and warning, `role="status"` otherwise, and accepts a typed action button.
- `Sheet` is a client component using `createPortal`, `AnimatePresence mode="wait"`, `useReducedMotion`, and the new duration tokens. Store the previously focused element before opening and restore it after exit. Query focusable elements through one local helper, and preserve body overflow on cleanup.

- [ ] **Step 5: Verify and commit**

Run: `bun test src/components/ui/ui-primitives.test.tsx && bunx tsc --noEmit`

Expected: pass.

```bash
git add src/components/ui
git commit -m "feat: add accessible field intelligence primitives"
```

---

### Task 3: Shared shells, navigation, and route states

**Files:**
- Create: `src/components/layout/marketing-shell.tsx`
- Create: `src/components/layout/product-shell.tsx`
- Create: `src/components/auth/auth-shell.tsx`
- Create: `src/components/layout/route-focus.tsx`
- Create: `src/components/ui/page-state.tsx`
- Create: `app/loading.tsx`
- Create: `app/error.tsx`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/footer.tsx`
- Modify: `src/components/layout/language-switcher.tsx`
- Modify: `src/components/layout/floating-nav.tsx`
- Modify: `src/components/auth/auth-card.tsx`
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/ky.json`
- Modify: `src/i18n/en.json`
- Create: `src/components/layout/shell-contract.test.tsx`

**Interfaces:**
- `MarketingShell({ children, showHomeAction? })` owns public header/footer and page background.
- `ProductShell({ rail, header, children, railOpen, onRailOpenChange })` owns fixed viewport, 280px desktop rail, mobile scrim/drawer, and safe areas.
- `AuthShell({ title, subtitle?, children, footer? })` owns the photo/form split and mobile fallback; `AuthCard` becomes a compatibility wrapper until Task 6 removes it.
- `RouteFocus` focuses `[data-route-heading]` after pathname changes without moving focus during chat state updates.
- `PageState` supplies localized loading/error layouts.

- [ ] **Step 1: Add failing shell contract tests**

Create a test that renders `AuthShell` and `PageState` to static markup and asserts one `<main>`, one `data-route-heading`, an accessible loading label, and a retry button in the error state.

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/components/layout/shell-contract.test.tsx`

Expected: missing modules.

- [ ] **Step 3: Implement the three shells**

- Marketing: max-width 1240px system, 72px desktop header, no scroll-state listener, tokenized translucent surface with a permanent subtle border.
- Product: fixed dynamic viewport, 280px desktop rail, `min-w-0` main pane, mobile drawer controlled by parent, and safe-area padding.
- Auth: `lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]`; photo panel hidden below `lg`; form column max 480px; keep server rendering.

- [ ] **Step 4: Redesign shared navigation**

- Preserve logo, `/`, `/about`, `/chat`, language selection, and profile entry.
- Remove header-specific colors and the scroll listener.
- Use icon buttons at 44px, route-aware `aria-current`, keyboard-safe mobile navigation, and no wrapped desktop CTA.
- Keep `LogoMark`; every other icon comes through Phosphor adapters.
- Footer becomes a compact editorial grid with existing links and localized copy.
- Floating navigation uses a quiet IconButton and is hidden where it duplicates primary navigation.

- [ ] **Step 5: Add loading, error, and route focus behavior**

- `app/loading.tsx` is a Server Component with a structured shell skeleton.
- `app/error.tsx` is a Client Component, logs the error in an effect, and calls the Next.js 16 `unstable_retry()` recovery function.
- Add localized `common.loading`, `common.retry`, `common.pageError`, and accessible navigation labels to all three dictionaries.
- `RouteFocus` runs only on pathname change and does not depend on message/query state.

- [ ] **Step 6: Verify and commit**

Run: `bun test src/components/layout/shell-contract.test.tsx && bunx tsc --noEmit`

Expected: pass.

```bash
git add app/loading.tsx app/error.tsx src/components/layout src/components/auth/auth-shell.tsx src/components/auth/auth-card.tsx src/components/ui/page-state.tsx src/i18n
git commit -m "feat: add shared application shells"
```

---

### Task 4: Generate optimized plant imagery and rebuild the home page

**Files:**
- Create: `public/images/field-intelligence-hero.webp`
- Create: `public/images/field-intelligence-diagnosis.webp`
- Create: `public/images/field-intelligence-greenhouse.webp`
- Create: `public/images/field-intelligence-about.webp`
- Create: `src/components/landing/diagnosis-lens.tsx`
- Create: `src/components/landing/marketing-content.test.ts`
- Modify: `app/page.tsx`
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/audience.tsx`
- Modify: `src/components/landing/audience-cards.tsx`
- Modify: `src/components/landing/features.tsx`
- Modify: `src/components/landing/how-it-works.tsx`
- Modify: `src/components/landing/cta-banner.tsx`
- Modify: `src/components/landing/section-heading.tsx`
- Modify: `src/components/landing/section-reveal.tsx`
- Delete: `src/components/landing/diagnosis-card.tsx`
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/ky.json`
- Modify: `src/i18n/en.json`

**Interfaces:**
- `DiagnosisLens({ image, alt, crop, finding, confidenceLabel, confidence })` is a presentational client leaf only for the restrained reveal; it does not rotate cases or imply a live diagnosis.
- `SectionReveal` keeps the existing API but uses 16px maximum translation and no arbitrary decorative delay above 150ms.
- Home remains a Server Component and preserves Organization/WebSite JSON-LD.

- [ ] **Step 1: Add failing marketing-content invariants**

Create `src/components/landing/marketing-content.test.ts` that recursively scans RU/KY/EN dictionaries and asserts:

```ts
expect(allVisibleStrings.some((value) => /[—–]/u.test(value))).toBe(false)
expect(ru.hero.ctaChat).toBeTruthy()
expect(ky.hero.ctaChat).toBeTruthy()
expect(en.hero.ctaChat).toBeTruthy()
expect(ru.hero.visual.confidenceLabel).toBeTruthy()
```

Also assert the four expected WebP files exist with `Bun.file(path).size > 20_000`.

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/components/landing/marketing-content.test.ts`

Expected: missing copy keys/assets and existing dash characters.

- [ ] **Step 3: Generate the four source images with `imagegen`**

Use the `imagegen` skill and generate each asset independently at its intended crop:

1. Hero: natural macro photograph of a tomato leaf being inspected in a Central Asian greenhouse, morning side light, deep green and neutral soil palette, room on the left for text, no person face, no interface, no labels, 4:3.
2. Diagnosis crop: realistic close macro of tomato leaf lesions, agronomic documentary style, sharp leaf texture, restrained background, no interface or text, 1:1.
3. Greenhouse: working greenhouse rows in Kyrgyzstan or Central Asia, one agronomist from behind checking plants, natural light, trustworthy documentary photography, no staged corporate pose, 3:2.
4. About: hands of an agronomist inspecting crop leaves in a field, tactile soil and plant detail, honest documentary framing, no visible brand or text, 4:3.

Save generated source images under `/private/tmp/ibo-field-intelligence-assets/`. Convert each through the already installed `sharp` dependency to quality-82 WebP at maximum 1800px on the long edge. Write only the four final files listed above into `public/images/`.

- [ ] **Step 4: Rebuild the hero and diagnostic lens**

- Hero desktop grid is 52/48, fills the initial viewport after the header, has one H1, supporting copy under 20 words per locale, primary `/chat` CTA and secondary `/about` CTA.
- Remove the badge status dot, trust pills, weather chip, rotating carousel, and infinite timer.
- Render hero media with `next/image`, explicit `sizes`, reserved aspect ratio, `preload`, and meaningful alt text.
- Overlay the diagnosis lens with one bounded focus region plus crop/finding/confidence metadata in IBM Plex Mono. Label it as an example, not a live result.

- [ ] **Step 5: Recompose the remaining landing sections**

- Audience uses an asymmetric editorial row/list, not three equal cards.
- Capabilities use one photographic narrative block plus a compact evidence list; remove the decorative SVG tree.
- Process is a continuous two-column story on desktop and a simple stacked sequence on mobile; remove numbered circles.
- Safety is a clear trust band with meaningful icon and text, not a decorative card.
- Final CTA has one intent and one button; no duplicate about/chat actions.
- All images below the fold use lazy defaults, explicit dimensions/aspect ratios, and responsive `sizes`.

- [ ] **Step 6: Integrate `MarketingShell` and update localization**

- Wrap home content in `MarketingShell`.
- Preserve JSON-LD and metadata behavior.
- Add all new visible/alt/accessible strings in RU/KY/EN together and remove no-longer-used weather/status/number copy.
- Replace all visible em/en dashes with punctuation appropriate to each language.

- [ ] **Step 7: Verify and commit**

Run: `bun test src/components/landing/marketing-content.test.ts && bunx tsc --noEmit`

Expected: pass; all four WebPs exist and there are no disallowed dash characters in localized UI strings.

```bash
git add app/page.tsx public/images src/components/landing src/i18n
git commit -m "feat: redesign field intelligence landing page"
```

---

### Task 5: Rebuild the About page as an editorial product story

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `src/components/about/about-hero.tsx`
- Modify: `src/components/about/company-product.tsx`
- Modify: `src/components/about/benefits.tsx`
- Modify: `src/components/about/benefits-carousel.tsx`
- Modify: `src/components/about/mission.tsx`
- Delete: `src/components/about/volume-ladder.tsx`
- Create: `src/components/about/about-content.test.tsx`
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/ky.json`
- Modify: `src/i18n/en.json`

**Interfaces:**
- About remains server-first and consumes `field-intelligence-about.webp` plus `field-intelligence-greenhouse.webp`.
- Benefits may use a client carousel only on narrow screens; desktop content is static and readable without JavaScript.
- Metadata title/description and route remain unchanged.

- [ ] **Step 1: Add a failing about-content test**

Render the server-safe About sections with test dictionary data or assert the localized content contract directly. Require one page title, product/benefits/mission headings, both image alt strings, and no obsolete volume-ladder copy key.

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/components/about/about-content.test.tsx`

Expected: new alt/content keys and redesigned contract are absent.

- [ ] **Step 3: Implement the editorial composition**

- Hero: large title and one restrained agronomy image, not the same split as Home.
- Company/Product: alternating text and greenhouse image with a compact facts list; no equal cards.
- Benefits: editorial list with strong hierarchy and one mobile overflow pattern only if needed; all controls have localized labels.
- Mission: quiet full-width closing section using typography and border, not decorative plant SVG.
- Remove volume ladder, oversized blank bands, arbitrary numerical decoration, and redundant CTAs.
- Wrap with `MarketingShell showHomeAction` and keep heading hierarchy sequential.

- [ ] **Step 4: Update all dictionaries and verify**

Run: `bun test src/components/about/about-content.test.tsx && bunx tsc --noEmit`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add app/about src/components/about src/i18n
git commit -m "feat: redesign about page narrative"
```

---

### Task 6: Apply the Auth Shell to every authentication route

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/login/login-form.tsx`
- Modify: `app/register/page.tsx`
- Modify: `app/register/register-form.tsx`
- Modify: `app/forgot-password/page.tsx`
- Modify: `app/forgot-password/forgot-password-form.tsx`
- Modify: `app/reset-password/page.tsx`
- Modify: `app/reset-password/reset-password-form.tsx`
- Modify: `src/components/auth/step-indicator.tsx`
- Modify: `src/components/auth/step-transition.tsx`
- Delete: `src/components/auth/auth-card.tsx`
- Create: `src/lib/api-error.ts`
- Create: `src/lib/api-error.test.ts`
- Create: `src/components/auth/auth-contract.test.ts`
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/ky.json`
- Modify: `src/i18n/en.json`

**Interfaces:**
- `normalizeApiError(data, fallback)` returns `{ message: string; errors?: Record<string, string> }` and replaces the three duplicated `readErrorBody` functions.
- Forms keep exact `LoginFormValues`, `RegisterFormValues`, `ForgotPasswordFormValues`, and `ResetPasswordFormValues` keys, current step arrays, default values, autocomplete values, API URLs, and redirects.
- `StepIndicator` announces current step; `StepTransition` uses 280ms maximum and focus remains with the newly rendered field.

- [ ] **Step 1: Add failing API-error and auth-contract tests**

Test `normalizeApiError` against valid field errors, message-only errors, and unknown payloads. In `auth-contract.test.ts`, assert the source files still contain the protected API paths, field names, and autocomplete values:

```ts
expect(loginSource).toContain('fetch("/api/auth/login"')
expect(registerSource).toContain('full_name: ""')
expect(registerSource).toContain('language: "ky"')
expect(resetSource).toContain('reset_code: ""')
expect(allAuthSource).not.toContain("text-[#")
```

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/lib/api-error.test.ts src/components/auth/auth-contract.test.ts`

Expected: missing normalizer and old visual contract.

- [ ] **Step 3: Add the shared error normalizer**

Implement it with unknown-safe object checks only. Do not cast an arbitrary payload to the complete backend response. Replace duplicated local parsers in login, registration, reset, and profile consumers.

- [ ] **Step 4: Move every auth route to `AuthShell`**

- Preserve route metadata, `robots: { index: false }`, Suspense around search-param forms, and footer links.
- Use the shared about photograph as a contextual desktop panel with decorative empty alt when its nearby caption already describes it.
- Keep one column below `lg`, a max 480px form width, and no fixed height that clips mobile keyboards.
- Use `StatusMessage` for persistent server errors and keep toast only for transient network or success feedback.

- [ ] **Step 5: Restyle form flow without changing behavior**

- Keep exact `STEP_FIELDS`, `LAST_STEP`, and the pre-final-step `trigger()` behavior.
- Keep React Hook Form’s first-invalid-field focus and explicit `autoFocus` on new steps.
- Use a text step label plus compact progress line; no numbered decorative bubbles.
- Keep visible labels, inline field errors, autocomplete, query-prefilled email, and current redirects.
- Animate only opacity and maximum 16px x-translation; reduced motion uses opacity only.

- [ ] **Step 6: Update localization, verify, and commit**

Run: `bun test src/lib/api-error.test.ts src/components/auth/auth-contract.test.ts src/lib/auth-schemas.test.ts && bunx tsc --noEmit`

Expected: pass; existing validation tests remain green.

```bash
git add app/login app/register app/forgot-password app/reset-password src/components/auth src/lib/api-error.ts src/lib/api-error.test.ts src/i18n
git commit -m "feat: redesign authentication flows"
```

---

### Task 7: Extract a typed chat-session controller with retry and image lifecycle

**Files:**
- Create: `src/components/chat/chat-session.ts`
- Create: `src/components/chat/chat-session.test.ts`
- Create: `src/components/chat/use-chat-session.ts`
- Modify: `src/components/chat/types.ts`
- Modify: `src/components/chat/chat-view.tsx`
- Modify: `src/components/chat/use-chat-geo.ts`

**Interfaces:**
- `ChatMessage` gains `status: "sent" | "pending" | "failed"`, optional `request`, and remains `role: "user" | "bot"`.
- `ChatRequest` owns `text`, optional `File`, and preview metadata.
- `ChatSessionState` owns `messages`, `pending`, `chatId`, and `retryRequest`.
- Pure functions: `parseMessageResponse`, `readErrorMessage`, `buildMessageFormData`, and `chatSessionReducer`.
- `useChatSession({ getCoords, onUnauthorized, messages })` returns `{ messages, pending, send, retry, clear }`.

- [ ] **Step 1: Add failing reducer/parser tests**

Cover:

- valid and malformed backend responses;
- `FormData` with and without chat ID, text, image, and coordinates;
- optimistic user message;
- successful bot answer and retained backend chat ID;
- failed request storing the exact retry payload;
- retry clearing the failed marker;
- clear resetting chat state.

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/components/chat/chat-session.test.ts`

Expected: missing module.

- [ ] **Step 3: Implement pure state and request helpers**

Use a discriminated union for reducer actions. Keep `crypto.randomUUID()` injection outside the reducer so tests pass deterministic IDs. `buildMessageFormData` must preserve the current `/api/chat/message` multipart keys: `chatId`, `text`, `image`, `latitude`, and `longitude`.

- [ ] **Step 4: Implement `useChatSession`**

- Own backend chat ID, message state, pending state, object URL creation/revocation, submit, normalized error, and retry.
- Keep 401 behavior exactly: push `/login` and refresh.
- Request coordinates non-blockingly through the existing hook; denial never prevents send.
- Do not create a second object URL on retry; revoke all URLs on clear/unmount.
- Presentational components must not call `fetch`.

- [ ] **Step 5: Reduce `ChatView` to orchestration**

`ChatView` receives `hasProfileLocation`, calls the controller, and passes typed props to message/composer components. Remove inline parsing, error reading, and network code.

- [ ] **Step 6: Verify and commit**

Run: `bun test src/components/chat/chat-session.test.ts && bunx tsc --noEmit`

Expected: pass.

```bash
git add src/components/chat/chat-session.ts src/components/chat/chat-session.test.ts src/components/chat/use-chat-session.ts src/components/chat/types.ts src/components/chat/chat-view.tsx src/components/chat/use-chat-geo.ts
git commit -m "refactor: extract typed chat session controller"
```

---

### Task 8: Rebuild the chat workspace in the Product Shell

**Files:**
- Modify: `app/chat/page.tsx`
- Modify: `src/components/chat/chat-shell.tsx`
- Modify: `src/components/chat/chat-sidebar.tsx`
- Modify: `src/components/chat/chat-header.tsx`
- Rename: `src/components/chat/chat-input.tsx` to `src/components/chat/chat-composer.tsx`
- Modify: `src/components/chat/chat-composer.tsx`
- Modify: `src/components/chat/message-list.tsx`
- Create: `src/components/chat/message-item.tsx`
- Modify: `src/components/chat/empty-state.tsx`
- Modify: `src/components/chat/typing-indicator.tsx`
- Modify: `src/components/chat/geo-warning-banner.tsx`
- Modify: `src/components/chat/bot-markdown.tsx`
- Create: `src/components/chat/chat-presenter.test.tsx`
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/ky.json`
- Modify: `src/i18n/en.json`

**Interfaces:**
- `ChatComposer({ pending, preview, onPreviewChange, onSend })` owns draft/file selection only and supports removal before send.
- `MessageItem({ message, retryLabel, preliminaryLabel, onRetry })` renders user/bot/failed states and never performs network work.
- `MessageList` owns scrolling/announcements and renders empty, pending, success, and retry states.
- `ChatSidebar` becomes the 280px rail content and accepts controlled open/close behavior from `ProductShell`.

- [ ] **Step 1: Add failing presenter tests**

Use static markup for pure presentational states and assert:

- empty state names both text and image input;
- bot output includes the localized preliminary-recommendation label;
- failed message exposes a retry button;
- pending state exposes `role="status"` with readable loading copy;
- image preview exposes localized remove-image control.

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/components/chat/chat-presenter.test.tsx`

Expected: new components/states are absent.

- [ ] **Step 3: Move chat into `ProductShell`**

- Desktop rail width is exactly 280px; main conversation max width is 880px.
- Mobile rail is an overlay drawer with scrim, Escape close, focus management, and no nested-scroll conflict.
- Preserve `useViewportHeight`, dynamic viewport CSS variables, and iOS safe-area behavior.
- New-chat clears controller state and closes the drawer only below 1024px.

- [ ] **Step 4: Build the composer and image preview**

- Composer remains visible and never covers the last message.
- Textarea auto-grows to a bounded height without layout animation.
- File selection immediately shows reserved preview dimensions, filename, and a localized remove IconButton.
- Camera/paperclip/send actions use Phosphor, 44px targets, disabled semantics, and localized names.
- Enter submits; Shift+Enter inserts a newline; IME composition does not submit.

- [ ] **Step 5: Build messages and states**

- Use content-width user messages and a quiet full-width assistant treatment.
- Identify assistant output as a preliminary recommendation.
- Pending analysis uses a content-shaped skeleton, not three decorative dots alone.
- Failure remains beside the affected request with Retry; do not inject error text as a fake bot answer.
- New assistant messages enter with opacity and at most 8px translation.
- Geolocation denial is a compact contextual status with dismiss action and does not block the composer.
- Preserve Markdown/GFM behavior and safe styling for lists, tables, code, and links in light/dark themes.

- [ ] **Step 6: Update localization and verify**

Add RU/KY/EN strings for preview removal, retry, preliminary label, analysis loading, drawer controls, and accessible composer labels.

Run: `bun test src/components/chat/chat-session.test.ts src/components/chat/chat-presenter.test.tsx && bunx tsc --noEmit`

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add app/chat src/components/chat src/i18n
git commit -m "feat: redesign chat workspace"
```

---

### Task 9: Rebuild profile as an accessible side sheet

**Files:**
- Modify: `src/components/layout/profile-menu.tsx`
- Create: `src/components/profile/profile-sheet.tsx`
- Create: `src/components/profile/use-profile.ts`
- Create: `src/components/profile/profile-sheet.test.tsx`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/chat/chat-shell.tsx`
- Modify: `src/i18n/ru.json`
- Modify: `src/i18n/ky.json`
- Modify: `src/i18n/en.json`

**Interfaces:**
- `useProfile()` remains the shared client source and keeps `{ profile, setProfile }` behavior.
- `ProfileMenu` becomes trigger-only and delegates editing to `ProfileSheet`.
- `ProfileSheet({ profile, open, onOpenChange, onProfileChange, onDone? })` composes the shared `Sheet` and existing form/location APIs.

- [ ] **Step 1: Add failing profile presentation tests**

Assert the sheet has grouped identity/profile/location sections, a separate logout region, semantic location status text, and no hardcoded colors or user-facing strings.

- [ ] **Step 2: Run and confirm failure**

Run: `bun test src/components/profile/profile-sheet.test.tsx`

Expected: missing modules.

- [ ] **Step 3: Separate data, trigger, and sheet**

- Move profile loading into `use-profile.ts` without changing `/api/profile` behavior.
- Keep edit `PATCH /api/profile`, location `PATCH /api/profile/location`, and logout `POST /api/auth/logout` exactly.
- Use `normalizeApiError` and `StatusMessage`.
- Preserve geolocation options and 401 handling.
- Let shared `Sheet` provide focus trap, Escape, scroll lock, scrim, and trigger focus restoration.

- [ ] **Step 4: Apply the visual hierarchy**

- Side sheet on desktop, bottom sheet on small mobile through shared Sheet behavior.
- Group identity, language display, profile fields, and location.
- Coordinates use IBM Plex Mono.
- Logout is separated by border/spacing and uses danger semantics only.
- Keep initials avatar and compact/row triggers, but use semantic colors and 44px targets.

- [ ] **Step 5: Verify and commit**

Run: `bun test src/components/profile/profile-sheet.test.tsx src/lib/profile-schemas.test.ts && bunx tsc --noEmit`

Expected: pass.

```bash
git add src/components/profile src/components/layout/profile-menu.tsx src/components/layout/header.tsx src/components/chat/chat-shell.tsx src/i18n
git commit -m "feat: redesign profile settings sheet"
```

---

### Task 10: Cross-route accessibility, visual, performance, and pre-flight verification

**Files:**
- Create: `src/lib/frontend-preflight.test.ts`
- Modify as required by findings: `app/**/*.tsx`
- Modify as required by findings: `src/components/**/*.tsx`
- Modify as required by findings: `src/i18n/*.json`

**Interfaces:**
- This task introduces no product API. It enforces repository and rendered-browser acceptance criteria.

- [ ] **Step 1: Add the pre-flight invariant test**

Create `src/lib/frontend-preflight.test.ts` to scan application/component source and dictionaries. Assert:

- no `any` type escape in changed frontend files;
- no `text-[#`, `bg-[#`, `border-[#` hardcoded component colors;
- no interface emoji or new handwritten `<path>` outside `logo.tsx`;
- no imports from animation packages other than `motion/react`;
- no visible `[—–]` in dictionaries;
- RU/KY/EN top-level and recursively nested key shapes match;
- expected WebP assets exist;
- protected route names and `/api/chat/message` remain present;
- `src/lib/disease-ranking.ts` has no diff from `main`.

- [ ] **Step 2: Run automated checks and fix every failure**

Run in order:

```bash
bun test
bunx tsc --noEmit
bun run lint
bun run build
git diff --check
```

Expected: all exit 0; lint introduces no warnings; production build preserves every current route.

- [ ] **Step 3: Run local production-like browser QA**

Start `bun run dev` and use the in-app browser control skill. Check `/`, `/about`, every auth route, and `/chat` at:

- 375px mobile;
- 768px tablet;
- 1024px small desktop;
- 1440px desktop;
- mobile landscape for chat.

For each surface verify light theme, dark theme, reduced motion, loading/empty/error states, keyboard-only navigation, 200% zoom, long RU/KY/EN strings, no horizontal overflow, and no content under fixed UI or safe areas.

- [ ] **Step 4: Exercise critical interaction flows**

- Public navigation, language switch, and route-heading focus.
- Login/register step forward/back, field errors, server error, forgot/reset navigation.
- Chat text send, image preview/remove/send, pending state, success, simulated network failure, Retry, geolocation denied, new chat, mobile drawer.
- Profile open/edit/location/logout, Escape close, Tab loop, scrim close, and return focus.

Use only local mocked or already configured application responses; do not change external/backend data as part of visual QA.

- [ ] **Step 5: Measure production performance**

Against the production build, record Home mobile LCP, INP interaction sample, and CLS. Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1. If local tooling cannot produce a stable INP, record the limitation and verify no long tasks over 200ms during the core CTA/chat interactions.

- [ ] **Step 6: Run the four design-skill pre-flight reviews**

Audit the final result against:

- Field Intelligence dials 7/5/5;
- one green accent family, one radius system, one icon family;
- no generic AI-purple or template-like equal-card composition;
- no fake screenshots or decorative product claims;
- no presentation-only scroll listener, decorative infinite motion, or full-page client conversion;
- meaningful image alt text, 44px controls, WCAG AA contrast, reduced motion, and semantic status labels.

Fix findings before moving on.

- [ ] **Step 7: Re-run the entire verification suite**

Run:

```bash
bun test
bunx tsc --noEmit
bun run lint
bun run build
git diff --check
git status --short
```

Expected: all commands pass; status contains only intentional Task 10 changes.

- [ ] **Step 8: Commit the verified cleanup**

```bash
git add app src public package.json bun.lock
git commit -m "fix: complete frontend accessibility and polish pass"
```

- [ ] **Step 9: Final branch verification**

Run:

```bash
git log --oneline main..HEAD
git diff --stat main...HEAD
git status --short --branch
```

Expected: focused Conventional Commits, no backend/generated API/disease-ranking changes, and a clean `codex/taste-ai-site-redesign` worktree.

## Plan Self-Review Checklist

- [ ] Every scope item in the approved spec maps to Tasks 1 through 10.
- [ ] No task modifies backend behavior, API contracts, auth fields/order, route slugs, SEO behavior, or disease ranking.
- [ ] Every new visible string is added to RU/KY/EN together.
- [ ] All new components have exact typed interfaces and named consumers.
- [ ] Each implementation task starts from a failing test/invariant and ends with verification plus one Conventional Commit.
- [ ] Image generation, WebP optimization, `next/image`, dark theme, reduced motion, errors, loading, retry, focus, safe areas, and responsive QA are explicitly covered.
- [ ] No placeholder text, omitted implementation branch, or reference like “same as previous task” remains.
- [ ] Execution handoff is inline only; no subagent option is offered.
