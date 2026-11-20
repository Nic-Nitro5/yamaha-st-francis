// Imports boat-sales listings (and their photos) from the current Squarespace site.
//
//   node scripts/import-listings.mjs
//
// Writes data/listings.json and downloads images to public/images/stock/<slug>/.
// Re-run whenever stock changes on the old site. Hand edits belong in OVERRIDES below,
// so they survive a re-import.

import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = "https://www.stfrancisbayyamaha.com/boat-sales?format=json";
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMG_DIR = join(ROOT, "public", "images", "stock");
const DATA_FILE = join(ROOT, "data", "listings.json");
const SOLD_TO_KEEP = 12; // most recent sold listings shown as a "recently sold" strip

// Fixes for known data problems on the old site, matched against the original product title.
const OVERRIDES = [
  // Duplicated product whose title was never updated from "Mystique 212 (Copy)".
  { match: (it) => /\(copy\)/i.test(it.title), title: "15.6 Dolphin Ski Boat with 2 x New Yamaha 40hp" },
  // Title says 2027; every photo filename says 2007.
  { match: (it) => /VX1100 Jetski for Sale - 2027/i.test(it.title), title: "2007 Yamaha VX1100" },
  { match: (it) => /le road golf carts/i.test(it.title), title: "Le Road L2 Golf Carts (MY2025/26)" },
  {
    match: (it) => /2025 Yamaha Waverunners and Jetboats/i.test(it.title),
    title: "2025 Yamaha WaveRunner & Jetboat Range",
    category: "waverunners",
  },
];

const BOAT_WORDS =
  /boat|rib\b|cat\b|duck|panache|explorer|seacat|mystique|dolphin|infanta|spitfire|gecat|g-cat|glastron|kingfish|bandit|fazer|viking|grunter|sportsman|skipper|ski-? ?vee|adventure|x-fire|ocean runner|benguela|supreme craft|indigo|bigfoot|aquarius|four sport|hot stuff|xtaski/i;

function category(title) {
  const t = title.toLowerCase();
  if (/golf cart/.test(t)) return "golf-carts";
  if (/jet ?boat|sx ?220|212x|222sd|242 limited/.test(t)) return "jetboats";
  if (/\b(vx|fx|gp) ?\d|jet ?blaster|jetski|waverunner|ex sport|fzs|fzr|seadoo|sea-doo/.test(t)) return "waverunners";
  if (!BOAT_WORDS.test(t) && /\d+ ?hp|stroke|shaft/.test(t)) return "outboards";
  return "boats";
}

const decode = (s) =>
  s
    .replace(/[​-‍﻿]/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

function htmlToBlocks(html = "") {
  const text = decode(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h\d|li|div)>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, ""),
  );
  const lines = text.split("\n").map((l) => l.replace(/\s+/g, " ").trim());
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => para.length && (blocks.push({ type: "p", text: para.join(" ") }), (para = []));
  const flushList = () => list.length && (blocks.push({ type: "ul", items: list }), (list = []));
  for (const l of lines) {
    if (!l) {
      flushPara();
      flushList();
    } else if (/^[•\-*✓✔▪●]\s*/.test(l)) {
      flushPara();
      list.push(l.replace(/^[•\-*✓✔▪●]\s*/, ""));
    } else {
      flushList();
      para.push(l);
    }
  }
  flushPara();
  flushList();
  // The new listing page shows price and contact details in its own panel, so drop the
  // boilerplate lines (phone numbers, emails, links, "Was/Now/Save", "contact us").
  const boilerplate =
    /\b0\d{2}[ -]?\d{3}[ -]?\d{4}\b|@stfrancisyamaha|https?:\/\/|www\.|^\W*(was|now|save|price)\b|contact|more info|^R\s?[\d\s,.]+!*$/i;
  const kept = blocks.filter((b) => b.type !== "p" || (!boilerplate.test(b.text) && /[a-z0-9]/i.test(b.text)));
  // Bullets separated by blank lines arrive as many one-item lists; merge neighbours.
  return kept.reduce((acc, b) => {
    const prev = acc[acc.length - 1];
    if (b.type === "ul" && prev?.type === "ul") prev.items.push(...b.items);
    else acc.push(b);
    return acc;
  }, []);
}

// A rand amount: R1,950,000 / R 1 950 000 / R400000. Never the "r 190" inside "Explorer 190".
const RAND = /(?<![a-z])R\s?(\d{1,3}(?:[ ,]\d{3})+|\d{4,})(?:\.\d\d)?/i;
const money = (s) => Number(String(s).replace(/[^\d.]/g, "")) || null;

function prices(it, plain) {
  const listed = Number(it.variants?.[0]?.priceMoney?.value || 0) || null;
  const now = plain.match(new RegExp(String.raw`now:?\s*` + RAND.source, "i"));
  const was = plain.match(new RegExp(String.raw`was:?\s*` + RAND.source, "i"));
  const inTitle = it.title.match(RAND);
  const inText = plain.match(RAND);
  const price =
    (now && money(now[1])) || listed || (inTitle && money(inTitle[1])) || (inText && money(inText[1])) || null;
  const wasPrice = was ? money(was[1]) : null;
  return { price, wasPrice: wasPrice && price && wasPrice > price ? wasPrice : null };
}

