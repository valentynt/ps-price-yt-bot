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
