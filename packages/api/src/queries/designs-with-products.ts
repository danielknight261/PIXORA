import type { DesignWithProduct } from "@pixora/shared";
import { PHOTOS_BUCKET } from "@pixora/shared";
import { mapDesign } from "../mappers/print-templates";
import type { PixoraSupabaseClient } from "../types/client";

const designWithProductSelect = `
  id,
  user_id,
  product_id,
  name,
  canvas_data,
  preview_url,
  upload_id,
  created_at,
  updated_at,
  products!inner ( slug, name )
`;

type DesignRowWithProduct = {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  canvas_data: Record<string, unknown>;
  preview_url: string | null;
  upload_id: string | null;
  created_at: string;
  updated_at: string;
  products: { slug: string; name: string } | { slug: string; name: string }[];
};

async function getPreviewSignedUrl(
  supabase: PixoraSupabaseClient,
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;

  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

function mapDesignWithProduct(
  row: DesignRowWithProduct,
  previewSignedUrl: string | null,
): DesignWithProduct {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  const design = mapDesign(row);

  return {
    ...design,
    productSlug: product?.slug ?? "",
    productName: product?.name ?? "Product",
    previewSignedUrl,
  };
}

export async function getDesignsWithProducts(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<DesignWithProduct[]> {
  const { data, error } = await supabase
    .from("designs")
    .select(designWithProductSelect)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as DesignRowWithProduct[];

  return Promise.all(
    rows.map(async (row) => {
      const previewSignedUrl = await getPreviewSignedUrl(
        supabase,
        row.preview_url,
      );
      return mapDesignWithProduct(row, previewSignedUrl);
    }),
  );
}

export function getDesignPreviewStoragePath(
  userId: string,
  designId: string,
): string {
  return `${userId}/previews/${designId}.png`;
}

export { getPreviewSignedUrl };
