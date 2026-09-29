# История чатов (сайдбар в стиле ChatGPT) — дизайн

Дата: 2026-09-29. Ветка: `codex/taste-ai-site-redesign`. Бэкенд уже поддерживает всю фичу — см. `README.md` (TODO-блок) и живой `openapi.json` (обновлён 2026-09-29 с `http://167.233.203.129/openapi.json`, тег `chat`). Orval-клиент уже перегенерирован (`src/api/generated/endpoints/chat/chat.ts`, `src/api/generated/models/{chatListItemSchema,chatMessageSchema,chatMessagesSchema,chatRenameSchema}.ts`) — используется только как справочник по формам запросов/ответов, реальные вызовы бэкенда идут через `apiFetch`, как и везде в проекте.

## Цель

Список прошлых чатов слева, как в ChatGPT: открыть, продолжить, переименовать, удалить (в корзину на 3 дня) и восстановить. Сегодня `chat-sidebar.tsx` — просто рельса с кнопкой «Новый чат»; истории чатов на фронтенде нет вообще (`chatIdRef` в `chat-view.tsx` живёт только в памяти вкладки).

## Решённые в брейншторминге вопросы

1. **Навигация** — динамический роут `/chat/[chatId]`, а не только клиентский стейт. Обновление страницы не теряет открытый чат.
2. **Корзина** — тоггл/вкладка внутри того же сайдбара (`?deleted=true`), без отдельной страницы.
3. **Пагинация списка чатов** — MVP без догрузки: один запрос `GET /chat/?limit=50`, без `offset`. Долистать до 50+ чатов — не сценарий MVP.
4. **Удаление** — подтверждение маленьким confirm-попапом перед `DELETE /chat/{id}` (это soft-delete, но подтверждение всё равно нужно, чтобы не случайно кликнуть иконку в списке).
5. **Переименование** — инлайн-редактирование прямо в списке (title → `<input>`, Enter/blur сохраняет, Escape отменяет), без модалки.

## Архитектура

### Роутинг
- Новый `app/chat/[chatId]/page.tsx` — server component, зеркало `app/chat/page.tsx` (тот же `generateMetadata`), рендерит `<ChatShell initialChatId={chatId} />`. Валидация формата `chatId` (`z.uuid()`, схема `chatIdSchema` уже есть в `chat-schemas.ts`) — если невалиден, `notFound()`.
- `app/chat/page.tsx` не меняется (список без выбранного чата = пустое состояние, как сейчас).
- `ChatShell` получает опциональный проп `initialChatId?: string`, поднимает `activeChatId` в свой стейт (`useState`), передаёт вниз в `ChatSidebar` (для подсветки активного пункта) и в `ChatView` (для загрузки истории). Выбор чата в сайдбаре: `router.push(\`/chat/${id}\`)` + локально `setActiveChatId(id)` (не ждём ре-рендер от Next). «Новый чат» — `router.push("/chat")`, `setActiveChatId(null)`, как раньше бампает `sessionId` для ремаунта `ChatView`.

### Прокси-роуты (повторяют конвенцию `app/api/profile/route.ts`)
- `app/api/chat/route.ts` — `GET`: форвардит `?deleted&limit` в `apiFetch("/chat/?...")`, валидирует ответ `z.array(chatListItemSchema)` (новая схема, см. ниже), возвращает как есть.
- `app/api/chat/[chatId]/route.ts` — `PATCH` (rename: тело `{ title }`, схема `chatRenameFormSchema` — `z.object({ title: z.string().trim().min(1).max(200) })`) и `DELETE` (без тела).
- `app/api/chat/[chatId]/messages/route.ts` — `GET`: форвардит `?before&limit=50` в `apiFetch("/chat/{id}/messages?...")`, валидирует `chatMessagesResponseSchema`.
- `app/api/chat/[chatId]/restore/route.ts` — `POST`, без тела.

Все четыре — `const store = await cookies()` → 401 если нет `TOKEN_COOKIE` → `apiFetch` с `Authorization` → zod на выходе → `NextResponse.json`. Ошибки `403`/`404` от `apiFetch` (через `ApiError`) прокидываются как есть (`{ message: error.message }`, `status: error.status`) — клиент их отдельно интерпретирует (см. «Ошибки»).

