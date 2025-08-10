// import "dotenv/config";
// import { Telegraf } from "telegraf";
// import { getYouTubeTrailer } from "./services/youtube.js";
// import { getPSPrice } from "./services/psstore.js";

// const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
// const PS_LOCALE = process.env.PS_LOCALE || "uk-ua";
// if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_TOKEN in .env");

// const bot = new Telegraf(BOT_TOKEN);

// // --- helpers ---
// const htmlEscape = (s = "") =>
//   String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#39;");

// const normalizeGameName = (s = "") => s.trim().replace(/\s+/g, " ");
// const toTitleCase = (s = "") =>
//   s
//     .toLowerCase()
//     .split(" ")
//     .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
//     .join(" ");

// // --- commands ---
// bot.start((ctx) =>
//   ctx.reply(
//     "Привет! Пиши: game <название игры> или /game <название игры> (ищу PS5 в украинском PS Store)."
//   )
// );

// // реагируем и на "/game ..." и на "game ..."
// bot.hears(/^\/?game\b/i, async (ctx) => {
//   const raw = ctx.message.text.replace(/^\/?game\s*/i, "");
//   const query = normalizeGameName(raw);
//   if (!query)
//     return ctx.reply("⚠ Пожалуйста, укажи название игры после команды game");

//   const displayName = toTitleCase(query);
//   const searchUrl = `https://store.playstation.com/${PS_LOCALE}/search/${encodeURIComponent(
//     query
//   )}`;
//   console.log(`🔍 PS Store search: ${searchUrl}`);

//   await ctx.reply(
//     `Ищу: ${htmlEscape(
//       displayName
//     )} …\n🔍 <a href="${searchUrl}">Ссылка на поиск в PS Store</a>`,
//     { parse_mode: "HTML" }
//   );

//   try {
//     // 1) Цена / название из PS Store (только PS5, первые 10 карточек)
//     const priceInfo = await getPSPrice(query, PS_LOCALE).catch(() => null);
//     if (priceInfo?.url) console.log(`🛒 Product page used: ${priceInfo.url}`);

//     // 2) Трейлер ищем по названию из стора (лучший матч)
//     const trailerSearchName = priceInfo?.title || displayName;
//     console.log(`🎬 YouTube trailer search: ${trailerSearchName}`);
//     const yt = await getYouTubeTrailer(trailerSearchName).catch(() => null);

//     // 3) Сообщение с ценой (HTML + превью PS Store оставляем включённым)
//     const lines = [];
//     lines.push(`🎮 <b>${htmlEscape(priceInfo?.title || displayName)}</b>`);

//     if (priceInfo) {
//       if (priceInfo.notFoundForPS5) {
//         lines.push("💽 Для PS5 нет игры в этом регионе.");
//       } else if (priceInfo.price) {
//         lines.push(
//           `💰 Цена в PS Store (${htmlEscape(PS_LOCALE)}): ${htmlEscape(
//             priceInfo.price
//           )}`
//         );
//         if (priceInfo.url) lines.push(`🛒 ${htmlEscape(priceInfo.url)}`);
//       } else {
//         lines.push("💰 Не удалось надёжно определить цену.");
//       }
//     } else {
//       lines.push("💰 Не удалось получить цену из PS Store.");
//     }

//     await ctx.replyWithHTML(lines.join("\n"), {
//       disable_web_page_preview: false,
//     });

//     // 4) Отдельным сообщением — трейлер с кликабельным превью и кнопкой Play
//     if (yt) {
//       // Важно: отправляем чистую ссылку без markdown/HTML — так Telegram подтянет превью с кнопкой.
//       await ctx.reply(`🎬 ${yt.title}\n${yt.url}`, {
//         disable_web_page_preview: false,
//       });
//     } else {
//       const q = encodeURIComponent(`${trailerSearchName} PS5 trailer`);
//       const searchLink = `https://www.youtube.com/results?search_query=${q}`;
//       await ctx.reply(`🎬 Трейлер: не найден автоматически.\n${searchLink}`, {
//         disable_web_page_preview: false,
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     await ctx.reply("❌ Произошла ошибка при обработке запроса.");
//   }
// });

