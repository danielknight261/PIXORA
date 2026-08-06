import { createBrowserClient } from "@pixora/api/client/browser";
import {
  getUserPhotoPath,
  PHOTOS_BUCKET,
} from "@pixora/api/storage";
import { isSupabaseConfigured } from "@pixora/api/env";
import type { UploadImageResult } from "@pixora/api/storage/upload-service";
import {
  generateUniqueStorageFileName,
  validateImageFile,
} from "@pixora/shared";
import { registerUploadAction } from "@/features/uploads/actions";

export type ClientUploadProgress = {
  fileName: string;
  progress: number;
  status: "validating" | "uploading" | "registering" | "done" | "error";
  error?: string;
};

export async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  if (isHeic) {
    return null;
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Uploads directly to Supabase Storage from the browser (avoids Next.js body limits),
 * then registers metadata via a server action.
 */
export async function uploadImageFile(
  file: File,
  onProgress?: (state: ClientUploadProgress) => void,
): Promise<UploadImageResult> {
  onProgress?.({
    fileName: file.name,
    progress: 0,
    status: "validating",
  });

  if (!isSupabaseConfigured()) {
    throw new Error("Storage is not configured.");
  }

  const validation = validateImageFile(file);
  if (!validation.valid) {
    onProgress?.({
      fileName: file.name,
      progress: 0,
      status: "error",
      error: validation.error,
    });
    throw new Error(validation.error);
  }

  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in to upload photos.");
  }

  onProgress?.({
    fileName: file.name,
    progress: 10,
    status: "uploading",
  });

  const dimensions = await readImageDimensions(file);
  const storageFileName = generateUniqueStorageFileName(file.name);
  const storagePath = getUserPhotoPath(user.id, storageFileName);

  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(storagePath, file, {
      upsert: false,
      contentType: validation.mimeType,
      cacheControl: "3600",
    });

  if (uploadError) {
    onProgress?.({
      fileName: file.name,
      progress: 0,
      status: "error",
      error: uploadError.message,
    });
    throw new Error(uploadError.message);
  }

  onProgress?.({
    fileName: file.name,
    progress: 75,
    status: "registering",
  });

  const registered = await registerUploadAction({
    storagePath,
    fileName: file.name,
    mimeType: validation.mimeType,
    sizeBytes: file.size,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  });

  if (registered.error || !registered.upload) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    const message = registered.error ?? "Failed to register upload.";
    onProgress?.({
      fileName: file.name,
      progress: 0,
      status: "error",
      error: message,
    });
    throw new Error(message);
  }

  onProgress?.({
    fileName: file.name,
    progress: 100,
    status: "done",
  });

  return {
    id: registered.upload.id,
    storagePath: registered.upload.storagePath,
    signedUrl: registered.upload.signedUrl,
    fileName: registered.upload.fileName,
    mimeType: registered.upload.mimeType,
    sizeBytes: registered.upload.sizeBytes,
    width: registered.upload.width,
    height: registered.upload.height,
  };
}
