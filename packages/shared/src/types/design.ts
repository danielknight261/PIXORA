import type { Design } from "./product";

export type DesignWithProduct = Design & {
  productSlug: string;
  productName: string;
  previewSignedUrl: string | null;
};

export type SaveDesignState = "idle" | "dirty" | "saving" | "saved" | "error";
