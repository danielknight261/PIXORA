"use server";

import {
  createServerClient,
  createUploadRecord,
  getAuthUser,
  imageUploadService,
  isSupabaseConfigured,
} from "@pixora/api";
import type { Upload } from "@pixora/shared";
import { revalidatePath } from "next/cache";

export type UploadActionState = {
  error?: string;
  success?: string;
  upload?: Upload & { signedUrl: string | null };
};

async function requireUser() {
  if (!isSupabaseConfigured()) {
    throw new Error("Storage is not configured.");
  }

  const supabase = await createServerClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    throw new Error("Sign in to upload photos.");
  }

  return { supabase, user };
}

export async function registerUploadAction(input: {
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
}): Promise<UploadActionState> {
  try {
    const { supabase, user } = await requireUser();
    imageUploadService.assertOwnedPath(user.id, input.storagePath);

    const validation = imageUploadService.validate({
      name: input.fileName,
      type: input.mimeType,
      size: input.sizeBytes,
    });

    if (!validation.valid) {
      return { error: validation.error };
    }

    const upload = await createUploadRecord(supabase, {
      userId: user.id,
      storagePath: input.storagePath,
      fileName: input.fileName,
      mimeType: validation.mimeType,
      sizeBytes: input.sizeBytes,
      width: input.width ?? null,
      height: input.height ?? null,
    });

    const signedUrl = await imageUploadService.getSignedUrl(
      supabase,
      upload.storagePath,
    );

    revalidatePath("/uploads");

    return {
      success: "Photo uploaded successfully.",
      upload: { ...upload, signedUrl },
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to register upload.",
    };
  }
}

export async function listUploadsAction(): Promise<
  (Upload & { signedUrl: string | null })[]
> {
  const { supabase, user } = await requireUser();
  return imageUploadService.listUserUploads(supabase, user.id);
}

export async function deleteUploadAction(
  uploadId: string,
): Promise<UploadActionState> {
  try {
    const { supabase, user } = await requireUser();
    await imageUploadService.deleteUpload(supabase, user.id, uploadId);
    revalidatePath("/uploads");
    return { success: "Photo deleted." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete upload.",
    };
  }
}

export async function uploadImageServerAction(
  formData: FormData,
): Promise<UploadActionState> {
  try {
    const { supabase, user } = await requireUser();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { error: "No file provided." };
    }

    const widthRaw = formData.get("width");
    const heightRaw = formData.get("height");

    const result = await imageUploadService.uploadImage(supabase, user.id, {
      file,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      width: widthRaw ? Number(widthRaw) : null,
      height: heightRaw ? Number(heightRaw) : null,
    });

    revalidatePath("/uploads");

    return {
      success: "Photo uploaded successfully.",
      upload: {
        id: result.id,
        userId: user.id,
        storagePath: result.storagePath,
        fileName: result.fileName,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
        width: result.width,
        height: result.height,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        signedUrl: result.signedUrl,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}
