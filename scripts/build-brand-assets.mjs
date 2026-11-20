// Builds the header logo and favicons from the dealership logo (assets/logo-source.webp).
//
//   node scripts/build-brand-assets.mjs
//
// Outputs:
//   public/images/logo-on-dark.png   trimmed logo with the black "ST. FRANCIS" + divider turned white
//   app/icon.png, app/apple-icon.png favicons built from the St Francis boat mark
//   app/favicon.ico                  multi-size .ico (16/32/48) for older browsers
// Run again if the source logo changes.

import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "assets/logo-source.webp");

const trimmed = await sharp(SRC).ensureAlpha().trim({ threshold: 1 }).png().toBuffer();

// 1. Dark-background variant: recolour near-black, unsaturated pixels to white.
//    Red artwork and the silver Yamaha emblem are left untouched.
{
  const { data, info } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (a > 0 && max < 110 && max - min < 40) {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }
  await sharp(data, { raw: info }).png().toFile(join(ROOT, "public/images/logo-on-dark.png"));
}

// 2. Favicons from the St Francis boat mark. The full mark is ~3.6:1 and shrinks to a
//    sliver at tab size, so crop to the rider and bow (source x 1240–1426, y 88–209),
//    which stays recognisable down to 16px.
const boatRaw = await sharp(SRC).extract({ left: 1240, top: 88, width: 186, height: 121 }).png().toBuffer();
const boat = await sharp(boatRaw).trim({ threshold: 1 }).png().toBuffer();
// Mark sits on a white rounded tile so it reads on light and dark browser tabs.
async function tile(size, { radius = 0.22, pad = 0.12 } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(boat).resize({ width: inner, height: inner, fit: "inside" }).toBuffer();
  const r = Math.round(size * radius);
  const bg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="#fff"/></svg>`,
  );
  return sharp(bg).composite([{ input: mark, gravity: "center" }]).png().toBuffer();
}

writeFileSync(join(ROOT, "app/icon.png"), await tile(512));
// Apple applies its own corner mask, so use a full-bleed square there.
writeFileSync(join(ROOT, "app/apple-icon.png"), await tile(180, { radius: 0, pad: 0.1 }));

// .ico: PNG-compressed entries (supported by every current browser).
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => tile(s, { radius: 0.18, pad: 0.04 })));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, k) => {
  const e = 6 + k * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[k].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[k].length;
});
writeFileSync(join(ROOT, "app/favicon.ico"), Buffer.concat([header, ...pngs]));

const meta = await sharp(trimmed).metadata();
console.log(`logo: ${meta.width}x${meta.height}  (aspect ${(meta.width / meta.height).toFixed(3)})`);
console.log("wrote public/images/logo-on-dark.png, app/icon.png, app/apple-icon.png, app/favicon.ico");