// // telegraf / process errors
// bot.catch((err, ctx) => {
//   console.error(
//     `Telegraf error for update ${ctx?.update?.update_id ?? "-"}:`,
//     err
//   );
// });
// process.on("unhandledRejection", (err) =>
//   console.error("unhandledRejection:", err)
// );
// process.on("uncaughtException", (err) =>
//   console.error("uncaughtException:", err)
// );

// // run bot
// (async () => {
//   try {
//     await bot.launch({
//       dropPendingUpdates: true,
//       allowedUpdates: ["message"],
//       polling: { timeout: 30 },
//     });
//     console.log("Bot started");
//   } catch (e) {
//     console.error("Bot launch failed:", e);
//   }
// })();

// process.once("SIGINT", () => process.exit(0));
// process.once("SIGTERM", () => process.exit(0));



// import "dotenv/config";
// import { Telegraf } from "telegraf";
// import { getYouTubeTrailer } from "./services/youtube.js";
// import { getPSPrice } from "./services/psstore.js";

// const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
// const PS_LOCALE = process.env.PS_LOCALE || "uk-ua";
// if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_TOKEN in .env");

// const bot = new Telegraf(BOT_TOKEN);

// // helpers
// const htmlEscape = (s = "") =>
//   String(s)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#39;");

// const normalizeGameName = (s = "") => s.trim().replace(/\s+/g, " ");
// const toTitleCase = (s = "") =>
//   s
//     .toLowerCase()
//     .split(" ")
//     .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
//     .join(" ");

// // /start
// bot.start((ctx) =>
//   ctx.reply(
//     "Привет! Пиши: game <название игры> или /game <название игры> (ищу PS5 в украинском PS Store)."
//   )
// );

// // реагируем и на "/game ..." и на "game ..."
// bot.hears(/^\/?game\b/i, async (ctx) => {
//   const raw = ctx.message.text.replace(/^\/?game\s*/i, "");
//   const query = normalizeGameName(raw);
//   if (!query)
//     return ctx.reply("⚠ Пожалуйста, укажи название игры после команды game");

//   const displayName = toTitleCase(query);
//   const searchUrl = `https://store.playstation.com/${PS_LOCALE}/search/${encodeURIComponent(
//     query
//   )}`;
//   console.log(`🔍 PS Store search: ${searchUrl}`);

//   await ctx.reply(
//     `Ищу: ${htmlEscape(
//       displayName
//     )} …\n🔍 <a href="${searchUrl}">Ссылка на поиск в PS Store</a>`,
//     { parse_mode: "HTML" }
//   );

//   try {
//     // 1) Цена / название из PS Store (только PS5, до 10 карточек)
//     const priceInfo = await getPSPrice(query, PS_LOCALE).catch(() => null);
//     if (priceInfo?.url) console.log(`🛒 Product page used: ${priceInfo.url}`);

//     // 2) Трейлер ищем по имени из стора (лучше матч)
//     const trailerSearchName = priceInfo?.title || displayName;
//     console.log(`🎬 YouTube trailer search: ${trailerSearchName}`);
//     const yt = await getYouTubeTrailer(trailerSearchName).catch(() => null);

//     // 3) Сообщение с ценой
//     const lines = [];
//     lines.push(`🎮 <b>${htmlEscape(priceInfo?.title || displayName)}</b>`);

//     if (priceInfo) {
//       if (priceInfo.notFoundForPS5) {
//         lines.push("💽 Для PS5 нет игры в этом регионе.");
//       } else if (priceInfo.price) {
//         lines.push(
//           `💰 Цена в PS Store (${htmlEscape(PS_LOCALE)}): ${htmlEscape(
//             priceInfo.price
//           )}`
//         );
//         if (priceInfo.url) lines.push(`🛒 ${htmlEscape(priceInfo.url)}`);
//       } else {
//         lines.push("💰 Не удалось надёжно определить цену.");
//       }
//     } else {
//       lines.push("💰 Не удалось получить цену из PS Store.");
//     }

//     await ctx.replyWithHTML(lines.join("\n"), {
//       disable_web_page_preview: false,
//     });

//     // 4) Отдельным сообщением — трейлер (линк, чтобы Телеграм подтянул превью с кнопкой Play)
//     if (yt) {
//       await ctx.reply(`🎬 ${yt.title}\n${yt.url}`, {
//         disable_web_page_preview: false,
//       });
//     } else {
//       const q = encodeURIComponent(`${trailerSearchName} PS5 trailer`);
//       const searchLink = `https://www.youtube.com/results?search_query=${q}`;
//       await ctx.reply(`🎬 Трейлер: не найден автоматически.\n${searchLink}`, {
//         disable_web_page_preview: false,
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     await ctx.reply("❌ Произошла ошибка при обработке запроса.");
//   }
// });

