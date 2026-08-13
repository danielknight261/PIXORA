import type {
  FulfillmentProvider,
  MockupPrintArea,
  PrintTemplate,
  ProductVariant,
} from "@pixora/shared";

type PrintTemplateRow = {
  id: string;
  product_id: string;
  name: string;
  surface_key: string;
  width_px: number;
  height_px: number;
  dpi: number;
  bleed_px: number;
  safe_zone_inset_px: number;
  mockup_image_url: string | null;
  mockup_print_area: MockupPrintArea | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type ProductVariantRow = {
  id: string;
  product_id: string;
  print_template_id: string;
  slug: string;
  name: string;
  price_delta: number;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type DesignRow = {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  canvas_data: Record<string, unknown>;
  preview_url: string | null;
  upload_id: string | null;
  created_at: string;
  updated_at: string;
};

export function mapPrintTemplate(row: PrintTemplateRow): PrintTemplate {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    surfaceKey: row.surface_key,
    widthPx: row.width_px,
    heightPx: row.height_px,
    dpi: row.dpi,
    bleedPx: row.bleed_px,
    safeZoneInsetPx: row.safe_zone_inset_px,
    mockupImageUrl: row.mockup_image_url,
    mockupPrintArea: row.mockup_print_area,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProductVariant(row: ProductVariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    printTemplateId: row.print_template_id,
    slug: row.slug,
    name: row.name,
    priceDelta: row.price_delta,
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDesign(row: DesignRow) {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    name: row.name,
    canvasData: row.canvas_data ?? {},
    previewUrl: row.preview_url,
    uploadId: row.upload_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type { PrintTemplateRow, ProductVariantRow, DesignRow };
