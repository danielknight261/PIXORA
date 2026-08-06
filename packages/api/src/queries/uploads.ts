import type { Upload } from "@pixora/shared";
import type { PixoraSupabaseClient } from "../types/client";

function mapUpload(row: {
  id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
}): Upload {
  return {
    id: row.id,
    userId: row.user_id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUploads(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<Upload[]> {
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapUpload);
}

export async function getUploadById(
  supabase: PixoraSupabaseClient,
  uploadId: string,
  userId: string,
): Promise<Upload | null> {
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .eq("id", uploadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapUpload(data) : null;
}

export async function createUploadRecord(
  supabase: PixoraSupabaseClient,
  input: {
    userId: string;
    storagePath: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    width?: number | null;
    height?: number | null;
  },
): Promise<Upload> {
  const { data, error } = await supabase
    .from("uploads")
    .insert({
      user_id: input.userId,
      storage_path: input.storagePath,
      file_name: input.fileName,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      width: input.width ?? null,
      height: input.height ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    userId: data.user_id,
    storagePath: data.storage_path,
    fileName: data.file_name,
    mimeType: data.mime_type,
    sizeBytes: data.size_bytes,
    width: data.width,
    height: data.height,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteUploadRecord(
  supabase: PixoraSupabaseClient,
  uploadId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("uploads")
    .delete()
    .eq("id", uploadId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
