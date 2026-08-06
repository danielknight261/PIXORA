import type { ProductCategory, OrderStatus } from "@pixora/shared";

type CategoryRow = {
  name: string;
};

type ProductRow = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  categories: CategoryRow | CategoryRow[] | null;
};

type AddressRow = {
  id: string;
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  shipping_address_id: string;
  created_at: string;
  updated_at: string;
  addresses: AddressRow | AddressRow[] | null;
};

export function mapProduct(row: ProductRow) {
  const category = Array.isArray(row.categories)
    ? row.categories[0]
    : row.categories;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    categoryId: row.category_id,
    category: (category?.name ?? "Photo Prints") as ProductCategory | string,
    basePrice: row.base_price,
    imageUrl: row.image_url,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAddress(row: AddressRow) {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    postcode: row.postcode,
    country: row.country,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrder(row: OrderRow) {
  const addressRow = Array.isArray(row.addresses)
    ? row.addresses[0]
    : row.addresses;

  const address = addressRow
    ? mapAddress(addressRow)
    : {
        fullName: "",
        addressLine1: "",
        addressLine2: null,
        city: "",
        postcode: "",
        country: "GB",
      };

  return {
    id: row.id,
    userId: row.user_id,
    status: row.status as OrderStatus,
    totalAmount: row.total_amount,
    currency: row.currency,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    shippingAddressId: row.shipping_address_id,
    shippingAddress: {
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      postcode: address.postcode,
      country: address.country,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type { ProductRow, AddressRow, OrderRow };
