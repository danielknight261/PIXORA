export { createBrowserClient } from "./client/browser";
export { createServerClient } from "./client/server";
export {
  createAdminClient,
} from "./client/admin";
export { createMobileClient, type MobileSupabaseConfig } from "./client/mobile";
export { env, isSupabaseConfigured } from "./env";
export { getAuthUser, signOut, updateProfile } from "./auth/helpers";
export {
  PHOTOS_BUCKET,
  getUserPhotoPath,
  uploadPhoto,
  getPhotoSignedUrl,
  deletePhoto,
  listUserPhotos,
} from "./storage/client";
export { getOrderById, getOrders } from "./queries/orders";
export { getProductBySlug, getProducts, getProductsByCategorySlug } from "./queries/products";
export { getUserProfile, upsertUserProfile } from "./queries/users";
export { getCategories, getCategoryBySlug } from "./queries/categories";
export { getDesigns, getDesignById, getDesignByIdForUser } from "./queries/designs";
export {
  getDesignsWithProducts,
  getDesignPreviewStoragePath,
  getPreviewSignedUrl,
} from "./queries/designs-with-products";
export {
  createDesign,
  updateDesign,
  upsertDesignDraft,
  deleteDesign,
} from "./mutations/designs";
export {
  getPrintTemplateByProductId,
  getPrintTemplateById,
  getPrintTemplateByProductSlug,
  getProductVariantsByProductId,
  getProductWithTemplateBySlug,
} from "./queries/print-templates";
export { getAddresses, getDefaultAddress } from "./queries/addresses";
export { getUploads, createUploadRecord, getUploadById, deleteUploadRecord } from "./queries/uploads";
export {
  ImageUploadService,
  imageUploadService,
  type UploadImageInput,
  type UploadImageResult,
} from "./storage/upload-service";
export {
  getFulfillmentMappingsByVariantId,
  getGelatoMappingByVariantId,
  listGelatoFulfillmentMappings,
} from "./queries/fulfillment-mappings";
export { upsertFulfillmentMapping } from "./mutations/fulfillment-mappings";
export {
  syncGelatoCatalog,
  listGelatoCatalogs,
  type GelatoSyncResult,
  type GelatoSyncError,
  type GelatoSyncMapping,
} from "./services/gelato-catalog-sync";
export {
  importGelatoCanvasAndMugs,
  type GelatoImportResult,
} from "./services/gelato-catalog-import";
export {
  GELATO_VARIANT_MAP,
  GELATO_PRODUCT_SLUGS,
  getGelatoMapForVariant,
  getGelatoMapKey,
  isGelatoMappedProduct,
  GELATO_PRODUCT_MAP,
  getGelatoMapForProduct,
  type GelatoVariantMapEntry,
  type GelatoProductMapEntry,
} from "./gelato/product-map";
export type { Database, Profile } from "./types/database";
