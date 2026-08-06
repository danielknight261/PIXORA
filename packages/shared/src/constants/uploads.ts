/** Supabase Storage bucket for user photo uploads */
export const PHOTOS_BUCKET = "photos" as const;

/** 50 MB — matches storage.buckets.file_size_limit */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
] as const;

export const MAX_UPLOAD_BYTES_LABEL = "50 MB";
