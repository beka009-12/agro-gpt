# Дизайн-спека: миграция auth на пароль + orval sync

**Дата:** 2026-07-15
**Статус:** утверждён
**Контекст:** бэкенд (AI Agro API) полностью заменил модель авторизации. Старые OTP-эндпоинты (`/user/*`) удалены целиком, вместо них — классический email/phone + пароль под префиксом `/api/*`. Локальный `openapi.json` (и сгенерированный orval-клиент) устарели относительно живого бэка на `http://167.233.203.129`.

## Утверждённые решения

- Делаем весь цикл сразу: `register` / `login` / `logout` под пароль **и** `forgot-password` / `reset-password` — не откладываем.
- Идентификатор на логине и в forgot-password — одно поле «телефон или email» с автоопределением формата на клиенте (по существующему `PHONE_REGEX`), без табов/переключателей.
- Поле `region` убирается из фронта полностью — бэк больше не принимает и не возвращает его нигде (ни в `RegisterRequest`, ни в `UpdateProfileRequest`).
- `DELETE /api/profile` (удаление аккаунта) не подключаем — вне скоупа этого этапа.
- Требования к паролю бэк не декларирует (просто `string` в схеме) — на клиенте ставим минимум 8 символов, без доп. правил сложности.

## API-диф (снято сравнением `openapi.json` vs живой `/openapi.json`)

| Действие | Было | Стало | Запрос | Ответ |
|---|---|---|---|---|
| Регистрация | `POST /user/` | `POST /api/auth/register` | `{ full_name, password, phone?, email?, device_info? }` | не типизирован (`{}`), парсим защитно |
| Логин | `POST /user/login/request` + `/verify` (OTP) | `POST /api/auth/login` | `{ password, phone?, email?, device_info? }` | не типизирован (`{}`), парсим защитно |
| Выход | `POST /user/logout?token=` (query) | `POST /api/auth/logout` (`Authorization` header) | — | — |
| Забыли пароль | — (нет) | `POST /api/auth/forgot-password` | `{ phone?, email? }` | ответ одинаковый независимо от существования аккаунта (privacy by design на бэке) |
| Сброс пароля | — (нет) | `POST /api/auth/reset-password` | `{ phone?, email?, reset_code, new_password }` | не типизирован |
| Профиль (get/patch/delete) | `/user/{user_id}/profile` | `GET/PATCH/DELETE /api/profile` (Bearer, без id в пути) | `UpdateProfileRequest`: `{ full_name?, phone?, email?, language? }` — без `region` | не типизирован |
| Локация | `/user/{user_id}/location` | `PATCH /api/profile/location` | `{ latitude, longitude }` (без изменений) | не типизирован |

Chat/diagnosis/sessions/health — без изменений, common paths совпадают 1:1.

## 1. Синхронизация API-клиента

1. Перезаписать `openapi.json` актуальным содержимым с бэка.
2. `npm run generate-api` (orval, `tags-split`) — перегенерирует `src/api/generated/{endpoints,models}` под теги `Auth`/`Profile` вместо `User`.
3. Orval не чистит файлы под удалённые эндпоинты — после генерации удалить осиротевшие:
   - `src/api/generated/endpoints/user/` (весь тег)
   - модели: `userInputSchema`, `userOutSchema`, `emailLoginRequest`, `oTPVerifyRequest`, `loginResponse`, `updateLanguageRequest`, `listUsersUserGetParams`, `logoutUserLogoutPostParams`
   - перед удалением — grep по проекту на каждый файл, чтобы не задеть chat/diagnosis/sessions (ожидаем, что они изолированы, но проверяем явно)

## 2. Флоу

### Регистрация `/register`

1. Форма: имя*, телефон*, email (опционально, как раньше), пароль* (мин. 8), повтор пароля* (клиентская сверка), язык (селект, влияет только на UI-локаль — бэк это поле при регистрации не принимает)
2. Сабмит → `POST /api/auth/register` (наш route handler) с `{ full_name, phone, email, password, device_info: user-agent }`
3. Роут ставит cookies из ответа (как раньше, защитный парсинг — обязателен только `access_token`)
4. Best-effort `PATCH /api/profile { language }` сразу после регистрации — если этот вызов упадёт, не блокируем и не показываем ошибку пользователю (язык — не критичное поле, можно поправить в профиле)
5. `router.push("/chat")`

### Логин `/login` — одношаговая форма

