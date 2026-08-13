import { z } from "zod";

export const mockupPrintAreaSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().optional(),
});

export const canvasDataSchema = z.object({
  version: z.number().int().positive(),
  fabric: z.record(z.unknown()),
  templateId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  displayScale: z.number().positive().optional(),
  meta: z
    .object({
      lastSavedAt: z.string().optional(),
      editorVersion: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const designInputSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  canvasData: canvasDataSchema.or(z.record(z.unknown())),
  previewUrl: z.string().url().nullable().optional(),
  uploadId: z.string().uuid().nullable().optional(),
});

export const designUpdateSchema = designInputSchema.partial().extend({
  id: z.string().uuid(),
});

export type CanvasData = z.infer<typeof canvasDataSchema>;
export type DesignInput = z.infer<typeof designInputSchema>;
export type DesignUpdateInput = z.infer<typeof designUpdateSchema>;
