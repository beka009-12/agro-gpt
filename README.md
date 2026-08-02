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
| Данные | `fetch` через Route Handlers |
| Типы API | Orval — fetch-клиент и DTO из OpenAPI бэкенда (`bun run generate-api`) |
| Шрифты | Plus Jakarta Sans (основной), Manrope (хедер) через `next/font` |

## Быстрый старт

```bash
cp .env.example .env.local   # указать API_URL бэкенда
bun install                  # или npm install
bun run generate-api        # обновить API-клиент и DTO из openapi.json
bun dev                      # или npm run dev → http://localhost:3000
```
