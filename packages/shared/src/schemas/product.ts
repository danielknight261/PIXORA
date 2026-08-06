import { z } from "zod";
import { productCategories } from "../constants/products";

export const productSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(productCategories as unknown as [string, ...string[]]),
  basePrice: z.number().positive(),
  imageUrl: z.string().url().optional(),
  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
