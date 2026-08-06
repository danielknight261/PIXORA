import type { PixoraSupabaseClient } from "../types/client";
import { PHOTOS_BUCKET } from "@pixora/shared";

export { PHOTOS_BUCKET };

export function getUserPhotoPath(userId: string, fileName: string): string {
  return `${userId}/${fileName}`;
}

type StorageResult = {
  data: unknown;
  error: { message: string } | null;
};

export async function uploadPhoto(
  supabase: PixoraSupabaseClient,
  userId: string,
  file: File | Blob,
  fileName: string,
): Promise<StorageResult> {
  const path = getUserPhotoPath(userId, fileName);

  return supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file instanceof File ? file.type : undefined,
  });
}

export async function getPhotoSignedUrl(
  supabase: PixoraSupabaseClient,
  userId: string,
  fileName: string,
  expiresIn = 3600,
): Promise<StorageResult> {
  const path = getUserPhotoPath(userId, fileName);

  return supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(path, expiresIn);
}

export async function deletePhoto(
  supabase: PixoraSupabaseClient,
  userId: string,
  fileName: string,
): Promise<StorageResult> {
  const path = getUserPhotoPath(userId, fileName);

  return supabase.storage.from(PHOTOS_BUCKET).remove([path]);
}

export async function listUserPhotos(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<StorageResult> {
  return supabase.storage.from(PHOTOS_BUCKET).list(userId);
}
