/**
 * @deprecated Pixora custom-store import is retired.
 * Publish via the Gelato Shopify app — see docs/shopify-gelato-migration.md
 */
import type { GelatoClient } from "@pixora/providers";
import { GelatoApiError } from "@pixora/providers";
import {
  paginateGelatoProducts,
  parseCanvasProduct,
  parseMugProduct,
  type ParsedCanvasVariant,
  type ParsedMugVariant,
} from "../gelato/parse-product";
import { upsertFulfillmentMapping } from "../mutations/fulfillment-mappings";
import type { PixoraSupabaseClient } from "../types/client";

export type GelatoImportResult = {
  canvasVariants: number;
  mugVariants: number;
  synced: number;
  errors: Array<{ catalog: string; variantSlug: string; message: string }>;
};

type ProductRow = {
  id: string;
  slug: string;
};

const CANVAS_PRODUCT_SLUG = "canvas-prints-standard";
const MUG_PRODUCT_SLUG = "mugs-standard";

function canvasMockupMetadata(variant: ParsedCanvasVariant) {
  return {
    mockupWidth: 1000,
    mockupHeight: 1000,
    mockupWarp: "quad",
    mockupFrame: { x: 160, y: 100, width: 680, height: 700 },
    mockupQuad: {
      tl: { x: 180, y: 120 },
      tr: { x: 820, y: 140 },
      br: { x: 800, y: 780 },
      bl: { x: 200, y: 800 },
    },
    gelatoProductUid: variant.productUid,
    formatLabel: variant.formatLabel,
    orientation: variant.orientation,
    productSlug: CANVAS_PRODUCT_SLUG,
  };
}

function mugMockupMetadata(variant: ParsedMugVariant) {
  return {
    mockupWidth: 800,
    mockupHeight: 600,
    mockupWarp: "cylinder",
    mockupFrame: { x: 220, y: 250, width: 360, height: 230 },
    mockupCylinder: { bulge: 0.22 },
    gelatoProductUid: variant.productUid,
    mugSize: variant.size,
    mugMaterial: variant.material,
    mockupTone: variant.mockupTone,
    productSlug: MUG_PRODUCT_SLUG,
  };
}

async function getProductBySlug(
  supabase: PixoraSupabaseClient,
  slug: string,
): Promise<ProductRow> {
  const { data, error } = await supabase
    .from("products")
    .select("id, slug")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Error(`Product "${slug}" not found. Seed catalog products first.`);
  }

  return data as ProductRow;
}

async function upsertPrintTemplate(
  supabase: PixoraSupabaseClient,
  input: {
    productId: string;
    name: string;
    surfaceKey: string;
    widthPx: number;
    heightPx: number;
    bleedPx: number;
    safeZoneInsetPx: number;
    mockupImageUrl: string;
    mockupPrintArea: Record<string, number>;
    metadata: Record<string, unknown>;
  },
) {
  const { data, error } = await supabase
    .from("print_templates")
    .upsert(
      {
        product_id: input.productId,
        name: input.name,
        surface_key: input.surfaceKey,
        width_px: input.widthPx,
        height_px: input.heightPx,
        dpi: 300,
        bleed_px: input.bleedPx,
        safe_zone_inset_px: input.safeZoneInsetPx,
        mockup_image_url: input.mockupImageUrl,
        mockup_print_area: input.mockupPrintArea,
        metadata: input.metadata,
      },
      { onConflict: "product_id,surface_key" },
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to upsert print template.");
  }

  return data.id as string;
}

async function upsertVariant(
  supabase: PixoraSupabaseClient,
  input: {
    productId: string;
    printTemplateId: string;
    slug: string;
    name: string;
    priceDelta: number;
    sortOrder: number;
  },
) {
  const { data, error } = await supabase
    .from("product_variants")
    .upsert(
      {
        product_id: input.productId,
        print_template_id: input.printTemplateId,
        slug: input.slug,
        name: input.name,
        price_delta: input.priceDelta,
        sort_order: input.sortOrder,
        active: true,
      },
      { onConflict: "product_id,slug" },
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to upsert product variant.");
  }

  return data.id as string;
}

