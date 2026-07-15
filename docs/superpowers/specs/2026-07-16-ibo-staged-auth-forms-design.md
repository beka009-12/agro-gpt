# Дизайн-спека: многошаговые формы логина/регистрации с отдельным шагом пароля

**Дата:** 2026-07-16
**Статус:** утверждён
**Контекст:** после миграции auth на пароль (см. `2026-07-15-ibo-auth-password-migration-design.md`) формы `/login` и `/register` стали одношаговыми, но перегруженными (регистрация — 6 полей на одном экране). Нужно визуально «красиво» разбить обе формы на шаги, с паролем как отдельным, самостоятельным шагом — и сохранить визуальный язык v4 (тёплый кремовый фон, зелёный акцент, Plus Jakarta Sans).

## Утверждённые решения

- **Login — 2 шага:** Шаг 1 — идентификатор (телефон/email); Шаг 2 — пароль (+ ссылка «Забыли пароль?»).
- **Register — 3 шага:** Шаг 1 — имя, телефон, email; Шаг 2 — пароль, повтор пароля; Шаг 3 — язык ответов (финальный сабмит).
- Одна RHF-форма на весь визард (значения не теряются при «Назад»); переход вперёд валидирует только поля текущего шага через `trigger()`.
- Новый переиспользуемый `PasswordInput` (обёртка над `Input` с show/hide-иконкой) — используется и в register (Шаг 2), и в `reset-password` (без реструктуризации той формы на шаги).
- `forgot-password`/`reset-password` НЕ становятся визардами — они уже разнесены на два экрана, это самостоятельное решение вне этой спеки.
- Палитра/шрифт — только существующие v4-токены (`--color-accent`, `--color-mint-soft`, `--color-edge`, `font-sans`/Plus Jakarta Sans). Никакой новой палитры.
- Анимация перехода между шагами — slide+fade на существующих токенах `DURATION.base`/`EASE_OUT` (`src/lib/motion-tokens.ts`), направленно согласованная (вперёд ⇒ уезжает влево / входит справа, назад ⇒ зеркально).

## 1. Структура компонентов

### `StepIndicator` (новый, `src/components/auth/step-indicator.tsx`)

Сегментированная полоса прогресса + эйбрау-подпись текущего шага.

- Props: `steps: string[]` (подписи шагов, напр. `["Контакты", "Пароль", "Язык"]`), `current: number` (0-based индекс)
- Визуал: ряд сегментов (`h-1 rounded-full`), пройденные и текущий — `bg-accent`, будущие — `bg-mint-soft`; над полосой — `text-xs font-mono uppercase tracking-wide text-fg-muted`, подпись текущего шага + `«N / M»`
- Без анимации самой полоски не нужно (ширина сегментов фиксирована), но заливка секции при переходе — `transition-colors duration-300`

### `PasswordInput` (новый, `src/components/ui/password-input.tsx`)

- Оборачивает `Input`, добавляет `type` переключаемый между `password`/`text` через локальный `useState`
- Кнопка-иконка (`EyeIcon`/`EyeOffIcon`, новые в `src/components/ui/icons.tsx`, стиль как у существующих — `stroke 1.75`, `viewBox 0 0 24 24`) — абсолютно спозиционирована внутри поля справа, `aria-label` переключается («Показать пароль» / «Скрыть пароль»)
- Проброс всех остальных props как у `Input` (label/error/hint/autoComplete и т.д.)

### `StepTransition` (новый, `src/components/auth/step-transition.tsx`)

Тонкая обёртка на `AnimatePresence`/`motion.div` из `motion/react`:

- Props: `stepKey: number | string` (ключ текущего шага для `AnimatePresence`), `direction: 1 | -1` (1 — вперёд, -1 — назад), `children`
- `initial`/`animate`/`exit` по `x` (`24 * direction` / `0` / `-24 * direction`) + `opacity`, `transition: { duration: DURATION.base, ease: EASE_OUT }`
- Уважает `useReducedMotion()` (как уже делает `profile-menu.tsx`) — при reduced motion анимация схлопывается до чистого fade без смещения по `x`

## 2. Единый обработчик сабмита формы (важно для Enter)

Все поля визарда живут в одном `<form>`, поэтому нативный сабмит (клик по кнопке `type="submit"` ИЛИ Enter в текстовом поле) всегда всплывает до `<form onSubmit>`. Чтобы Enter на промежуточном шаге не пытался отправить весь визард раньше времени, кнопка «Далее» — тоже `type="submit"`, а сам `onSubmit` ветвится по текущему шагу:

