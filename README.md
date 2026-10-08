# ibo — AI-помощник агронома

Фронтенд продукта **ibo**: лендинг, страница «О нас», регистрация и вход, чат с ИИ-диагностикой растений и отзывы. Пользователь описывает симптомы или загружает фото — AI Agro API (FastAPI + Dify) определяет возможную причину и даёт рекомендации.

Интерфейс на трёх языках: кыргызский, русский, английский.

Прод: [agro-ibo.com](https://agro-ibo.com) (Vercel).

## Стек

| Слой              | Технология                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| Фреймворк         | Next.js 16 (App Router, Server Components), React 19                   |
| Язык              | TypeScript (strict)                                                    |
| Стили             | Tailwind CSS 4 — токены темы в `app/globals.css` (`@theme`)            |
| Анимации          | `motion/react` + общие токены `src/lib/motion-tokens.ts`               |
| Формы и валидация | react-hook-form + zod                                                  |
| Уведомления       | react-hot-toast                                                        |
| Карта             | Leaflet                                                                |
| Данные            | `fetch` через Route Handlers (`app/api`)                               |
| Типы API          | Orval — fetch-клиент и DTO из `openapi.json` (`bun run generate-api`) |
| Шрифты            | Onest (текст), Manrope (заголовки), IBM Plex Mono — через `next/font`  |

## Быстрый старт

```bash
cp .env.example .env.local   # указать API_URL бэкенда
bun install
bun dev                      # http://localhost:3000
```

## Переменные окружения

| Переменная             | Назначение                                                                  |
| ---------------------- | --------------------------------------------------------------------------- |
| `API_URL`              | Адрес бэкенда. Нужен и на этапе сборки: через него проксируются `/media/*` |
| `NEXT_PUBLIC_SITE_URL` | Публичный адрес сайта: `metadataBase`, sitemap, robots и JSON-LD            |

## Скрипты

| Команда                | Что делает                                       |
| ---------------------- | ------------------------------------------------ |
| `bun dev`              | Dev-сервер                                       |
| `bun run build`        | Продакшен-сборка                                 |
| `bun run lint`         | ESLint                                           |
| `bunx tsc --noEmit`    | Проверка типов                                   |
| `bun test`             | Тесты чистой логики (`src/lib/*.test.ts`)        |
| `bun run generate-api` | Перегенерировать API-клиент и DTO из `openapi.json` |

## Структура

```
app/              страницы и Route Handlers (app/api — прокси к бэкенду)
src/components/   UI по разделам: landing, chat, reviews, auth, about, layout, ui
src/i18n/         словари ky / ru / en
src/lib/          схемы zod, работа с API и чистая логика с тестами
src/api/generated сгенерированный Orval-клиент (не править руками)
```
