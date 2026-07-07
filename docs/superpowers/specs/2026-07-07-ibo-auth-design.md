# Дизайн-спека: страницы auth для ibo

**Дата:** 2026-07-07
**Статус:** утверждён
**Контекст:** лендинг ibo готов (ветка `feat/ibo-landing`). Кнопки header ведут на `/login` и `/register` — этих страниц ещё нет. Бэкенд: AI Agro API. Этот этап: регистрация, логин по OTP, заглушка `/chat`, защита роутов.

## Утверждённые решения

- **Хранение токена:** httpOnly cookie через Next.js Route Handlers (подход A). Браузер к внешнему API напрямую не ходит.
- **Поля регистрации:** все из `UserInputSchema` — `full_name`*, `phone`*, `email`, `region`, `language` (селект ky/ru/en, дефолт `ky`).
- **После входа/регистрации:** редирект на заглушку `/chat`.
- **Язык UI:** русский, тексты в `src/i18n/ru.json` (раздел `auth`).

## API (из openapi.json, снят с сервера)

| Действие | Endpoint | Запрос | Ответ |
|---|---|---|---|
| Регистрация / первый вход | `POST /user/` | `UserInputSchema` | не типизирован в OpenAPI (`{}`); ожидаем форму `LoginResponse`, парсим защитно |
| Запрос OTP | `POST /user/login/request` | `{ email }` | не типизирован |
| Проверка OTP | `POST /user/login/verify` | `{ email, otp_code, language?, device_info? }` | `LoginResponse` |
| Выход | `POST /user/logout?token=...` | token в query | — |

`LoginResponse`: `{ access_token, token_type, expires_at, language, full_name }`.

## 1. Флоу

### Регистрация `/register`

1. Форма: имя*, телефон*, email (подпись «нужен для повторного входа»; предупреждение при пустом), регион, язык (селект, дефолт ky)
2. Сабмит → `POST /api/auth/register` (наш Route Handler)
3. Роут проксирует в `POST /user/`, из ответа берёт `access_token`/`expires_at`/`full_name`/`language`, ставит cookies
4. Клиент делает `router.push("/chat")`

### Логин `/login` — два шага на одной странице (state в client-компоненте)

1. **Шаг email:** ввод email → `POST /api/auth/otp-request` → при 200 переключаемся на шаг OTP (показываем «код отправлен на {email}»)
2. **Шаг OTP:** одно поле кода (`inputMode="numeric"`, автофокус) → `POST /api/auth/otp-verify` (роут добавляет `device_info` из заголовка User-Agent) → cookies → `router.push("/chat")`
3. Кнопки: «Отправить код ещё раз» (повторный otp-request), «Изменить email» (возврат на шаг 1)

### Заглушка `/chat`

- Server Component: читает `ibo_user` cookie → «Привет, {full_name}! Чат скоро здесь» + `LogoutButton`
- Выход: `POST /api/auth/logout` → роут дёргает `POST /user/logout?token=<из httpOnly cookie>`, чистит обе cookies → клиент редиректит на `/`
- Ошибка API при logout не блокирует выход: cookies чистим в любом случае

### Защита роутов `middleware.ts`

- Нет `ibo_token` + путь `/chat` → redirect `/login`
- Есть `ibo_token` + путь `/login` или `/register` → redirect `/chat`
- `matcher: ["/chat", "/login", "/register"]`

## 2. Cookies и серверная часть

| Cookie | Флаги | Содержимое |
|---|---|---|
| `ibo_token` | httpOnly, Secure (prod), SameSite=Lax, Path=/, maxAge из `expires_at` | access_token |
| `ibo_user` | НЕ httpOnly (читает клиент/сервер для отображения), остальные флаги те же | JSON `{ full_name, language }` |

- URL API на сервере — env `API_URL` (добавить в `.env.local` и `.env.example`; `NEXT_PUBLIC_API_URL` остаётся для orval-клиента до этапа чата)
- Роут-хендлеры: валидация входа zod-схемами, `try/catch`, ошибки логируются `console.error`, клиенту — статус + `{ message }` по-русски
- Защитный парсинг ответа `POST /user/`: если `access_token` отсутствует → 502 «Сервер вернул неожиданный ответ»; если `full_name`/`language` в ответе нет — берём значения из данных формы (они есть в запросе)
- Маппинг ошибок API: 422 → «Проверьте правильность данных», 4xx с detail-строкой → пробрасываем detail, 5xx/сеть → «Сервис временно недоступен»

## 3. Файлы

```
middleware.ts                        # guard роутов по cookie
app/
  register/page.tsx                  # server: метаданные + обёртка
  register/register-form.tsx         # client: RHF + zod
  login/page.tsx
  login/login-form.tsx               # client: 2 шага (email → OTP)
  chat/page.tsx                      # server: читает ibo_user cookie
  chat/logout-button.tsx             # client
  api/auth/register/route.ts
  api/auth/otp-request/route.ts
  api/auth/otp-verify/route.ts
  api/auth/logout/route.ts
src/lib/
  auth-cookies.ts                    # имена cookies, set/clear хелперы
  api-server.ts                      # серверный fetch к API_URL + маппинг ошибок
src/components/ui/
  input.tsx                          # текстовое поле в стиле токенов
  select.tsx                         # селект
  button.tsx                         # кнопка с loading-состоянием
src/i18n/ru.json                     # + раздел auth.*
```

Единицы независимы: `api-server.ts` не знает про cookies; `auth-cookies.ts` не знает про API; роуты композируют оба; формы знают только свои `/api/auth/*` эндпоинты.

## 4. UI/UX

- Стиль лендинга: центрированная карточка `bg-bg-elevated` + `border-edge` + скругления, лого `ibo●` над карточкой (ссылка на `/`), заголовок `font-display`
- Появление карточки — `SectionReveal` (переиспользуем)
- CTA-кнопка: неон-зелёная (`bg-accent text-bg`) с hover-glow, при loading — спиннер + disabled
- Ошибки: inline под полями (zod-валидация), серверные — красный блок над кнопкой, сетевые — toast (react-hot-toast уже подключён)
- Валидация (zod, на клиенте и в роутах): имя ≥ 2 символов; телефон — опциональный `+` и 9–15 цифр; email — формат (на логине обязателен; на регистрации опционален)
- `/chat`: тот же тёмный стиль, крупное приветствие, бейдж «в разработке»

## 5. Критерии приёмки

- `bunx tsc --noEmit`, `bun run lint`, `bun run build` — чисто
- curl: `/register` и `/login` рендерятся (200, содержат заголовки форм); `/chat` без cookie → редирект на `/login` (3xx + Location)
- Ручная проверка с живым API: регистрация → `/chat` с именем → выход → логин по OTP → `/chat`
- Корректно на 360px / 768px / 1440px

## Вне скоупа

- Catch-all прокси `/api/proxy/[...path]` и переключение orval `customInstance` на него — этап чата
- Сам чат и диагностика
- Локализации ky/en
- Rate-limiting повторной отправки OTP (на стороне фронта — только disabled на время запроса)