**Целевой рефакторинг по ходу дела:** `handleApiError` сейчас продублирован (свой вариант в `profile/route.ts`, инлайн-копия в `chat/message/route.ts`). Выношу в `src/lib/api-route-helpers.ts` (`handleApiError(error, ru, tag)`), все 4 новых хендлера и (заодно, раз он уже правится) `chat/message/route.ts` используют общую версию. `profile/route.ts` и `profile/location/route.ts` не трогаю — не в скоупе этой фичи.

### Схемы (`src/lib/chat-schemas.ts`, дополняем)
```ts
export const chatListItemSchema: z.ZodType<ChatListItemSchema> = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  created_at: z.string(),
  last_message_at: z.string(),
  messages_count: z.number(),
  purge_at: z.string().nullable().optional(),
})

export const chatMessageSchema: z.ZodType<ChatMessageSchema> = z.object({
  id: z.uuid(),
  user_text: z.string().nullable(),
  user_image: z.string().nullable(),
  answer: z.string().nullable(),
  crop: z.string().optional(),
  disease_name: z.string().optional(),
  created_at: z.string(),
})

export const chatMessagesResponseSchema = z.object({
  messages: z.array(chatMessageSchema),
  has_more: z.boolean(),
})

export const chatRenameFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
})
```
(Типы `ChatListItemSchema`/`ChatMessageSchema` импортируются из `src/api/generated/models` — схемы просто описывают форму рантайм-валидации поверх уже сгенерированных типов, как для остальных `*-schemas.ts`.)

### Состояние на клиенте — `use-chat-history.ts` (новый, `src/components/chat/`)
Без React Query/Zustand — паттерн как `sidebar-state.ts`: чистый reducer + хук-обёртка с эффектом.

```ts
interface ChatHistoryState {
  view: "chats" | "trash"
  items: ChatListItemSchema[]
  status: "idle" | "loading" | "ready" | "error"
  renamingId: string | null
  pendingDeleteId: string | null // для confirm-попапа
}
```
- Загрузка: эффект на `view` → `GET /api/chat?deleted=${view === "trash"}`.
- `renameChat(id, title)`: оптимистично меняет `title` в `items`, шлёт `PATCH`, при ошибке — откат + toast (`react-hot-toast`, уже используется в проекте).
- `deleteChat(id)`: оптимистично убирает из `items` (`view === "chats"`), шлёт `DELETE`, при ошибке — возврат в список + toast. Если удалён активный чат (`id === activeChatId`) — `router.push("/chat")`.
- `restoreChat(id)`: убирает из `items` (`view === "trash"`), шлёт `POST .../restore`, при ошибке — возврат + toast.
- Хук не занимается пагинацией списка (см. решение №3) — просто держит до 50 штук как есть.

### Компоненты
- `chat-sidebar.tsx`: между кнопкой «Новый чат» (строка 156-169) и футером (173-184) вместо пустого `<div className="flex-1" />` — новый `<ChatHistoryPanel>` (`src/components/chat/chat-history-panel.tsx`), который рендерится только когда `expanded` (при свёрнутом десктопном сайдбаре, 72px, список не показываем — как в ChatGPT, там тоже коллапс прячет историю). Панель сама скроллится (`overflow-y-auto` на `flex-1`), список дальше не растягивает сайдбар.
- `chat-history-panel.tsx`: рендерит группировку по датам (см. «Данные»), каждый пункт — `chat-history-item.tsx`, внизу — кнопка-тоггл «Корзина» / «← Назад к чатам» (переключает `view` в хуке).
- `chat-history-item.tsx`: строка `title` (или дата-фоллбэк, см. ниже), на `:hover`/`:focus-within` — иконки rename/delete (или restore в режиме корзины) справа. Rename по клику превращает текст в `<input>` того же размера (без сдвига layout). Delete открывает мини-попап подтверждения рядом с иконкой (не модалка на весь экран).

### Данные: группировка и фоллбэк title
Чистая функция `groupChatsByDate(items, now)` в `chat-history-panel.tsx` (или отдельный `.ts` рядом, если понадобится unit-тест) — делит `items` (уже отсортированы бэком «свежие сверху») на корзины `today` / `yesterday` / `last7Days` / остальное без заголовка, сравнивая `last_message_at` с `now` по локальным суткам.

