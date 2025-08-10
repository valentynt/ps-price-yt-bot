// Улучшенный поиск трейлера без YouTube API.
// Ищем по нескольким вариантам запроса, парсим ytInitialData, отдаем первое подходящее видео.
// Приоритет — официальные каналы (PlayStation, IGN и др.).

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36";

const PREFERRED_CHANNELS = [
  "PlayStation",
  "PlayStation Europe",
  "PlayStation Access",
  "PlayStation Arabia",
  "Xbox",            // на случай мультиплатформы — иногда раньше выкладывают
  "IGN",
  "GameSpot",
  "GameTrailers",
  "Official",
];

function buildQueries(title) {
  const t = (title || "").trim();
  return [
    `${t} PS5 official trailer`,
    `${t} official trailer`,
    `${t} PS5 trailer`,
    `${t} launch trailer`,
    `${t} announcement trailer`,
    `${t} trailer`,
  ];
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      Referer: "https://www.youtube.com/",
    },
  });
  if (!res.ok) throw new Error(`YouTube HTTP ${res.status}`);
  return await res.text();
}

function extractInitialData(html) {
  // Ищем кусок "ytInitialData = {...};"
  const m =
    html.match(/ytInitialData"\]\s*=\s*(\{.+?\});<\/script>/s) ||
    html.match(/var\s+ytInitialData\s*=\s*(\{.+?\});/s);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function findFirstVideoFromInitialData(data) {
  try {
    const sections =
      data.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;

    const items = [];
    for (const sec of sections) {
      const is = sec.itemSectionRenderer?.contents || [];
      for (const it of is) {
        if (it.videoRenderer) items.push(it.videoRenderer);
        // иногда ролики лежат глубже
        if (it.richItemRenderer?.content?.videoRenderer) {
          items.push(it.richItemRenderer.content.videoRenderer);
        }
      }
    }
    if (!items.length) return null;

    // Попробуем сначала приоритетные каналы
    const prefer = items.find((vr) => {
      const owner =
        vr.ownerText?.runs?.[0]?.text ||
        vr.longBylineText?.runs?.[0]?.text ||
        "";
      return PREFERRED_CHANNELS.some((c) =>
        owner.toLowerCase().includes(c.toLowerCase())
      );
    });

    const chosen = prefer || items[0];
    const videoId = chosen.videoId;
    const title = chosen.title?.runs?.[0]?.text || "";
    const owner =
      chosen.ownerText?.runs?.[0]?.text ||
      chosen.longBylineText?.runs?.[0]?.text ||
      "";
    if (!videoId) return null;

    return {
      id: videoId,
      title,
      channel: owner,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch {
    return null;
  }
}

export async function getYouTubeTrailer(gameTitle) {
  const queries = buildQueries(gameTitle);
  for (const q of queries) {
    try {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        q
      )}&hl=en`;
      const html = await fetchHtml(url);
      const data = extractInitialData(html);
      if (!data) continue;
      const video = findFirstVideoFromInitialData(data);
      if (video) return video;
    } catch {
      // пробуем следующий запрос
    }
  }
  return null;
}
