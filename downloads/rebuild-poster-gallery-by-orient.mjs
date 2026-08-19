/**
 * Rebuild poster gallery extras by orientation.
 * Portrait keeps Gelato lifestyle mockups. Landscape/square use other
 * same-orientation mockups so thumbs match the selected mode.
 */
import fs from "node:fs";
import path from "node:path";

const variants = JSON.parse(
  fs.readFileSync("downloads/poster-variants-classed.json", "utf8")
);

function withWidth(url) {
  if (!url) return url;
  return `${url.split("?")[0]}?width=1100`;
}

const PORTRAIT_EXTRAS = [
  "https://cdn.shopify.com/s/files/1/1006/7256/9688/files/bafc3f33-ea69-4a09-a32a-cc27f99f98c5.webp?width=1100",
  "https://cdn.shopify.com/s/files/1/1006/7256/9688/files/de81b7c5-44dd-488a-9625-248f0cf72c7b.webp?width=1100",
];

function pickBySize(orient, needles) {
  const pool = variants.filter((v) => v.orient === orient);
  const urls = [];
  for (const needle of needles) {
    const hit = pool.find((v) => String(v.size).includes(needle));
    if (hit?.url) urls.push(withWidth(hit.url));
  }
  for (const v of pool) {
    if (urls.length >= 2) break;
    const u = withWidth(v.url);
    if (u && !urls.includes(u)) urls.push(u);
  }
  return urls.slice(0, 2);
}

const extrasByOrient = {
  portrait: PORTRAIT_EXTRAS,
  landscape: pickBySize("landscape", ["12x16", "16x24"]),
  square: pickBySize("square", ["12x12", "20x20"]),
};

function fillFromPool(orient, images, own) {
  const pool = variants
    .filter((v) => v.orient === orient)
    .map((v) => withWidth(v.url))
    .filter(Boolean);
  for (const u of pool) {
    if (images.length >= 3) break;
    if (u !== own && !images.includes(u)) images.push(u);
  }
  return images;
}

const gallery = {};
const counts = {};
for (const v of variants) {
  const own = withWidth(v.url);
  const images = [];
  const seen = new Set();
  const add = (u) => {
    if (!u || seen.has(u)) return;
    seen.add(u);
    images.push(u);
  };
  add(own);
  for (const extra of extrasByOrient[v.orient] || []) add(extra);
  fillFromPool(v.orient, images, own);
  gallery[v.id] = images.slice(0, 3);
  const n = gallery[v.id].length;
  counts[n] = (counts[n] || 0) + 1;
}

const snippetPath = path.join(
  "apps",
  "shopify-theme",
  "snippets",
  "matte-poster-gallery-data.liquid"
);
fs.writeFileSync(snippetPath, JSON.stringify(gallery));
fs.writeFileSync(
  "downloads/matte-poster-gallery.json",
  JSON.stringify({ extrasByOrient, counts, gallery }, null, 2)
);

const sample = (orient) => {
  const v = variants.find((row) => row.orient === orient);
  return { title: v.title, images: gallery[v.id] };
};
console.log({
  counts,
  extrasByOrient,
  portrait: sample("portrait"),
  landscape: sample("landscape"),
  square: sample("square"),
});
