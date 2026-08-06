import type { CatalogProduct } from "../types/catalog";
import type { Category } from "../types/category";

const now = "2026-01-15T12:00:00.000Z";

export const mockCategories: Category[] = [
  {
    id: "cat-canvas",
    name: "Canvas Prints",
    slug: "canvas-prints",
    description:
      "Gallery-quality canvas wraps — turn your favourite photos into wall art.",
    imageUrl: null,
    sortOrder: 1,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-photo",
    name: "Photo Prints",
    slug: "photo-prints",
    description:
      "Professional photo prints in standard sizes, ready to frame or share.",
    imageUrl: null,
    sortOrder: 2,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-framed",
    name: "Framed Prints",
    slug: "framed-prints",
    description:
      "Ready-to-hang framed prints with premium mounts and finishes.",
    imageUrl: null,
    sortOrder: 3,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-mugs",
    name: "Mugs",
    slug: "mugs",
    description:
      "Personalised mugs for morning coffee, gifts, and everyday moments.",
    imageUrl: null,
    sortOrder: 4,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-calendars",
    name: "Calendars",
    slug: "calendars",
    description:
      "Custom photo calendars — a month-by-month celebration of your memories.",
    imageUrl: null,
    sortOrder: 5,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-phone",
    name: "Phone Cases",
    slug: "phone-cases",
    description:
      "Protect your phone with a design that's uniquely yours.",
    imageUrl: null,
    sortOrder: 6,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-books",
    name: "Photo Books",
    slug: "photo-books",
    description:
      "Premium hardcover and softcover photo books for life's big stories.",
    imageUrl: null,
    sortOrder: 7,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
];

type MockProductSeed = {
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  categorySlug: string;
  featured?: boolean;
};

const seeds: MockProductSeed[] = [
  // Canvas Prints
  {
    slug: "standard-canvas",
    name: "Standard Canvas Print",
    description:
      "30×40 cm gallery-wrap canvas with vibrant colour reproduction and a clean white edge.",
    basePrice: 2999,
    categorySlug: "canvas-prints",
    featured: true,
  },
  {
    slug: "large-canvas",
    name: "Large Canvas Print",
    description:
      "60×90 cm statement canvas — perfect for living rooms and feature walls.",
    basePrice: 4499,
    categorySlug: "canvas-prints",
    featured: true,
  },
  {
    slug: "panoramic-canvas",
    name: "Panoramic Canvas",
    description:
      "Wide-format panoramic canvas for landscapes, skylines, and group shots.",
    basePrice: 4999,
    categorySlug: "canvas-prints",
  },
  {
    slug: "split-panel-canvas",
    name: "Split Panel Canvas (3-piece)",
    description:
      "Three-panel triptych canvas set for a modern, gallery-style display.",
    basePrice: 5999,
    categorySlug: "canvas-prints",
  },
  // Photo Prints
  {
    slug: "standard-prints-pack",
    name: "Standard Photo Prints (12 pack)",
    description:
      "12 premium 6×4 inch prints on archival photo paper with accurate colour.",
    basePrice: 499,
    categorySlug: "photo-prints",
    featured: true,
  },
  {
    slug: "large-prints-pack",
    name: "Large Photo Prints (6 pack)",
    description:
      "Six 8×10 inch prints — ideal for albums, frames, and gifting.",
    basePrice: 899,
    categorySlug: "photo-prints",
  },
  {
    slug: "square-prints",
    name: "Square Photo Prints",
    description:
      "Instagram-ready 5×5 inch square prints with a matte finish.",
    basePrice: 699,
    categorySlug: "photo-prints",
  },
  {
    slug: "poster-print",
    name: "Poster Print A2",
    description:
      "A2 poster print on premium stock — bold colour for bedrooms and studios.",
    basePrice: 1299,
    categorySlug: "photo-prints",
  },
  // Framed Prints
  {
    slug: "classic-black-frame",
    name: "Classic Black Frame",
    description:
      "30×40 cm print in a sleek black frame with mount — ready to hang.",
    basePrice: 3499,
    categorySlug: "framed-prints",
    featured: true,
  },
  {
    slug: "natural-oak-frame",
    name: "Natural Oak Frame",
    description:
      "Warm oak frame with a white mount for a timeless, Scandinavian look.",
    basePrice: 3999,
    categorySlug: "framed-prints",
  },
  {
    slug: "gallery-white-frame",
    name: "Gallery White Frame",
    description:
      "Wide white gallery frame for a clean, contemporary finish.",
    basePrice: 3799,
    categorySlug: "framed-prints",
  },
  {
    slug: "multi-aperture-frame",
    name: "Multi Aperture Frame",
    description:
      "Four-opening collage frame — tell a story with your favourite moments.",
    basePrice: 4499,
    categorySlug: "framed-prints",
  },
  // Mugs
  {
    slug: "classic-mug",
    name: "Classic Photo Mug",
    description:
      "11 oz ceramic mug with full-wrap photo print, dishwasher safe.",
    basePrice: 1299,
    categorySlug: "mugs",
    featured: true,
  },
  {
    slug: "magic-mug",
    name: "Magic Heat-Reveal Mug",
    description:
      "Your photo appears when filled with hot liquid — a fun surprise gift.",
    basePrice: 1599,
    categorySlug: "mugs",
  },
  {
    slug: "travel-mug",
    name: "Insulated Travel Mug",
    description:
      "Double-wall stainless travel mug with personalised wrap design.",
    basePrice: 1999,
    categorySlug: "mugs",
  },
  {
    slug: "heart-handle-mug",
    name: "Heart Handle Mug",
    description:
      "Romantic heart-shaped handle mug — a favourite for Valentine's and anniversaries.",
    basePrice: 1499,
    categorySlug: "mugs",
  },
  // Calendars
  {
    slug: "wall-calendar",
    name: "A4 Wall Calendar",
    description:
      "12-month A4 wall calendar with a full-page photo for every month.",
    basePrice: 1999,
    categorySlug: "calendars",
    featured: true,
  },
  {
    slug: "desk-calendar",
    name: "Desk Calendar",
    description:
      "Compact flip desk calendar — great for offices and gift desks.",
    basePrice: 1499,
    categorySlug: "calendars",
  },
  {
    slug: "family-planner",
    name: "Family Planner Calendar",
    description:
      "Large family planner with spacious date boxes and a photo header each month.",
    basePrice: 2499,
    categorySlug: "calendars",
  },
  {
    slug: "premium-calendar",
    name: "Premium Linen Calendar",
    description:
      "Luxury linen-finish calendar with ribbon binding and gift box.",
    basePrice: 2999,
    categorySlug: "calendars",
  },
  // Phone Cases
  {
    slug: "slim-case",
    name: "Slim Photo Case",
    description:
      "Lightweight slim case with edge-to-edge photo print and raised camera lip.",
    basePrice: 1799,
    categorySlug: "phone-cases",
    featured: true,
  },
  {
    slug: "tough-case",
    name: "Tough Dual-Layer Case",
    description:
      "Shock-absorbing dual-layer case for extra drop protection.",
    basePrice: 2199,
    categorySlug: "phone-cases",
  },
  {
    slug: "clear-case",
    name: "Clear Photo Case",
    description:
      "Transparent case that showcases your photo while keeping your phone visible.",
    basePrice: 1899,
    categorySlug: "phone-cases",
  },
  {
    slug: "wallet-case",
    name: "Wallet Photo Case",
    description:
      "Flip wallet case with card slots and a full inside photo panel.",
    basePrice: 2499,
    categorySlug: "phone-cases",
  },
  // Photo Books
  {
    slug: "softcover-book",
    name: "Softcover Photo Book",
    description:
      "20-page softcover book with lay-flat binding and premium matte paper.",
    basePrice: 2499,
    categorySlug: "photo-books",
    featured: true,
  },
  {
    slug: "hardcover-book",
    name: "Hardcover Photo Book",
    description:
      "30-page hardcover book with dust jacket — perfect for weddings and holidays.",
    basePrice: 3499,
    categorySlug: "photo-books",
  },
  {
    slug: "luxury-layflat",
    name: "Luxury Layflat Album",
    description:
      "Professional layflat album with thick pages and a linen cover.",
    basePrice: 5999,
    categorySlug: "photo-books",
  },
  {
    slug: "mini-pocket-book",
    name: "Mini Pocket Photo Book",
    description:
      "Palm-sized 10-page book — an affordable gift for friends and family.",
    basePrice: 1299,
    categorySlug: "photo-books",
  },
];

const categoryBySlug = Object.fromEntries(
  mockCategories.map((c) => [c.slug, c]),
);

export const mockProducts: CatalogProduct[] = seeds.map((seed, index) => {
  const category = categoryBySlug[seed.categorySlug]!;
  return {
    id: `mock-${seed.categorySlug}-${seed.slug}`,
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    categoryId: category.id,
    category: category.name,
    categorySlug: seed.categorySlug,
    basePrice: seed.basePrice,
    imageUrl: null,
    active: true,
    createdAt: new Date(
      Date.parse(now) - index * 86400000,
    ).toISOString(),
    updatedAt: now,
    featured: seed.featured,
  };
});

/** Featured products for homepage best sellers */
export function getMockBestSellers(limit = 6): CatalogProduct[] {
  const featured = mockProducts.filter((p) => p.featured);
  return (featured.length >= limit ? featured : mockProducts).slice(0, limit);
}
