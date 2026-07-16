# Email-only auth, чистка проекта, SEO — дизайн

Дата: 2026-07-16. Ветка: `feat/v4-redesign`. Бэкенд: `http://167.233.203.129` (актуален, спека не менялась — `phone` там остаётся опциональным полем, фронт просто перестаёт его использовать).

## Цель

1. Аутентификация только по email — телефон полностью уходит из UI (логин, регистрация, восстановление пароля, профиль).
2. Чистка проекта от мёртвого кода, неиспользуемых файлов и зависимостей.
3. SEO-блок: metadata, OG, sitemap, robots, JSON-LD.
4. Полное e2e-тестирование на живом бэке с реальной почтой пользователя.

## Порядок работ (подход A — блоки в текущей ветке)

0. Проверить (tsc/lint/build) и закоммитить висящие изменения v4-чата (chat-shell, chat-sidebar, chat-header, удалённый logout-button, app/chat/page.tsx, README).
1. Auth email-only.
2. Чистка.
3. SEO.
4. Полный e2e-тест.

Каждый блок — отдельный коммит(ы), Conventional Commits.

## Блок 1: Auth email-only

### Формы

- **Login** (`app/login/login-form.tsx`, 2-шаговый визард): поле `identifier` → `email` (`type="email"`, `autocomplete="email"`), валидация `z.email()`. Query-параметр цепочки login↔forgot↔reset: `?identifier=` → `?email=`.
- **Register** (`app/register/register-form.tsx`, 3-шаговый визард): шаг 1 `full_name + phone + email` → `full_name + email`; email становится обязательным. Редирект после регистрации: `/login?email=...`.
- **Forgot password** (`app/forgot-password/forgot-password-form.tsx`): identifier → email.
- **Reset password** (`app/reset-password/reset-password-form.tsx`): identifier → email.
- **Профиль** (`src/components/layout/profile-menu.tsx`): удалить телефон из отображения и формы редактирования; подсказка под именем (`profile.phone || menuHint`) показывает email.

### Схемы и роуты

- `src/lib/auth-schemas.ts`: удалить `PHONE_REGEX`, `isPhoneLike`, `splitIdentifier`; во всех схемах обязательный `email: z.email()`.
- `src/lib/profile-schemas.ts`: удалить `phone`.
- `app/api/auth/login|register|forgot-password|reset-password/route.ts`, `app/api/profile/route.ts`: слать бэку только `email`, поле `phone` не отправлять (на бэке оно опционально). Существующие аккаунты с телефоном на бэке не трогаются — изменение чисто фронтовое.
- `src/i18n/{ru,en,ky}.json`: удалить ключи `identifier*`, `phone*` (auth + profile), добавить `email*` где отсутствуют. KY-переводы новых ключей — по образцу существующих (вычитка носителем — отдельно).

## Блок 2: Чистка

### Подтверждённый мусор

- `src/api/` (orval-клиент + axios-инстанс) — не импортируется нигде в `app/` и `src/` вне себя.
- `orval.config.ts`, скрипт `generate-api` в `package.json`.
- Зависимости `orval`, `axios` — удалить, если после удаления `src/api/` не используются нигде.
- `NEXT_PUBLIC_API_URL` из `.env` / `.env.example` (используется только в `src/api/index.ts`).
- `openapi.json` — **оставить** (живая справка по бэку).

### Систематический поиск

- Прогнать `knip` (bunx): неиспользуемые файлы, экспорты, зависимости. Каждую находку верифицировать вручную (grep) перед удалением — knip даёт ложные срабатывания на next-конвенциях.
- Неиспользуемые i18n-ключи (скриптом сравнить ключи словаря с использованием в коде).
- Неиспользуемые ассеты `public/`.

### Аудит «дыр» (лёгкий)

- Валидация DTO во всех `app/api/*` роутах (zod-парс до fetch к бэку).
- httpOnly-куки для токена, отсутствие секретов в клиентском бандле.
- Обработка 401 (кука чистится, редирект на /login).
- `http://` до бэка без TLS — зафиксировать в README как известное ограничение (чинится доменом + сертификатом на бэке, вне зоны фронта).

## Блок 3: SEO

- **Metadata API**: title/description на все страницы; auth-страницы — перевести metadata с RU-статики на словарь (deferred minor из бэклога); OG-теги (title, description, type, locale), canonical.
- **`app/sitemap.ts`**: `/`, `/about` (по локалям — alternates). **`app/robots.ts`**: disallow `/chat`, `/api`, auth-страницы; auth-страницы дополнительно `robots: noindex` в metadata.
- **JSON-LD** на лендинге: `Organization` + `WebSite`.
- Абсолютный URL: env `NEXT_PUBLIC_SITE_URL`, дефолт-плейсхолдер `http://localhost:3000` (домена пока нет — пользователь впишет позже). Sitemap/canonical строятся от неё.

## Блок 4: Тестирование

После каждого блока: `tsc --noEmit`, `eslint`, `next build`.

Финальный e2e на живом бэке через локальный прод-сервер (`next build && next start`, порт чистить через `lsof -tiTCP:3000`):

1. Smoke всех страниц во всех локалях (ru/ky/en): `/`, `/about`, `/login`, `/register`, `/forgot-password`, `/reset-password` → 200; `/chat` без токена → 307.
2. Регистрация нового аккаунта: почта `bekbolnurmsmitov220099@gmail.com`, сгенерированный пароль (показывается пользователю в чате).
3. Логин по почте → /chat → отправка сообщения → ответ AI.
4. Logout → повторный логин.
5. Forgot-password: код приходит на почту пользователя → **пользователь сообщает код** → reset на новый пароль → логин с новым паролем. Единственный шаг, требующий участия пользователя.
6. Профиль: смена имени и языка; телефона нет нигде в UI.
7. Негативные кейсы: неверный пароль, невалидный email, несуществующий аккаунт (ответы бэка отображаются понятно, без 500).

## Вне скоупа

- Изменения бэкенда (поле `phone` остаётся в API — просто не используется фронтом).
- Домен/TLS.
- Вычитка KY-переводов носителем.
