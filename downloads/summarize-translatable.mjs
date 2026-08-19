import fs from "node:fs";

const dump = JSON.parse(fs.readFileSync("downloads/translatable-dump.json", "utf8"));

function unique(type, keys) {
  const map = new Map();
  for (const n of dump[type] || []) {
    for (const f of n.fields || []) {
      if (keys && !keys.includes(f.key)) continue;
      const k = f.preview;
      if (!map.has(k)) map.set(k, { key: f.key, chars: f.chars, preview: f.preview, count: 0 });
      map.get(k).count++;
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

console.log("=== OPTION NAMES ===");
for (const x of unique("PRODUCT_OPTION", ["name"])) console.log(x.count, x.preview);

console.log("\n=== OPTION VALUES ===");
const allVals = unique("PRODUCT_OPTION_VALUE", ["name"]);
const vals = allVals.filter((x) => {
  const t = x.preview;
  if (/^[0-9x×\s.\-"'/cm]+$/i.test(t)) return false;
  if (/^\d/.test(t) && t.length < 14) return false;
  return true;
});
console.log("filtered", vals.length, "of", allVals.length);
for (const x of vals.slice(0, 100)) console.log(x.count, x.preview);

console.log("\n=== DELIVERY ===");
for (const x of unique("DELIVERY_METHOD_DEFINITION").slice(0, 30)) {
  console.log(x.count, x.key, x.preview);
}