```ts
const onSubmit = handleSubmit(async (values) => {
  if (step < LAST_STEP) {
    const ok = await trigger(FIELDS_PER_STEP[step])
    if (ok) goToStep(step + 1)
    return
  }
  // последний шаг — реальная отправка на бэк (логика без изменений)
  ...
})
```

Таким образом Enter и клик по кнопке всегда ведут себя одинаково: на любом шаге кроме последнего — валидация текущих полей и переход дальше; на последнем — настоящий сабмит. `handleSubmit` уже сам блокирует переход, если `trigger` вернул `false` (RHF выставит ошибки на поля шага).

## 3. Register — 3 шага

`app/register/register-form.tsx` перестраивается на локальный `step: number` (0–2) + `direction`:

- **Шаг 0 (Контакты):** `full_name`, `phone`, `email` (как сейчас) → кнопка «Далее» (`type="submit"`) → валидирует `["full_name", "phone", "email"]`
- **Шаг 1 (Пароль):** `PasswordInput` для `password` и `confirm_password` → «Назад» / «Далее» → валидирует `["password", "confirm_password"]`
- **Шаг 2 (Язык):** `Select` для `language` → «Назад» / «Создать аккаунт» (последний шаг — реальный POST на `/api/auth/register`, логика самого запроса не меняется)
- `StepIndicator` над полями: `["Контакты", "Пароль", "Язык"]`
- Серверная ошибка (`serverError`) показывается там же, где сейчас — под текущим шагом, над кнопками

## 4. Login — 2 шага

`app/login/login-form.tsx` перестраивается аналогично, `step: 0 | 1`:

- **Шаг 0 (Идентификатор):** поле `identifier` → «Далее» → валидирует `["identifier"]`
- **Шаг 1 (Пароль):** `PasswordInput` для `password`, ссылка «Забыли пароль?» (передаёт `identifier` в query, как сейчас) → «Назад» / «Войти» (последний шаг — реальный POST на `/api/auth/login`, без изменений в логике)
- `StepIndicator`: `["Телефон или email", "Пароль"]`
- При «Назад» с шага 1 поле `identifier` остаётся заполненным (та же RHF-форма)

## 5. Reset-password — только `PasswordInput`

`app/reset-password/reset-password-form.tsx`: поля `new_password`/`confirm_password` заменяются на `PasswordInput`. Структура формы (одношаговая) не меняется.

## 6. Файлы

```
src/components/auth/
  step-indicator.tsx          # новый
  step-transition.tsx         # новый
  auth-card.tsx               # без изменений
src/components/ui/
  password-input.tsx          # новый
  icons.tsx                   # + EyeIcon, EyeOffIcon
app/register/register-form.tsx     # рефактор на 3 шага
app/login/login-form.tsx           # рефактор на 2 шага
app/reset-password/reset-password-form.tsx  # PasswordInput вместо type="password" Input
src/i18n/{ru,ky,en}.json            # + подписи шагов, aria-label глаза, «Назад»/«Далее»
```

## 7. i18n

Новые ключи в `auth`:
- `register.steps`: `["Контакты", "Пароль", "Язык"]` (и переводы ky/en)
- `login.steps`: `["Телефон или email", "Пароль"]`
- `auth.common.back` / `auth.common.next` («Назад» / «Далее») — общие для register/login, отдельный неймспейс внутри `auth`, а не глобальный `common`
- `auth.common.showPassword` / `auth.common.hidePassword` (aria-label для иконки глаза)

## 8. Критерии приёмки

- `bunx tsc --noEmit`, `bun run lint`, `bun run build` — чисто
- Ручная проверка: регистрация проходит все 3 шага, «Назад» сохраняет введённые значения, финальный сабмит идентичен по поведению текущему (cookie, редирект на `/chat`)
- Login: оба шага, «Забыли пароль?» на шаге 2 передаёт идентификатор
- Password-поля везде (register, reset-password) переключают видимость по клику на иконку
- `prefers-reduced-motion`: переходы между шагами — мгновенный fade без смещения
- Enter в любом текстовом поле на промежуточном шаге ведёт себя как клик «Далее» (не сабмитит форму раньше времени) — обеспечивается веткой в едином `onSubmit` (см. раздел 2), не отдельной обработкой `onKeyDown`
- 360px / 768px / 1440px — корректно

## Вне скоупа

- Реструктуризация `forgot-password` на шаги
- Индикатор силы пароля (password strength meter)
- Анимация самой `StepIndicator` (заливка только через `transition-colors`, без spring/motion)
