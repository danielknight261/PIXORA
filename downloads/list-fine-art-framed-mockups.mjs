import fs from "node:fs";
import path from "node:path";

const ROOT =
  "c:\\Users\\HughesHub\\Downloads\\accd335d-26eb-4ed9-ae12-c7823bc3c29a";

const re =
  /^framed_fine_arts_poster_mounted_geo_simplified_product_12-0_([^_]+)_(wood|aluminum)_.+_(hor|ver)_(.+?)_\4_200-gsm-80lb-enhanced-uncoated$/i;

function parseFolder(name) {
  const m = name.match(re);
  if (!m) return null;
  const color = m[1].toLowerCase();
  const material = m[2].toLowerCase();
  const orient = m[3].toLowerCase();
  const sizeKey = m[4].toLowerCase();
  const inchM = sizeKey.match(/(\d+)x(\d+)-inch/);
  const mmM = sizeKey.match(/^(\d+)x(\d+)-mm/);
  const aM = sizeKey.match(/^a([0-4])(?:-|_|$)/);
  const inch = inchM ? `${inchM[1]}x${inchM[2]}` : null;
  const mm = mmM ? `${mmM[1]}x${mmM[2]}` : null;
  const square =
    (inch && inch.split("x")[0] === inch.split("x")[1]) ||
    (mm && mm.split("x")[0] === mm.split("x")[1]);
  return {
    folder: name,
    color,
    material,
    frame: color, // color is the frame identity in filenames
    orient: orient === "hor" ? "landscape" : square ? "square" : "portrait",
    sizeKey,
    inch,
    mm,
    a: aM ? `a${aM[1]}` : null,
    xl: /\bxl\b/.test(sizeKey),
    fiveR: /\b5r\b/.test(sizeKey),
    square,
  };
}

if (!fs.existsSync(ROOT)) {
  console.log("MISSING", ROOT);
  process.exit(1);
}

const folders = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const parsed = [];
const unparsed = [];
for (const folder of folders) {
  const meta = parseFolder(folder);
  if (!meta) unparsed.push(folder);
  else parsed.push(meta);
}

const fileSets = {};
for (const p of parsed.slice(0, 5)) {
  fileSets[p.folder] = fs
    .readdirSync(path.join(ROOT, p.folder))
    .filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
    .sort();
}

const byColor = {};
const byMat = {};
const byOrient = {};
const bySize = {};
for (const p of parsed) {
  byColor[p.color] = (byColor[p.color] || 0) + 1;
  byMat[p.material] = (byMat[p.material] || 0) + 1;
  byOrient[p.orient] = (byOrient[p.orient] || 0) + 1;
  bySize[p.sizeKey] = (bySize[p.sizeKey] || 0) + 1;
}

console.log(
  JSON.stringify(
    {
      totalFolders: folders.length,
      parsed: parsed.length,
      unparsedCount: unparsed.length,
      unparsedSample: unparsed.slice(0, 15),
      byColor,
      byMat,
      byOrient,
      uniqueSizes: Object.keys(bySize).sort(),
      bySize,
      fileSets,
    },
    null,
    2
  )
);