function cleanTitle(t) {
  let s = decode(t)
    .replace(/^(new )?boat for sale\s*\|\s*/i, "")
    .replace(/^for sale\s*\|\s*/i, "")
    .replace(/^sold!*\s*/i, "")
    .replace(new RegExp(String.raw`[-–|]?\s*` + RAND.source + ".*$", "i"), "")
    .replace(/[-–]\s*sold.*$/i, "")
    .replace(/\s*\bsold( out)?!*$/i, "")
    .replace(/\s*for sale!*.*$/i, "")
    .replace(/!+/g, "")
    .replace(/\s+[-–]\s*$/, "")
    .replace(/\.$/, "")
    .trim();
  if (s === s.toUpperCase()) {
    s = s
      .toLowerCase()
      .replace(/\b([a-z])([a-z]{3,})\b/g, (_, a, b) => a.toUpperCase() + b)
      .replace(/\b(rib|fc|vx|fx|gp|ho|sx|hp|svho)\b/gi, (m) => m.toUpperCase());
  }
  return s.replace(/\s+/g, " ");
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70)
    .replace(/-$/, "");

function extFor(buf) {
  const h = buf.subarray(0, 12);
  if (h[0] === 0xff && h[1] === 0xd8) return "jpg";
  if (h[0] === 0x89 && h[1] === 0x50) return "png";
  if (h.toString("ascii", 0, 4) === "RIFF" && h.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

async function download(url, dest) {
  const res = await fetch(`${url}?format=1500w`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extFor(buf);
  if (!ext) throw new Error(`Unknown image type ${url}`);
  writeFileSync(`${dest}.${ext}`, buf);
  return ext;
}

const res = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
const { items } = await res.json();
console.log(`Fetched ${items.length} products`);

const seen = new Set();
const all = items.map((it, order) => {
  const ov = OVERRIDES.find((o) => o.match(it)) ?? {};
  const imgs = (it.items || []).map((x) => x.assetUrl);
  const plain = decode((it.excerpt || "") + " " + (it.body || "")).replace(/<[^>]+>/g, " ");
  const firstImg = (imgs[0] || "").split("/").pop();
  // Several listings are only marked "S O L D !!!" at the top of their description.
  const plainStart = plain.replace(/\s+/g, " ").trim().slice(0, 40);
  const sold = /\bsold\b/i.test(it.title) || /sold/i.test(firstImg) || /s ?o ?l ?d ?!/i.test(plainStart);
  const title = ov.title ?? cleanTitle(it.title);
  let slug = slugify(title);
  while (seen.has(slug)) slug += "-2";
  seen.add(slug);
  const year = Number(title.match(/\b(19[89]\d|20[0-3]\d)\b/)?.[1]) || null;
  const blocks = htmlToBlocks(it.excerpt || it.body);
  // Drop a leading block that just repeats the title.
  if (blocks[0]?.type === "p" && /^s ?o ?l ?d[ !]*$/i.test(blocks[0].text)) blocks.shift();
  if (blocks[0]?.type === "p" && blocks[0].text.length < 90 && /for sale|^\d{4} /i.test(blocks[0].text)) blocks.shift();
  return {
    slug,
    title,
    category: ov.category ?? category(it.title + " " + title),
    status: sold ? "sold" : "available",
    year,
    ...prices(it, plain),
    order,
    sourceUrl: `https://www.stfrancisbayyamaha.com${it.fullUrl}`,
    description: blocks,
    // Marketing "SOLD!" banners are skipped in favour of real photos when there are any.
    remoteImages: imgs.filter((u) => !/sold/i.test(u.split("/").pop())).concat(imgs.filter((u) => /sold/i.test(u.split("/").pop()))),
    hasRealPhoto: imgs.some((u) => !/sold/i.test(u.split("/").pop())),
  };
});

const available = all.filter((l) => l.status === "available");
const sold = all.filter((l) => l.status === "sold" && l.hasRealPhoto).slice(0, SOLD_TO_KEEP);
const keep = [...available, ...sold];

if (existsSync(IMG_DIR)) rmSync(IMG_DIR, { recursive: true });
mkdirSync(IMG_DIR, { recursive: true });
mkdirSync(join(ROOT, "data"), { recursive: true });

const out = [];
for (const l of keep) {
  const dir = join(IMG_DIR, l.slug);
  mkdirSync(dir, { recursive: true });
  const urls = l.status === "sold" ? l.remoteImages.slice(0, 1) : l.remoteImages.filter((u, i) => i === 0 || !/sold/i.test(u));
  const images = [];
  for (const [i, u] of urls.entries()) {
    try {
      const ext = await download(u, join(dir, String(i + 1)));
      images.push(`/images/stock/${l.slug}/${i + 1}.${ext}`);
    } catch (e) {
      console.warn("  skip image:", e.message);
    }
  }
  if (!images.length) continue;
  const rest = { ...l };
  delete rest.remoteImages;
  delete rest.hasRealPhoto;
  out.push({ ...rest, images });
  console.log(`${l.status === "sold" ? "SOLD " : "     "} ${l.category.padEnd(12)} ${images.length}  ${l.title}`);
}

writeFileSync(DATA_FILE, JSON.stringify(out, null, 2) + "\n");
console.log(`\nWrote ${out.length} listings (${out.filter((l) => l.status === "available").length} available) to data/listings.json`);
