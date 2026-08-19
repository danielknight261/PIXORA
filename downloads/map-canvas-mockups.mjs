import fs from "fs";
import path from "path";

const MOCKUP_ROOT =
  "c:\\Users\\HughesHub\\Downloads\\f11cc67c-da2f-4e8e-a35c-7bede4bbe9fd\\96379a8a-3182-4a48-8c20-bbb297ad0293";
const IMAGE_NAME = "Close-Up-Plain-Gray-0.webp";
const FALLBACK_IMAGE = "Simple.webp";

function parseFolder(name) {
  const m = name.match(
    /^canvas_\d+x\d+-mm-(\d+)x(\d+)-inch_canvas_wood-fsc-(slim|thick)_4-0_(hor|ver)$/i
  );
  if (!m) return null;
  return {
    inchKey: `${m[1]}x${m[2]}`,
    thickness: m[3].toLowerCase() === "thick" ? "Thick" : "Slim",
    orientation: m[4].toLowerCase() === "hor" ? "Horizontal" : "Vertical",
  };
}

function inchFromShopifySize(size) {
  // "20x30 cm / 8x12″" → "8x12"
  const m = String(size).match(/(\d+)\s*[x×]\s*(\d+)\s*(?:″|"|in)/i);
  if (!m) return null;
  return `${m[1]}x${m[2]}`;
}

function pickImage(dir) {
  for (const name of [IMAGE_NAME, FALLBACK_IMAGE]) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  const any = fs.readdirSync(dir).find((f) => /\.(webp|png|jpe?g)$/i.test(f));
  return any ? path.join(dir, any) : null;
}

const variants = JSON.parse(
  fs.readFileSync("downloads/canvas-variants.json", "utf8")
).product.variants.nodes;

const folders = fs
  .readdirSync(MOCKUP_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const jobs = [];
const unmatched = [];
const used = new Set();

for (const folder of folders) {
  const meta = parseFolder(folder);
  if (!meta) {
    unmatched.push({ folder, reason: "parse" });
    continue;
  }
  const variant = variants.find((v) => {
    const opts = Object.fromEntries(
      v.selectedOptions.map((o) => [o.name, o.value])
    );
    const inch = inchFromShopifySize(opts.Size);
    return (
      opts.Orientation === meta.orientation &&
      opts.Thickness === meta.thickness &&
      inch === meta.inchKey
    );
  });
  if (!variant) {
    unmatched.push({ folder, reason: "no-variant", meta });
    continue;
  }
  if (used.has(variant.id)) {
    unmatched.push({ folder, reason: "duplicate-variant", variant: variant.title });
    continue;
  }
  const img = pickImage(path.join(MOCKUP_ROOT, folder));
  if (!img) {
    unmatched.push({ folder, reason: "no-image" });
    continue;
  }
  used.add(variant.id);
  jobs.push({
    folder,
    variantId: variant.id,
    title: variant.title,
    img,
    alt: `${meta.orientation} ${meta.thickness} ${meta.inchKey} canvas`,
    filename: path.basename(img).replace(/\.webp$/i, `-${meta.inchKey}-${meta.orientation}-${meta.thickness}.webp`),
  });
}

const missingVariants = variants.filter((v) => !used.has(v.id)).map((v) => v.title);

fs.writeFileSync(
  "downloads/canvas-mockup-jobs.json",
  JSON.stringify({ jobs, unmatched, missingVariants }, null, 2)
);
console.log({
  folders: folders.length,
  jobs: jobs.length,
  unmatched: unmatched.length,
  missingVariants: missingVariants.length,
  unmatchedSample: unmatched.slice(0, 8),
  missingSample: missingVariants.slice(0, 8),
});
