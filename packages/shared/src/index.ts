export { brand } from "./constants/brand";
export { artPalette, categoryArtColors, heroMeshColors } from "./constants/art-palette";
export { mockCategories, mockProducts, getMockBestSellers } from "./data/mock-catalog";
export {
  filterCatalogProducts,
  sortCatalogProducts,
  queryCatalogProducts,
  productPagePath,
} from "./utils/catalog-query";
export {
  validateImageFile,
  sanitizeFileName,
  generateUniqueStorageFileName,
  type ImageFileLike,
  type UploadValidationResult,
} from "./utils/upload-validation";
export {
  PHOTOS_BUCKET,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_BYTES_LABEL,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
} from "./constants/uploads";
export type { AllowedImageMimeType } from "./constants/uploads";
export type { CatalogProduct, CatalogQuery, ProductSortOption } from "./types/catalog";
export { productSortOptions } from "./types/catalog";
export { productCategories, type ProductCategory } from "./constants/products";
export { loginSchema, registerSchema, forgotPasswordSchema, type LoginInput, type RegisterInput, type ForgotPasswordInput } from "./schemas/auth";
export { checkoutSchema, type CheckoutInput } from "./schemas/checkout";
export { productSchema, type ProductInput } from "./schemas/product";
export type { Category } from "./types/category";
export type { Address } from "./types/address";
export type { Upload } from "./types/upload";
export type { Order, OrderItem, OrderStatus, ShippingAddress } from "./types/order";
export type { Design, Product } from "./types/product";
export type { User, UserProfile } from "./types/user";
export { formatCurrency, formatDate } from "./utils/format";
export { validate, type ValidationResult } from "./utils/validation";