// // errors & run
// bot.catch((err, ctx) => {
//   console.error(
//     `Telegraf error for update ${ctx?.update?.update_id ?? "-"}:`,
//     err
//   );
// });
// process.on("unhandledRejection", (err) =>
//   console.error("unhandledRejection:", err)
// );
// process.on("uncaughtException", (err) =>
//   console.error("uncaughtException:", err)
// );

// (async () => {
//   try {
//     await bot.launch({
//       dropPendingUpdates: true,
//       allowedUpdates: ["message"],
//       polling: { timeout: 30 },
//     });
//     console.log("Bot started");
//   } catch (e) {
//     console.error("Bot launch failed:", e);
//   }
// })();

// process.once("SIGINT", () => process.exit(0));
// process.once("SIGTERM", () => process.exit(0));



import "dotenv/config";
import { Telegraf } from "telegraf";
import { getYouTubeTrailer } from "./services/youtube.js";

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const PS_LOCALE = process.env.PS_LOCALE || "uk-ua";
if (!BOT_TOKEN) throw new Error("Missing TELEGRAM_TOKEN in .env");

const bot = new Telegraf(BOT_TOKEN);

// helpers
const htmlEscape = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeGameName = (s = "") => s.trim().replace(/\s+/g, " ");
const toTitleCase = (s = "") =>
  s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

function buildStoreSearchLink(q) {
  return `https://store.playstation.com/${PS_LOCALE}/search/${encodeURIComponent(
    q
  )}`;
}

// /start
bot.start((ctx) =>
  ctx.reply(
    "Привет! Пиши: game <название игры> или /game <название игры>.\nЯ пришлю ссылку на поиск в PS Store и трейлер с YouTube."
  )
);

// реагируем и на "/game ..." и на "game ..."
bot.hears(/^\/?game\b/i, async (ctx) => {
  const raw = ctx.message.text.replace(/^\/?game\s*/i, "");
  const query = normalizeGameName(raw);
  if (!query)
    return ctx.reply("⚠ Пожалуйста, укажи название игры после команды game");

  const displayName = toTitleCase(query);
  const searchUrl = buildStoreSearchLink(query);

  // шапка: только ссылка на поиск
  await ctx.reply(
    `Ищу: ${htmlEscape(
      displayName
    )} …\n🔎 <a href="${searchUrl}">Ссылка на поиск в PS Store</a>`,
    { parse_mode: "HTML", disable_web_page_preview: true }
  );

  try {
    // трейлер: пробуем более «игровой» запрос, затем запасной
    const primaryQuery = `${displayName} PS5 official trailer`;
    let yt = await getYouTubeTrailer(primaryQuery).catch(() => null);
    if (!yt) {
      const fallbackQuery = `${displayName} official trailer game`;
      yt = await getYouTubeTrailer(fallbackQuery).catch(() => null);
    }

    if (yt) {
      // отдельным сообщением — ссылка, чтобы Telegram показал превью с кнопкой Play
      await ctx.reply(`🎬 ${yt.title}\n${yt.url}`, {
        disable_web_page_preview: false,
      });
    } else {
      const q = encodeURIComponent(`${displayName} PS5 trailer`);
      const ytSearch = `https://www.youtube.com/results?search_query=${q}`;
      await ctx.reply(`🎬 Трейлер: не найден автоматически.\n${ytSearch}`, {
        disable_web_page_preview: false,
      });
    }
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Произошла ошибка при обработке запроса.");
  }
});

// errors & run
bot.catch((err, ctx) => {
  console.error(
    `Telegraf error for update ${ctx?.update?.update_id ?? "-"}:`,
    err
  );
});
process.on("unhandledRejection", (err) =>
  console.error("unhandledRejection:", err)
);
process.on("uncaughtException", (err) =>
  console.error("uncaughtException:", err)
);

(async () => {
  try {
    await bot.launch({
      dropPendingUpdates: true,
      allowedUpdates: ["message"],
      polling: { timeout: 30 },
    });
    console.log("Bot started");
  } catch (e) {
    console.error("Bot launch failed:", e);
  }
})();

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));
