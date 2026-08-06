export const productCategories = [
  "Canvas Prints",
  "Photo Prints",
  "Framed Prints",
  "Mugs",
  "Calendars",
  "Phone Cases",
  "Photo Books",
] as const;

export type ProductCategory = (typeof productCategories)[number];
