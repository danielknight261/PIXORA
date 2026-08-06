import { env } from "../env";

export type GelatoOrderRequest = {
  orderReferenceId: string;
  customerReferenceId: string;
  items: Array<{
    itemReferenceId: string;
    productUid: string;
    files: Array<{ type: string; url: string }>;
    quantity: number;
  }>;
  shipmentMethodUid: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    postCode: string;
    country: string;
  };
};

export type GelatoOrderResponse = {
  id: string;
  status: string;
};

export function createGelatoClient(): {
  createOrder: (order: GelatoOrderRequest) => Promise<GelatoOrderResponse>;
} | null {
  if (!env.GELATO_API_KEY) {
    return null;
  }

  return {
    async createOrder(order: GelatoOrderRequest): Promise<GelatoOrderResponse> {
      // MVP stub — replace with Gelato API integration
      console.info("[Gelato stub] createOrder", order.orderReferenceId);
      return {
        id: `gelato_${Date.now()}`,
        status: "pending",
      };
    },
  };
}
