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
5. RLS на таблицах оставить ВЫКЛЮЧЕННЫМ (демо; онбординг пишет в users anon-ключом).

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

## Демо-сценарий для сцены (5 минут) — v1, устарел: актуальный сценарий см. в разделе «v2 (post-hackathon)» ниже

Код подтверждения OTP в демо: **000000**

1. Регистрация по номеру → реальный SMS-код на телефон команды → Trust Passport (verified badge).
2. Чат: «Найди беспроводные наушники до 25 000 KZT для учёбы» → агент ищет в своём каталоге и дозагружает live из SerpAPI, если результатов мало → 3 карточки с source и last_checked_at.
3. Карточка: retail vs group price, ladder 1/5/10/20, прогресс 7/10, таймер TTL.
4. Два окна рядом: Join на экране А → у экрана Б прогресс-бар двигается в ту же секунду (Supabase Realtime) → 8/10.
5. Контроль реализма: пул с истёкшим TTL → «Группа не собралась: возврат / доплата до тира 5 / +2 часа за шеринг».
6. Открыть пул 9/10 → второй join → 10/10, статус unlocked, цена Main group активна.
7. Открыть истёкший пул → экран провала: возврат / доплата до тира 5 / +2 часа за шеринг.

---

## Тесты

```bash
npm test
```

54 юнит-теста логики (`tests/`): currency, ladder, scoring (v2, 8 факторов), joinRules, normalize, llm-fallback, categories, filters, sse, social, voice. Все тесты — чистые функции без сети.

---

## Деплой

```bash
npx vercel --prod
```

После деплоя перенести все переменные из `.env.local` в **Vercel Dashboard → Settings → Environment Variables**.

---

## Если что-то падает

**SerpAPI лимит 50 req/час** → подождать или работать с уже засеянной базой (seed уже завершён — каталог в Supabase живёт независимо).

**Realtime молчит** → проверить, что таблица `pools` включена в Publication `supabase_realtime` (Supabase Dashboard → Database → Publications); либо раскомментировать поллинг в `src/app/(shop)/product/[id]/page.tsx` (добавить `setInterval`-перезапрос пула раз в 1500 мс).

**LLM недоступен** → агент автоматически переходит на regex-парсинг интента и шаблонные объяснения (`fallbackParse` + `templateExplanation` в `src/lib/llm.ts`) — это штатный сценарий, демо продолжается.

---

## Опционально: реальный SMS (только если ядро готово)

Task 13 из плана (`docs/superpowers/plans/2026-06-11-qoscart-mvp.md`):

1. [twilio.com](https://twilio.com) → Trial-аккаунт (без карты) → Console → Verify → Create Service → скопировать SID в `.env.local` (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID`).
2. `npm i twilio`.
3. Создать роуты `src/app/api/otp/send/route.ts` и `src/app/api/otp/check/route.ts` (детали — в плане Task 13).
4. В онбординге: если `TWILIO_*` заданы — слать реальный код, иначе фолбэк на `DEMO_OTP` (код `000000` обязан остаться рабочим!).

**Внимание:** у Twilio Trial максимум 5 верифицированных номеров. Верифицировать телефоны всех участников демо заранее в Console → Verified Caller IDs.

## v2 (post-hackathon)

Новое: двухуровневый каталог 12×36 (≈3800 реальных товаров через SerpAPI), сортировки/фильтры/лайки/поиск
с URL-state, адаптивный marketplace-layout (mobile/tablet/desktop, агент-док справа), SSE-агент с живыми
шагами и why-panel (8 факторов = 100), социальный граф (друзья по имени/телефону, invite-ссылки,
друзья в пулах), голосовой ввод/вывод (Web Speech API, Chrome).

Setup v2:
1. `npm run migrate -- scripts/migrations/002_v2.sql`
2. `npm run seed:v2`   # резюмируемый; ~72 SerpAPI-запроса, журнал scripts/.seed-journal.json
3. `npm run dev`

Демо-сценарий (5 мин):
1. Onboarding с OTP → лента: грид, фильтры (Аудио → Наушники TWS), сортировка «Выгода группы», лайк.
2. Десктоп: агент-док справа → голосом «наушники до 20 000 тенге» → живые шаги → «Почему это вам».
3. Профиль → «Найти друзей» → карточка с пулом: аватары друзей → join → копия invite-ссылки.
4. Второе окно (инкогнито): onboarding → invite-ссылка → join → realtime-прогресс в первом окне,
   взаимная дружба (source='invite'), nudge «друг уже в группе» в ленте.
5. Показ провала: карточка с истёкшим пулом → варианты (возврат/доплата/+2 часа).
