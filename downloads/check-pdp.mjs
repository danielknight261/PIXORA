import fs from "fs";
const html = fs.readFileSync("downloads/canvas-pdp.html", "utf8");
const idx = html.indexOf("data-variant-map");
console.log("idx", idx);
const start = html.indexOf("{", idx);
const end = html.indexOf("</script>", start);
const json = html.slice(start, end).trim();
const data = JSON.parse(json);
const imgs = [...new Set(data.variants.map((v) => v.featuredImage))];
console.log({
  variants: data.variants.length,
  uniqueFeaturedImages: imgs.filter(Boolean).length,
  sample: data.variants.slice(0, 5).map((v) => ({
    t: v.title,
    img: (v.featuredImage || "").split("/").pop(),
  })),
});
console.log("has data-product-image", html.includes("data-product-image"));