`title === null` → в списке показываем не текст, а дату `last_message_at` (короткий локализованный формат, `Intl.DateTimeFormat` с локалью из `useI18n()`), как договорились — отдельный i18n-ключ "Без названия" не нужен.

### Интеграция с `chat-view.tsx`
- Новый проп `initialChatId?: string`.
- Если он есть — на маунте: `GET /api/chat/[id]/messages?limit=50`, маппинг каждого `ChatMessageSchema` в 1-2 записи фронтендового `ChatMessage` (`user_text`/`user_image` → `role: "user"`, `answer` → `role: "bot"`; строка без `user_text`/`user_image` пропускает user-часть, без `answer` — bot-часть). `chatIdRef.current` сразу ставится в `initialChatId` (не ждём первого ответа).
- `has_more: true` → в `message-list.tsx` добавляется обработчик скролла вверх (`onScroll`, порог ~80px до верха) → повторный запрос `?before=<created_at самого старого уже загруженного>&limit=50`, склейка результатов сверху с сохранением скролл-позиции (стандартный приём: замерить `scrollHeight` до/после вставки, скорректировать `scrollTop`).
- Ошибка загрузки истории (403/404/5xx) — см. «Ошибки».

## Визуальное направление

Без новой палитры/шрифтов — расширяем существующие токены `app/globals.css`:
- Активный пункт списка: фон `--color-accent-soft`, текст `--color-accent-strong`, без иконки-индикатора (фон+цвет текста уже достаточно контрастны, доп. цвет не единственный сигнал — есть и позиция роута).
- Ховер обычного пункта: `--color-surface-muted` (как остальные интерактивные строки в сайдбаре, см. кнопку toggle в `chat-sidebar.tsx:142`).
- Группа-заголовок («Сегодня» / «Вчера» / «7 дней») — `text-xs text-fg-faint`, обычный регистр (не ALL CAPS — в проекте нигде так не делают, и это чисто структурная пометка группы, не декоративный лейбл).
- Иконка delete на ховере — `text-danger` только на самой иконке (не на всей строке), плюс подтверждающий попап текстом — цвет не единственный носитель смысла деструктивного действия.
- Новые иконки в `src/components/ui/icons.tsx` по образцу `createIcon(...)`: `PencilSimpleIcon` (rename), `TrashIcon` (delete), `ArrowCounterClockwiseIcon` (restore) — все из `@phosphor-icons/react`, `weight="regular"`, размер 16-18px как остальные вспомогательные иконки в сайдбаре (ср. `SidebarIcon size={21}` в хедере рельсы).
- Инпут инлайн-редактирования — тот же `font-sans text-sm`, что и текст пункта, `border border-accent rounded-md`, без лишней рамки/тени, чтобы не дёргать высоту строки.

## Моушн

Реюз существующих токенов `src/lib/motion-tokens.ts` (`DURATION.fast/base`, `EASE_OUT`, `SPRING_SNAPPY`) — новых spring/duration констант не заводим.
- Появление/удаление пункта списка (новый чат сверху, удалённый — из списка): `AnimatePresence` + `initial/animate/exit` на `opacity` и небольшой `y: REVEAL_OFFSET`, `transition: { duration: DURATION.fast, ease: EASE_OUT }` — без `layout` на весь список (в нём может быть до 50 элементов, а `motion-patterns` прямо предупреждает не вешать `layout` на большие списки); вместо этого — `mode="popLayout"` на `AnimatePresence`, чтобы соседи плавно занимали место без полного layout-пересчёта.
- Ховер-иконки (rename/delete): не motion, а обычный CSS `opacity`/`transition-opacity duration-150` через Tailwind — как остальные hover-эффекты в сайдбаре (`chat-sidebar.tsx` использует именно CSS-transition, не `motion/react`, для hover-состояний кнопок). Держим единообразие: motion — для входа/выхода/смены контента, CSS-transition — для hover.
- Переключение «чаты» ↔ «корзина»: `AnimatePresence mode="wait"` с кросс-фейдом (`opacity` only, `DURATION.base`) — это подмена контента в одном контейнере, а не два параллельных списка.
- Инлайн-rename (текст → инпут): без анимации по позиции/размеру — просто мгновенная подмена элемента при клике (это action-triggered UI-состояние, не "wow"-момент; лишний моушн здесь только отвлекает от того, что нужно сразу набирать текст).
- Confirm-delete попап: `initial={{ opacity: 0, scale: motionTokens... }}` — сажаем на существующий паттерн, но т.к. в проекте нет готового `motionTokens.scale.press`-объекта (это специфика шаблона `motion-patterns`, не то, что есть в `motion-tokens.ts`), используем то, что реально есть: `initial={{ opacity: 0, y: -4 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition: SPRING_SNAPPY`.
- `prefers-reduced-motion`: в проекте уже есть паттерн проверки (использован в `geo-warning-banner.tsx` по спеке геолокации) — переиспользуем тот же подход, отдельный хук не даблируем.

