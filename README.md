# Telegram Bot: PS Store Price + YouTube Trailer (free)

Команда `/game <название>`:
- находит трейлер на YouTube без платного API (парсинг результатов);
- получает цену из PlayStation Store через Playwright.

## Запуск локально
1. `cp .env.example .env` и заполни переменные (`TELEGRAM_TOKEN`, `PS_LOCALE`).
2. `npm i`
3. `npm run dev` (или `npm start`).

В Telegram: `/game Ghost of Tsushima`

## Примечания
- Локаль по умолчанию — `uk-ua` (гривна, Украина).
- Разметка PS Store и страницы YouTube могут меняться. Если цена/видео не находятся — обнови селекторы в `psstore.js`/`youtube.js`.
- Для ускорения можно держать один Playwright-браузер открытым между запросами.