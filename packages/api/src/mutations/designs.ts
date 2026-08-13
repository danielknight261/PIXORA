import type { Design, DesignInput } from "@pixora/shared";
import { mapDesign } from "../mappers/print-templates";
import type { PixoraSupabaseClient } from "../types/client";

type UpsertDesignDraftInput = DesignInput & {
  id?: string;
};

export async function createDesign(
  supabase: PixoraSupabaseClient,
  userId: string,
  input: DesignInput,
): Promise<Design> {
  const { data, error } = await supabase
    .from("designs")
    .insert({
      user_id: userId,
      product_id: input.productId,
      name: input.name,
      canvas_data: input.canvasData,
      preview_url: input.previewUrl ?? null,
      upload_id: input.uploadId ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDesign(data);
}

export async function updateDesign(
  supabase: PixoraSupabaseClient,
  userId: string,
  designId: string,
  input: Partial<DesignInput>,
): Promise<Design> {
  const patch: Record<string, unknown> = {};

  if (input.productId !== undefined) patch.product_id = input.productId;
  if (input.name !== undefined) patch.name = input.name;
  if (input.canvasData !== undefined) patch.canvas_data = input.canvasData;
  if (input.previewUrl !== undefined) patch.preview_url = input.previewUrl;
  if (input.uploadId !== undefined) patch.upload_id = input.uploadId;

  const { data, error } = await supabase
    .from("designs")
    .update(patch)
    .eq("id", designId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDesign(data);
}

export async function upsertDesignDraft(
  supabase: PixoraSupabaseClient,
  userId: string,
  input: UpsertDesignDraftInput,
): Promise<Design> {
  if (input.id) {
    return updateDesign(supabase, userId, input.id, input);
  }

  return createDesign(supabase, userId, input);
}

export async function deleteDesign(
  supabase: PixoraSupabaseClient,
  userId: string,
  designId: string,
): Promise<void> {
  const { error } = await supabase
    .from("designs")
    .delete()
    .eq("id", designId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
