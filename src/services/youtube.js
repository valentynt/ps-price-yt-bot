import { chromium } from "@playwright/test";

const HEADLESS = process.env.DEBUG_YT ? false : true;
const SLOWMO   = Number(process.env.SLOWMO_MS || 0);

// Возвращает { title, url } или null
export async function getYouTubeTrailer(query) {
  const browser = await chromium.launch({ headless: HEADLESS, slowMo: SLOWMO });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query
    )}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // лёгкий скролл, чтобы прогрузились карточки
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(300);

    const items = await page.evaluate(() => {
      const results = [];
      const anchors = Array.from(
        document.querySelectorAll('a#video-title[href^="/watch"]')
      ).slice(0, 20);

      for (const a of anchors) {
        const title = (a.textContent || "").trim();
        const href = a.getAttribute("href") || "";
        const url = href ? new URL(href, "https://www.youtube.com").toString() : null;

        // канал рядом с карточкой
        const root = a.closest("ytd-video-renderer");
        const channel =
          (root &&
            root.querySelector("#channel-name a") &&
            root.querySelector("#channel-name a").textContent.trim()) ||
          "";

        if (url) results.push({ title, url, channel });
      }
      return results;
    });

    if (!items.length) return null;

    // простые фильтры: включаем слово trailer, исключаем movie/film, предпочитаем оф. каналы
    const PREFERRED = /playstation|xbox|nintendo|ubisoft|ea|capcom|bandai|activision|sega|bethesda|square|sony|warner/i;

    const scored = items.map((it) => {
      const t = it.title.toLowerCase();
      let score = 0;
      if (/trailer|launch|gameplay/.test(t)) score += 2;
      if (/ps5|playstation/.test(t)) score += 1;
      if (/movie|film|fan\s*made/.test(t)) score -= 2;
      if (PREFERRED.test(it.channel)) score += 2;
      return { ...it, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    return best?.url ? { title: best.title, url: best.url } : null;
  } catch {
    return null;
  } finally {
    await browser.close();
  }
}
