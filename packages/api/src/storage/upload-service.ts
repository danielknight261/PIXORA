import {
  generateUniqueStorageFileName,
  PHOTOS_BUCKET,
  validateImageFile,
  type ImageFileLike,
} from "@pixora/shared";
import { createUploadRecord, deleteUploadRecord, getUploadById, getUploads } from "../queries/uploads";
import type { PixoraSupabaseClient } from "../types/client";
import { getUserPhotoPath } from "./client";

export type UploadImageInput = {
  file: File | Blob;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
};

export type UploadImageResult = {
  id: string;
  storagePath: string;
  signedUrl: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
};

export class ImageUploadService {
  validate(file: ImageFileLike) {
    return validateImageFile(file);
  }

  buildStoragePath(userId: string, storageFileName: string): string {
    return getUserPhotoPath(userId, storageFileName);
  }

  createStorageFileName(originalName: string): string {
    return generateUniqueStorageFileName(originalName);
  }

  assertOwnedPath(userId: string, storagePath: string): void {
    const prefix = `${userId}/`;
    if (!storagePath.startsWith(prefix) || storagePath.includes("..")) {
      throw new Error("Invalid storage path.");
    }
  }

  async uploadImage(
    supabase: PixoraSupabaseClient,
    userId: string,
    input: UploadImageInput,
  ): Promise<UploadImageResult> {
    const validation = this.validate({
      name: input.fileName,
      type: input.mimeType,
      size: input.sizeBytes,
    });

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const storageFileName = this.createStorageFileName(input.fileName);
    const storagePath = this.buildStoragePath(userId, storageFileName);

    const { error: uploadError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(storagePath, input.file, {
        upsert: false,
        contentType: validation.mimeType,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const record = await createUploadRecord(supabase, {
      userId,
      storagePath,
      fileName: input.fileName,
      mimeType: validation.mimeType,
      sizeBytes: input.sizeBytes,
      width: input.width ?? null,
      height: input.height ?? null,
    });

    const signedUrl = await this.getSignedUrl(supabase, storagePath);

    return {
      id: record.id,
      storagePath: record.storagePath,
      signedUrl,
      fileName: record.fileName,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      width: record.width,
      height: record.height,
    };
  }

  async getSignedUrl(
    supabase: PixoraSupabaseClient,
    storagePath: string,
    expiresIn = 3600,
  ): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      return null;
    }

    return data.signedUrl;
  }

  async listUserUploads(
    supabase: PixoraSupabaseClient,
    userId: string,
    expiresIn = 3600,
  ) {
    const uploads = await getUploads(supabase, userId);

    return Promise.all(
      uploads.map(async (upload) => ({
        ...upload,
        signedUrl: await this.getSignedUrl(supabase, upload.storagePath, expiresIn),
      })),
    );
  }

  async deleteUpload(
    supabase: PixoraSupabaseClient,
    userId: string,
    uploadId: string,
  ): Promise<void> {
    const upload = await getUploadById(supabase, uploadId, userId);
    if (!upload) {
      throw new Error("Upload not found.");
    }

    this.assertOwnedPath(userId, upload.storagePath);

    const { error: storageError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove([upload.storagePath]);

    if (storageError) {
      throw new Error(storageError.message);
    }

    await deleteUploadRecord(supabase, uploadId, userId);
  }
}

export const imageUploadService = new ImageUploadService();
