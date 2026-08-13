export type MockupPoint = {
  x: number;
  y: number;
};

export type MockupWarpMode = "rect" | "quad" | "cylinder";

export type MockupQuad = {
  tl: MockupPoint;
  tr: MockupPoint;
  br: MockupPoint;
  bl: MockupPoint;
};

export type MockupCylinder = {
  /** Horizontal bulge amount (0–0.45). Higher = more cylindrical. */
  bulge?: number;
};

export type MockupSpec = {
  width: number;
  height: number;
  warp: MockupWarpMode;
  /** Bounding box that contains the print area before warp fitting. */
  frame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  maskUrl?: string | null;
  overlayUrl?: string | null;
  quad?: MockupQuad | null;
  cylinder?: MockupCylinder | null;
};