## Ошибки и крайние случаи

- 401 на любой из 4 новых роутов → как везде: `clearAuthCookies` + 401 JSON; клиент (`use-chat-history` / `chat-view`) на 401 делает `router.push("/login")`.
- 403/404 при открытии `/chat/[chatId]` (чужой чат, удалён навсегда через `RETENTION_DAYS`, или чат из корзины) — `chat-view.tsx` ловит ошибку загрузки сообщений, показывает toast («Чат не найден» / «Нет доступа») и делает `router.push("/chat")`.
- 404 на `restoreChat` (просрочено, `purge_at` в прошлом) — toast с текстом «Чат больше нельзя восстановить», пункт убирается из корзины оптимистично в любом случае (ошибка не откатывает — чат всё равно недоступен).
- Пустой список (`items.length === 0`) в обоих режимах — простой текст-заглушка внутри панели («Пока нет чатов» / «Корзина пуста»), без картинки/иллюстрации (это второстепенная панель сайдбара, не полноценный empty-state экрана).
- Одновременный rename/delete одного и того же пункта (двойной клик) — `renamingId`/`pendingDeleteId` в стейте хука взаимоисключающие, второй клик по другой иконке того же пункта закрывает первый режим.
- Смена языка (`useI18n`) во время открытой инлайн-формы rename — не блокируем, инпут просто останется как есть (крайне редкий кейс, не стоит усложнять).

## i18n

Новый блок `chat.history` одновременно в `ru.json`/`en.json`/`ky.json` (KY — перевод требует вычитки носителем, как и в прошлых фичах):
`today`, `yesterday`, `last7Days`, `trash`, `backToChats`, `rename` (aria-label иконки), `delete` (aria-label), `restore` (aria-label), `confirmDeleteTitle` («Удалить «{title}»?»), `confirmDeleteConfirm`, `confirmDeleteCancel`, `emptyChats`, `emptyTrash`, `errors.notFound`, `errors.noAccess`, `errors.restoreExpired`, `renameInputLabel` (aria-label для `<input>`).

## Тестирование

- Юнит (bun test, чистая логика, без сети — по конвенции `sidebar-state.test.ts`): `groupChatsByDate` (границы «сегодня/вчера/7 дней» по локальной полуночи) и reducer `use-chat-history` (переходы `view`, оптимистичные rename/delete/restore + откат при ошибке).
- `tsc`, `lint`, `build` — чисто.
- Smoke вручную (за пользователем): без токена `GET /api/chat` → 401; открыть `/chat/[валидный-id]` чужого пользователя → 403 + редирект с toast; переименовать/удалить/восстановить в браузере на реальном бэкенде (`http://167.233.203.129`); скролл вверх в длинном чате подгружает более старые сообщения без прыжка скролла.

## Вне скоупа

- Догрузка (`offset`-пагинация) списка чатов сверх первых 50 — см. решение №3.
- Подключение `/upload/image` и `/upload/image/file` (существуют в спеке, не используются нигде во фронтенде) — отдельная, не связанная с историей чатов задача.
- WebSocket-чат (в спеке бэкенда упоминается как альтернативный способ продолжения диалога) — на фронтенде вообще не реализован, остаёмся на REST (`POST /diagnosis/`), как сейчас.
- Массовое удаление/групповые операции над чатами.
- Полноценная страница/раздел «Корзина» — реализуем только тоггл внутри сайдбара (решение №2).
