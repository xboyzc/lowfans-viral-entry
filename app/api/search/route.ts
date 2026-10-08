import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 30;
const Input = z.object({ industry: z.string().min(1).max(80), source: z.enum(["ocean", "hotspot"]), days: z.number().int().min(1).max(90), maxFollowers: z.number().int().min(100).max(1000000), duration: z.string().optional() });

type SearchItem = { title: string; url: string; description: string; publishedAt: string };

function decodeXML(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();
}

async function publicSearch(query: string): Promise<SearchItem[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 lowfans-radar/1.0" }, next: { revalidate: 1800 } });
  if (!res.ok) return [];
  const html = await res.text();
  return [...html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].slice(0, 10).map((match) => {
    const rawURL = decodeXML(match[1]);
    let target = rawURL.startsWith("//") ? `https:${rawURL}` : rawURL;
    try { const parsed = new URL(target); target = parsed.searchParams.get("uddg") || target; } catch {}
    const tail = html.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 3000);
    const snippet = tail.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/)?.[1] || "";
    return { title: decodeXML(match[2]), url: target, description: decodeXML(snippet), publishedAt: "" };
  });
}

function fallbackSearchPages(industry: string): SearchItem[] {
  const terms = [`${industry}低粉爆款`, `${industry}高赞视频`, `${industry}老板口播`, `${industry}实体店引流`];
  return terms.flatMap((term) => [
    { title: `抖音搜索：${term}`, url: `https://www.douyin.com/search/${encodeURIComponent(term)}`, description: `打开抖音的「${term}」搜索结果，请优先查看低粉且高赞的近期作品。`, publishedAt: "" },
    { title: `小红书搜索：${term}`, url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(term)}`, description: `打开小红书的「${term}」公开搜索页。`, publishedAt: "" },
  ]);
}

function parseCount(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(`(?:${label})[\\s：:]*(\\d+(?:\\.\\d+)?)\\s*(万|w|W|千|k|K)?`, "i");
    const match = text.match(pattern);
    if (!match) continue;
    const n = Number(match[1]);
    const unit = match[2]?.toLowerCase();
    return Math.round(n * (unit === "万" || unit === "w" ? 10000 : unit === "千" || unit === "k" ? 1000 : 1));
  }
  return null;
}

function platformFor(url: string) {
  if (/douyin\.com/.test(url)) return "抖音";
  if (/xiaohongshu\.com|xhslink\.com/.test(url)) return "小红书";
  if (/kuaishou\.com/.test(url)) return "快手";
  if (/bilibili\.com/.test(url)) return "B站";
  return "公开网页";
}

function cleanTitle(title: string) {
  return title.replace(/[-_|]抖音.*$/i, "").replace(/[-_|]小红书.*$/i, "").replace(/\s+/g, " ").trim();
}

function authorFrom(text: string) {
  return text.match(/(?:@丨作者[:：]?)[\s]*([\u4e00-\u9fa5A-Za-z0-9_·-]{2,20})/)?.[1] || "未知作者";
}

function dateWithinDays(raw: string, days: number) {
  if (!raw) return true;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return true;
  return Date.now() - date.getTime() <= days * 86400000;
}

export async function POST(req: Request) {
  try {
    const input = Input.parse(await req.json());
    const quoted = `"${input.industry}"`;
    const sourceWord = input.source === "ocean" ? "巨量算数" : "热点宝";
    const queries = [`site:douyin.com/video ${quoted} ${sourceWord} 低粉爆款`, `site:douyin.com/video ${quoted} 粉丝 获赞`, `site:douyin.com/video ${quoted} 低粉 高赞`];
    const groups = await Promise.all(queries.map(publicSearch));
    const indexed = groups.flat();
    const unique = indexed.filter((item, index, all) => /douyin\.com\/video\/\d+/.test(item.url) && all.findIndex(x => x.url === item.url) === index);
    const keywords = input.industry.toLowerCase().split(/[\s,，/]+/).filter(Boolean);
    const videos = unique.map((item) => {
      const allText = `${item.title} ${item.description}`;
      const followers = parseCount(allText, ["粉丝", "fans?", "followers?"]);
      const likes = parseCount(allText, ["点赞", "获赞", "赞", "likes?"]);
      const comments = parseCount(allText, ["评论", "comments?"]);
      const verified = followers !== null && likes !== null;
      const ratio = followers && likes ? likes / followers : 0;
      const relevance = keywords.reduce((score, word) => score + (allText.toLowerCase().includes(word) ? 1 : 0), 0);
      const withinRange = dateWithinDays(item.publishedAt, input.days);
      const underLimit = followers === null || followers <= input.maxFollowers;
      const reason = verified
        ? `赞粉比 ${ratio.toFixed(1)}${withinRange ? " · 时间符合" : " · 超出时间范围"}`
        : `公开索引命中 · ${followers === null ? "粉丝待核验" : "互动待核验"}`;
      return {
        id: createHash("sha1").update(item.url).digest("hex").slice(0, 12), title: cleanTitle(item.title),
        author: authorFrom(allText), platform: platformFor(item.url), url: item.url,
        followers, likes, comments, publishedAt: item.publishedAt || null,
        hook: item.description.slice(0, 100), reason, verified,
        _score: relevance * 10 + (verified ? 8 : 0) + Math.min(ratio, 10) + (withinRange ? 3 : 0) + (underLimit ? 2 : -20),
      };
    }).filter(v => v._score > 0).sort((a, b) => b._score - a._score).slice(0, 12).map(({ _score, ...video }) => video);
    const officialUrl = input.source === "ocean" ? "https://trendinsight.oceanengine.com/" : `https://www.douyin.com/search/${encodeURIComponent("热点宝")}`;
    return NextResponse.json({ videos, officialUrl }, { headers: { "Cache-Control": "s-maxage=1800, stale-while-revalidate=86400", "X-Search-Engine": "direct-video-only" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "免费搜索服务暂时不可用，请稍后重试。" }, { status: 500 });
  }
}
