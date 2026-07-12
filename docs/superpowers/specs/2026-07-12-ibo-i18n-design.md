# ibo — трёхъязычность (KY / RU / EN) с переключателем (2026-07-12)

Источники контента «О нас»: `AGRO_IBO_HYDROWOOLKS.docx` (RU+EN), «AGRO IBO компаниясы жөнүндө.docx» (KY) — извлечённые тексты в scratchpad (`doc-ru-en.txt`, `doc-ky.txt`), содержимое переносится в спеку планом. Остальные разделы сайта переводит Claude (EN, KY); KY рекомендуется вычитать носителю.

## Решения

- **Локаль в cookie `ibo_locale`** (`ky` | `ru` | `en` — ровно enum `Language` из AI Agro API). URL не меняются. Default: `ru`. Cookie httpOnly, maxAge 1 год, sameSite lax.
- Страницы переходят со статики на серверный рендер по запросу (чтение cookie) — осознанный трейд-офф.
- **Синк с бэкендом:**
  - `POST /api/locale` ставит cookie; если есть `ibo_uid` + `ibo_token` — дополнительно `PATCH /user/{user_id}/language {language}` с Bearer (fire-and-forget: ошибка логируется, не блокирует смену UI-языка).
  - Начинаем хранить `user_id` из ответов register/login/verify в httpOnly cookie `ibo_uid` (живой API возвращает `user_id`, спека — нет: парсим опционально).
  - Регистрация: язык из формы → ставится и как `ibo_locale`.
  - OTP-вход: `LoginResponse.language` (если валидная локаль) → ставится как `ibo_locale`.

## Структура i18n

- `src/i18n/config.ts` — `LOCALES = ["ky","ru","en"] as const`, `type Locale`, `DEFAULT_LOCALE = "ru"`, `LOCALE_COOKIE = "ibo_locale"`, гард `isLocale()`.
- `src/i18n/ru.json` (существующий, структура не меняется кроме контента about из дока и чипа `RU / KY` → `RU / KY / EN`), новые `en.json`, `ky.json` — идентичная структура ключей.
- `src/i18n/dictionaries.ts` — `type Dictionary = typeof ru`, `Record<Locale, Dictionary>`, `getDictionary(locale)`. TS структурно гарантирует совпадение ключей словарей.
- `src/i18n/server.ts` — `getLocale(): Promise<Locale>` (cookie → isLocale → default), `getDict(): Promise<Dictionary>`.
- `src/i18n/client.tsx` — `I18nProvider({locale, dict, children})` + `useI18n(): {locale, dict}` (context; throw при использовании вне провайдера).

## Подключение

- `app/layout.tsx` — async: `<html lang={locale}>`, `I18nProvider` вокруг детей, `generateMetadata()` из словаря (ключи `meta.title`, `meta.description` добавляются в словари).
- `app/about/page.tsx` — `export const metadata` → `generateMetadata()` из `dict.about.metaTitle/metaDescription`.
- **Серверные компоненты** (hero, features, how-it-works, footer, auth-card, все about/*, страницы): `import ru from ...` → `const dict = await getDict()` (компоненты становятся async).
- **Клиентские компоненты** (header, floating-nav, chat-view, chat-input, chat-header, empty-state, message-list, logout-button, register-form, login-формы): `const { dict } = useI18n()`.
- **Zod-схемы с русскими сообщениями** (`auth-schemas.ts`, используются и клиентом, и роутами): превращаются в фабрики `makeRegisterFormSchema(dict)` и т.п.; безсообщенческие схемы (`otpVerifyDtoSchema`, `loginResponseSchema`, chat-schemas) остаются константами. `loginResponseSchema` дополняется `user_id: z.string().optional()`.
- **API-роуты** отвечают на языке юзера: в начале роута `const dict = await getDict()`, все `ru.auth.errors.*` → `dict.auth.errors.*`.

## Переключатель

`src/components/layout/language-switcher.tsx` (client): три пилюли `RU | KY | EN` (текущая — заливка accent/белый текст; остальные — text-fg-muted, hover text-fg). Клик: `POST /api/locale {language}` → `router.refresh()`; во время запроса кнопки disabled. Размещение: хедер (справа, перед «Начать чат») и чат-хедер. `aria-label` пилюль — название языка («Кыргызча», «Русский», «English») — берётся из словаря (`languageSwitcher.ky/ru/en`).

## Контент

- `about.*` во всех трёх словарях — из документов дословно (RU: «фермерам…», добавлен подзаголовок форматов фасовки «Розничная/Оптовая упаковка/IBC-контейнер» как подпись к пилюлям — в KY-доке форматов нет, для KY переводит Claude по аналогии).
- Остальные ключи en/ky — перевод Claude, тон и длина сопоставимы с ru.
- `hero.trust`: чип `RU / KY` → `RU / KY / EN` во всех словарях.

## Проверка

`tsc` + `lint` + `build`; smoke: `curl -H "Cookie: ibo_locale=ky" /` содержит кыргызский маркер и не содержит русского заголовка hero; аналогично `en`; `/about` для трёх локалей; `POST /api/locale {"language":"xx"}` → 400. Ручная проверка переключателя и языка ответов ИИ — за пользователем.
