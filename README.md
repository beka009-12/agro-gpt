# ibo — AI-помощник агронома

Фронтенд продукта **ibo**: лендинг, страница «О нас», регистрация/вход и чат с ИИ-диагностикой растений. Пользователь описывает симптомы или загружает фото — AI Agro API (FastAPI + Dify) определяет возможную причину и даёт рекомендации. Компания также производит органическое удобрение HYDROWOOLKS, лендинг рассказывает о продукте.

Интерфейс на трёх языках: кыргызский, русский, английский.

## Стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 16 (App Router, Server Components), React 19 |
| Язык | TypeScript (strict) |
| Стили | Tailwind CSS 4 — токены темы в `app/globals.css` (`@theme`) |
| Анимации | `motion/react` + общие токены `src/lib/motion-tokens.ts` |
| Формы и валидация | react-hook-form + zod (`@hookform/resolvers`) |
| Уведомления | react-hot-toast |
| Данные | fetch через Route Handlers; настроен `@tanstack/react-query` (провайдер в `app/providers.tsx`) |
| Типы API | orval — генерация из OpenAPI бэкенда (`npm run generate-api`) |
| Шрифты | Plus Jakarta Sans (основной), Manrope (хедер) через `next/font` |

## Быстрый старт

```bash
cp .env.example .env.local   # указать API_URL бэкенда
bun install                  # или npm install
bun dev                      # или npm run dev → http://localhost:3000
```

Переменные окружения:

- `API_URL` — адрес AI Agro API (используется только на сервере, в Route Handlers).

Скрипты: `dev`, `build`, `start`, `lint`, `generate-api` (перегенерация типов из OpenAPI).

## Архитектура

```
app/                    # App Router: страницы и API-роуты
  page.tsx              # лендинг
  about/                # о компании и продукте
  login/, register/     # авторизация (формы — клиентские компоненты)
  chat/                 # чат с ИИ (защищён гардом)
  api/                  # BFF-слой (Route Handlers):
    auth/               #   register, otp-request, otp-verify, logout
    chat/message        #   создание чата + диагностика (текст/фото)
    profile/            #   GET/PATCH профиль, PATCH локация
    locale/             #   смена языка + синк с профилем
proxy.ts                # гард маршрутов (в Next 16 заменяет middleware.ts)
src/
  components/           # по доменам: landing, about, chat, auth, layout, ui
  i18n/                 # словари ru/en/ky.json, server (getDict) и client (useI18n)
  lib/                  # zod-схемы, apiFetch, auth-cookies, motion-tokens
  api/generated/        # типы, сгенерированные orval из OpenAPI
```

### Ключевые решения

**BFF вместо прямых запросов.** Браузер никогда не ходит на бэкенд напрямую и не видит токен. Все запросы идут через Route Handlers (`app/api/*`): токен лежит в httpOnly-cookie (`ibo_token`), роут читает его и добавляет `Authorization: Bearer` к запросу на `API_URL`. Ошибки FastAPI (`detail`, массив 422) нормализуются в `src/lib/api-server.ts` и возвращаются форме как ошибки конкретных полей.

**Авторизация.** Регистрация (`POST /user/`) сразу выдаёт сессию — без подтверждения email/телефона. OTP по email нужен только для входа с нового устройства (мультисессии). `proxy.ts` редиректит: гость с `/chat` → `/login`, авторизованный с `/login`/`/register` → `/chat`.

**Локализация.** Локаль хранится в cookie `ibo_locale` (ky/ru/en, по умолчанию ru), поэтому все страницы рендерятся динамически. Серверные компоненты берут словарь через `getDict()`, клиентские — через `useI18n()`. Смена языка дополнительно синкает язык ответов ИИ в профиле пользователя.

**Дизайн-система.** Все цвета — семантические токены в `@theme` (`--color-accent`, `--color-deep`, `--color-edge`…), компоненты не используют сырые hex. Анимации уважают `prefers-reduced-motion`; модалки и шторки (язык, профиль) — порталы в `body` с focus-trap и скролл-локом.

## Проверка

Тест-раннера в проекте нет. Перед коммитом:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

плюс smoke-прогон против реального бэкенда (страницы отвечают 200, `/chat` без токена — 307).
