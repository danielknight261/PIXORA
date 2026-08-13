import type { GelatoProduct } from "@pixora/providers";

const DPI = 300;
const MM_PER_INCH = 25.4;

export type ParsedCanvasVariant = {
  productUid: string;
  variantSlug: string;
  name: string;
  formatLabel: string;
  orientation: "hor" | "ver";
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  sortKey: number;
};

export type ParsedMugVariant = {
  productUid: string;
  variantSlug: string;
  name: string;
  size: string;
  material: string;
  widthPx: number;
  heightPx: number;
  sortKey: number;
  mockupTone: "light" | "dark";
};

function attrString(
  attributes: GelatoProduct["attributes"],
  key: string,
): string {
  const value = attributes[key];
  return typeof value === "string" ? value : String(value ?? "");
}

function mmToPx(mm: number) {
  return Math.round((mm / MM_PER_INCH) * DPI);
}

function parseUnifiedCanvasFormat(format: string): {
  widthMm: number;
  heightMm: number;
  label: string;
} | null {
  // Prefer inch-first: 16x20-inch-400x500-mm
  const inchFirst = format.match(
    /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)-inch-(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)-mm$/i,
  );
  if (inchFirst) {
    const wIn = Number(inchFirst[1]);
    const hIn = Number(inchFirst[2]);
    return {
      widthMm: Number(inchFirst[3]),
      heightMm: Number(inchFirst[4]),
      label: `${wIn}×${hIn}″`,
    };
  }

  return null;
}

export function parseCanvasProduct(
  product: GelatoProduct,
): ParsedCanvasVariant | null {
  const thickness = attrString(product.attributes, "CanvasThicknessType");
  if (thickness !== "wood-fsc-slim") return null;

  const orientationRaw = attrString(product.attributes, "Orientation");
  if (orientationRaw !== "hor" && orientationRaw !== "ver") return null;

  const unified = attrString(product.attributes, "UnifiedCanvasFormat");
  const parsed = parseUnifiedCanvasFormat(unified);
  if (!parsed) return null;

  const widthMm =
    orientationRaw === "hor" ? parsed.widthMm : parsed.heightMm;
  const heightMm =
    orientationRaw === "hor" ? parsed.heightMm : parsed.widthMm;

  const slugBase = unified.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const variantSlug = `${slugBase}-${orientationRaw}`;
  const orientationLabel =
    orientationRaw === "hor" ? "Landscape" : "Portrait";

  return {
    productUid: product.productUid,
    variantSlug,
    name: `${parsed.label} · ${orientationLabel}`,
    formatLabel: parsed.label,
    orientation: orientationRaw,
    widthMm,
    heightMm,
    widthPx: mmToPx(widthMm),
    heightPx: mmToPx(heightMm),
    sortKey: widthMm * heightMm,
  };
}

const MUG_WRAP_PX: Record<string, { widthPx: number; heightPx: number }> = {
  "10-oz-slim": { widthPx: 2200, heightPx: 1000 },
  "11-oz": { widthPx: 2480, heightPx: 1150 },
  "12-oz-enamel": { widthPx: 2300, heightPx: 1100 },
  "15-oz": { widthPx: 2700, heightPx: 1250 },
  "15-oz-travel": { widthPx: 2500, heightPx: 1400 },
  "17-oz-tall": { widthPx: 2400, heightPx: 1600 },
};

const DARK_MUG_MATERIALS = new Set([
  "ceramic-black",
  "heat-transfer-black",
]);

function titleCaseMaterial(material: string) {
  return material
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function titleCaseSize(size: string) {
  return size
    .replace(/-/g, " ")
    .replace(/\boz\b/g, "oz")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseMugProduct(
  product: GelatoProduct,
): ParsedMugVariant | null {
  const size = attrString(product.attributes, "MugSize");
  const material = attrString(product.attributes, "MugMaterial");
  if (!size || !material) return null;

  const wrap = MUG_WRAP_PX[size] ?? { widthPx: 2480, heightPx: 1150 };
  const variantSlug = `${size}-${material}`.toLowerCase();

  return {
    productUid: product.productUid,
    variantSlug,
    name: `${titleCaseSize(size)} · ${titleCaseMaterial(material)}`,
    size,
    material,
    widthPx: wrap.widthPx,
    heightPx: wrap.heightPx,
    sortKey:
      (Number(size.match(/\d+/)?.[0] ?? 11) * 100) +
      (DARK_MUG_MATERIALS.has(material) ? 1 : 0),
    mockupTone: DARK_MUG_MATERIALS.has(material) ? "dark" : "light",
  };
}

export async function paginateGelatoProducts(
  search: (offset: number, limit: number) => Promise<{ products: GelatoProduct[] }>,
  pageSize = 100,
  maxPages = 30,
): Promise<GelatoProduct[]> {
  const products: GelatoProduct[] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * pageSize;
    const response = await search(offset, pageSize);
    const batch = response.products ?? [];
    products.push(...batch);
    if (batch.length < pageSize) break;
  }

  return products;
}
