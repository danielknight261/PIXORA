export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  shippingAddressId: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  designId: string | null;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  country: string;
};
