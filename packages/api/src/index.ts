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
export { getDesigns, getDesignById } from "./queries/designs";
export { getAddresses, getDefaultAddress } from "./queries/addresses";
export { getUploads, createUploadRecord, getUploadById, deleteUploadRecord } from "./queries/uploads";
export {
  ImageUploadService,
  imageUploadService,
  type UploadImageInput,
  type UploadImageResult,
} from "./storage/upload-service";
export type { Database, Profile } from "./types/database";
