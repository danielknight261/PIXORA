import fs from "node:fs";
import path from "node:path";

const ROOT =
  "c:\\Users\\HughesHub\\Downloads\\f93b4302-63cf-4f1d-bc79-f8ad4fdb2ede";

function walk(dir, depth = 0) {
  if (!fs.existsSync(dir)) {
    console.log("MISSING", dir);
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  console.log({ dir, depth, dirs: dirs.length, files: files.length, sampleFiles: files.slice(0, 12) });
  if (depth === 0) {
    for (const d of dirs.slice(0, 3)) walk(path.join(dir, d), depth + 1);
  } else if (depth === 1 && dirs.length && !files.length) {
    walk(path.join(dir, dirs[0]), depth + 1);
  }
}

walk(ROOT);

const folders = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const re =
  /^framed_canvas_geo_simplified_(\d+)x(\d+)-mm-(\d+)x(\d+)-inch_(black|dark-wood|natural-wood)_.+_(hor|ver)_wood_w14xt42-mm_canvas_4-0$/i;

const parsed = [];
const unparsed = [];
for (const folder of folders) {
  const m = folder.match(re);
  if (!m) {
    unparsed.push(folder);
    continue;
  }
  parsed.push({
    folder,
    inch: `${m[3]}x${m[4]}`,
    color: m[5].toLowerCase(),
    orient: m[6].toLowerCase(),
  });
}

const fileSets = {};
for (const p of parsed.slice(0, 8)) {
  const files = fs
    .readdirSync(path.join(ROOT, p.folder))
    .filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
    .sort();
  fileSets[p.folder] = files;
}

const byInch = {};
const byColor = {};
const byOrient = {};
for (const p of parsed) {
  byInch[p.inch] = (byInch[p.inch] || 0) + 1;
  byColor[p.color] = (byColor[p.color] || 0) + 1;
  byOrient[p.orient] = (byOrient[p.orient] || 0) + 1;
}

console.log({
  totalFolders: folders.length,
  parsed: parsed.length,
  unparsed: unparsed.slice(0, 10),
  byInch,
  byColor,
  byOrient,
  fileSets,
});