1. Поля: идентификатор (телефон или email, автоопределение по `PHONE_REGEX`), пароль
2. Сабмит → `POST /api/auth/login` через наш route handler → `{ phone, password, device_info }` или `{ email, password, device_info }` в зависимости от формата
3. Cookies → `router.push("/chat")`
4. Ссылка «Забыли пароль?» → `/forgot-password`, предзаполняя идентификатор через query, если он уже введён

### Забыли пароль `/forgot-password`

1. Форма: идентификатор (тот же автодетект)
2. Сабмит → `POST /api/auth/forgot-password` → всегда успех в UI (бэк намеренно не палит существование аккаунта) → показываем нейтральное сообщение «если аккаунт есть, код отправлен»
3. Переход на `/reset-password?identifier=...`

### Сброс пароля `/reset-password`

1. Поля: идентификатор (предзаполнен из query, редактируемый), код сброса, новый пароль, повтор
2. Сабмит → `POST /api/auth/reset-password`
3. Успех → toast + редирект на `/login`

### Выход и профиль

- `logout`: путь меняется на `/api/auth/logout`, `Authorization: Bearer` уже используется правильно — без изменений в контракте
- `profile` GET/PATCH: путь `/user/me*` → `/api/profile`, из пейлоада убирается `region`
- `profile/location` PATCH: путь → `/api/profile/location`, поля без изменений

## 3. Схемы и валидация

`src/lib/auth-schemas.ts`:
- `makeRegisterFormSchema`: убрать `region`, добавить `password` (min 8), `confirm_password` (`.refine` на совпадение)
- Новая `makeLoginFormSchema`: `identifier` (непустая строка), `password`
- Новая `makeForgotPasswordFormSchema`: `identifier`
- Новая `makeResetPasswordFormSchema`: `reset_code`, `new_password` (min 8), `confirm_password` (`.refine`)
- Удалить: `makeOtpFormSchema`, `otpVerifyDtoSchema`, `makeEmailFormSchema`
- `loginResponseSchema` — без изменений (лениво парсит, только `access_token` обязателен), переиспользуется для register/login/reset
- Новый хелпер `splitIdentifier(value): { phone?: string; email?: string }` — по `PHONE_REGEX` решает, куда класть значение

`src/lib/profile-schemas.ts`:
- `userProfileSchema` и `makeProfileFormSchema` — убрать `region`

## 4. Файлы

```
openapi.json                                  # перезаписать свежим
orval.config.ts                               # без изменений
app/
  register/register-form.tsx                  # + password/confirm_password, − region
  login/login-form.tsx                        # одношаговая форма identifier+password, ссылка forgot-password
  forgot-password/page.tsx                    # новый, AuthCard
  forgot-password/forgot-password-form.tsx    # новый
  reset-password/page.tsx                     # новый, AuthCard
  reset-password/reset-password-form.tsx      # новый
  api/auth/register/route.ts                  # путь + payload без region/language, + best-effort profile patch
  api/auth/login/route.ts                     # новый, заменяет otp-request/otp-verify
  api/auth/otp-request/route.ts               # удалить
  api/auth/otp-verify/route.ts                # удалить
  api/auth/forgot-password/route.ts           # новый
  api/auth/reset-password/route.ts            # новый
  api/auth/logout/route.ts                    # путь → /api/auth/logout
  api/profile/route.ts                        # путь → /api/profile, − region
  api/profile/location/route.ts               # путь → /api/profile/location
src/lib/
  auth-schemas.ts                              # см. секцию 3
  profile-schemas.ts                           # − region
src/components/
  auth/auth-card.tsx                           # без изменений, переиспользуется для forgot/reset
  layout/profile-menu.tsx                      # − region из формы и toFormValues
src/i18n/{ru,ky,en}.json                       # − region*, + password/confirmPassword/identifier/forgotPassword/resetPassword ключи
```

## 5. Критерии приёмки

- `tsc --noEmit`, `npm run lint`, `npm run build` — чисто
- Ручная проверка с живым API: регистрация (с паролем) → `/chat` → выход → логин по паролю (и телефоном, и email) → forgot-password → reset-password → логин новым паролем
- Профиль: редактирование без поля региона сохраняется корректно; location patch работает по новому пути
- Ни один файл под `src/api/generated/endpoints/user/` не остаётся неиспользуемым в проекте после чистки

## Вне скоупа

- `DELETE /api/profile` (удаление аккаунта)
- Правила сложности пароля сверх минимальной длины
- Rate-limiting на forgot-password (кроме client-side disabled на время запроса, по аналогии со старым OTP-resend)
- Изменения в chat/diagnosis/sessions — эти пути не менялись
