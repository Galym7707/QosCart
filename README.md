# QosCart — AI Collective Buying Agent

QosCart — AI-агент коллективных покупок: пользователь описывает, что ищет, агент находит реальные товары, формирует группу из верифицированных участников и разблокирует групповую цену (скидка до 22%).

Ядро: 5 экранов — Welcome → Онбординг (OTP + Trust Passport) → Лента → AI Buyer Chat → Карточка товара (ladder, таймер, join, провал).

---

## Быстрый старт

### а) Установить зависимости

```bash
npm install
```

### б) Создать базу данных

1. Создать новый проект на [supabase.com](https://supabase.com) (регион EU).
2. Открыть **SQL Editor** → вставить содержимое `scripts/schema.sql` → нажать **Run**.
3. В Table Editor должны появиться 4 таблицы: `users`, `products`, `pools`, `pool_members`.
4. Включить realtime: **Database → Publications → supabase_realtime** → найти таблицу `pools` → включить. Если строка `alter publication supabase_realtime add table pools;` не сработала в SQL Editor — включите вручную через этот интерфейс.

### в) Переменные окружения

Скопировать `Settings → API` из Supabase в `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_KEY
GROQ_API_KEY=YOUR_GROQ_KEY
SERPAPI_KEY=YOUR_SERPAPI_KEY
USD_TO_KZT=520
DEMO_OTP=000000
```

### г) Ключ SerpAPI

Зарегистрироваться на [serpapi.com](https://serpapi.com) (бесплатно, 250 поисков/месяц) → API Key → вставить в `SERPAPI_KEY`.

### д) Ключ Groq

Зайти на [console.groq.com](https://console.groq.com) → Create API Key → вставить в `GROQ_API_KEY`.

### е) Заполнить каталог

```bash
npm run seed
```

Выполняет ~24 запроса к SerpAPI (Google Shopping) — появятся 200+ товаров и 4 демо-пула. В консоли: построчно `category / "query": +N`, итог `Products seeded: ...`, `Pools seeded: 4`.

### ж) Запустить приложение

```bash
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

---

## Демо-сценарий для сцены (5 минут)

Код подтверждения OTP в демо: **000000**

1. Регистрация по номеру → реальный SMS-код на телефон команды → Trust Passport (verified badge).
2. Чат: «Найди беспроводные наушники до 25 000 KZT для учёбы» → агент: live-поиск → 3 карточки с source и last_checked_at.
3. Карточка: retail vs group price, ladder 1/5/10/20, прогресс 7/10, таймер TTL.
4. Два окна рядом: Join на экране А → у экрана Б прогресс-бар двигается в ту же секунду (Supabase Realtime) → 8/10.
5. Контроль реализма: пул с истёкшим TTL → «Группа не собралась: возврат / доплата до тира 5 / +2 часа за шеринг».
6. Checkout preview: «human confirmation required» — агент не покупает сам.
7. Финал: Admin Ingestion Dashboard — статусы источников, последние fetches.

---

## Тесты

```bash
npm test
```

23 юнит-теста логики (`tests/`): currency, ladder, scoring, joinRules, normalize, llm-fallback. Все тесты — чистые функции без сети.

---

## Деплой

```bash
npx vercel --prod
```

После деплоя перенести все переменные из `.env.local` в **Vercel Dashboard → Settings → Environment Variables**.

---

## Если что-то падает

**SerpAPI лимит 50 req/час** → подождать или работать с уже засеянной базой (seed уже завершён — каталог в Supabase живёт независимо).

**Realtime молчит** → проверить, что таблица `pools` включена в Publication `supabase_realtime` (Supabase Dashboard → Database → Publications); либо раскомментировать поллинг в `src/app/product/[id]/page.tsx` (добавить `setInterval`-перезапрос пула раз в 1500 мс).

**LLM недоступен** → агент автоматически переходит на regex-парсинг интента и шаблонные объяснения (`fallbackParse` + `templateExplanation` в `src/lib/llm.ts`) — это штатный сценарий, демо продолжается.

---

## Опционально: реальный SMS (только если ядро готово)

Task 13 из плана (`docs/superpowers/plans/2026-06-11-qoscart-mvp.md`):

1. [twilio.com](https://twilio.com) → Trial-аккаунт (без карты) → Console → Verify → Create Service → скопировать SID в `.env.local` (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID`).
2. `npm i twilio`.
3. Создать роуты `src/app/api/otp/send/route.ts` и `src/app/api/otp/check/route.ts` (детали — в плане Task 13).
4. В онбординге: если `TWILIO_*` заданы — слать реальный код, иначе фолбэк на `DEMO_OTP` (код `000000` обязан остаться рабочим!).

**Внимание:** у Twilio Trial максимум 5 верифицированных номеров. Верифицировать телефоны всех участников демо заранее в Console → Verified Caller IDs.