async function importCanvasVariants(
  supabase: PixoraSupabaseClient,
  gelato: GelatoClient,
  result: GelatoImportResult,
) {
  const product = await getProductBySlug(supabase, CANVAS_PRODUCT_SLUG);

  const raw = await paginateGelatoProducts((offset, limit) =>
    gelato.catalog.searchProducts("canvas", {
      limit,
      offset,
      attributeFilters: { CanvasThicknessType: ["wood-fsc-slim"] },
    }),
  );

  const parsed = raw
    .map(parseCanvasProduct)
    .filter((item): item is ParsedCanvasVariant => Boolean(item))
    .sort((a, b) => a.sortKey - b.sortKey || a.variantSlug.localeCompare(b.variantSlug));

  // Deactivate old starter variants that aren't in the new Gelato set
  const activeSlugs = new Set(parsed.map((item) => item.variantSlug));

  for (const [index, variant] of parsed.entries()) {
    try {
      const metadata = canvasMockupMetadata(variant);
      const printArea = {
        x: metadata.mockupFrame.x,
        y: metadata.mockupFrame.y,
        width: metadata.mockupFrame.width,
        height: metadata.mockupFrame.height,
      };

      const templateId = await upsertPrintTemplate(supabase, {
        productId: product.id,
        name: variant.name,
        surfaceKey: variant.variantSlug,
        widthPx: variant.widthPx,
        heightPx: variant.heightPx,
        bleedPx: 90,
        safeZoneInsetPx: 120,
        mockupImageUrl: "/mockups/canvas-smart.svg",
        mockupPrintArea: printArea,
        metadata,
      });

      const areaSqIn = (variant.widthMm * variant.heightMm) / (25.4 * 25.4);
      const priceDelta = Math.max(0, Math.round((areaSqIn - 144) * 8));

      const variantId = await upsertVariant(supabase, {
        productId: product.id,
        printTemplateId: templateId,
        slug: variant.variantSlug,
        name: variant.name,
        priceDelta,
        sortOrder: index,
      });

      await upsertFulfillmentMapping(supabase, {
        variantId,
        provider: "gelato",
        providerProductId: variant.productUid,
        providerVariantId: variant.productUid,
        rawPayload: {
          catalogUid: "canvas",
          productUid: variant.productUid,
          syncedFrom: "gelato-catalog-import",
          orientation: variant.orientation,
          formatLabel: variant.formatLabel,
        },
      });

      result.canvasVariants += 1;
      result.synced += 1;
    } catch (caught) {
      result.errors.push({
        catalog: "canvas",
        variantSlug: variant.variantSlug,
        message:
          caught instanceof GelatoApiError
            ? `${caught.message} (${caught.status})`
            : caught instanceof Error
              ? caught.message
              : "Unknown import error.",
      });
    }
  }

  // Soft-disable variants no longer present
  const { data: existing } = await supabase
    .from("product_variants")
    .select("id, slug")
    .eq("product_id", product.id);

  for (const row of existing ?? []) {
    if (!activeSlugs.has(row.slug as string)) {
      await supabase
        .from("product_variants")
        .update({ active: false })
        .eq("id", row.id as string);
    }
  }
}

async function importMugVariants(
  supabase: PixoraSupabaseClient,
  gelato: GelatoClient,
  result: GelatoImportResult,
) {
  const product = await getProductBySlug(supabase, MUG_PRODUCT_SLUG);

  const raw = await paginateGelatoProducts((offset, limit) =>
    gelato.catalog.searchProducts("mugs", { limit, offset }),
  );

  const parsed = raw
    .map(parseMugProduct)
    .filter((item): item is ParsedMugVariant => Boolean(item))
    .sort((a, b) => a.sortKey - b.sortKey || a.name.localeCompare(b.name));

  const activeSlugs = new Set(parsed.map((item) => item.variantSlug));

  for (const [index, variant] of parsed.entries()) {
    try {
      const metadata = mugMockupMetadata(variant);
      const printArea = {
        x: metadata.mockupFrame.x,
        y: metadata.mockupFrame.y,
        width: metadata.mockupFrame.width,
        height: metadata.mockupFrame.height,
      };

      const mockupImageUrl =
        variant.mockupTone === "dark"
          ? "/mockups/mug-smart-dark.svg"
          : "/mockups/mug-smart-light.svg";

      const templateId = await upsertPrintTemplate(supabase, {
        productId: product.id,
        name: variant.name,
        surfaceKey: variant.variantSlug,
        widthPx: variant.widthPx,
        heightPx: variant.heightPx,
        bleedPx: 0,
        safeZoneInsetPx: 40,
        mockupImageUrl,
        mockupPrintArea: printArea,
        metadata,
      });

      const sizeOz = Number(variant.size.match(/\d+/)?.[0] ?? 11);
      const priceDelta = Math.max(0, (sizeOz - 11) * 100);

      const variantId = await upsertVariant(supabase, {
        productId: product.id,
        printTemplateId: templateId,
        slug: variant.variantSlug,
        name: variant.name,
        priceDelta,
        sortOrder: index,
      });

      await upsertFulfillmentMapping(supabase, {
        variantId,
        provider: "gelato",
        providerProductId: variant.productUid,
        providerVariantId: variant.productUid,
        rawPayload: {
          catalogUid: "mugs",
          productUid: variant.productUid,
          syncedFrom: "gelato-catalog-import",
          mugSize: variant.size,
          mugMaterial: variant.material,
        },
      });

      result.mugVariants += 1;
      result.synced += 1;
    } catch (caught) {
      result.errors.push({
        catalog: "mugs",
        variantSlug: variant.variantSlug,
        message:
          caught instanceof Error ? caught.message : "Unknown import error.",
      });
    }
  }

  const { data: existing } = await supabase
    .from("product_variants")
    .select("id, slug")
    .eq("product_id", product.id);

  for (const row of existing ?? []) {
    if (!activeSlugs.has(row.slug as string)) {
      await supabase
        .from("product_variants")
        .update({ active: false })
        .eq("id", row.id as string);
    }
  }
}

/** Import all slim-wrap canvas + all mug SKUs from Gelato into Pixora. */
export async function importGelatoCanvasAndMugs(
  supabase: PixoraSupabaseClient,
  gelato: GelatoClient,
): Promise<GelatoImportResult> {
  const result: GelatoImportResult = {
    canvasVariants: 0,
    mugVariants: 0,
    synced: 0,
    errors: [],
  };

  await importCanvasVariants(supabase, gelato, result);
  await importMugVariants(supabase, gelato, result);

  return result;
}
