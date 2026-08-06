import { env } from "../env";

export type ProdigiOrderRequest = {
  merchantReference: string;
  shippingMethod: string;
  recipient: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      townOrCity: string;
      postalOrZipCode: string;
      countryCode: string;
    };
  };
  items: Array<{
    sku: string;
    copies: number;
    sizing: string;
    assets: Array<{ printArea: string; url: string }>;
  }>;
};

export type ProdigiOrderResponse = {
  outcome: "Created" | "ValidationFailed";
  order: { id: string; status: string } | null;
};

export function createProdigiClient(): {
  createOrder: (order: ProdigiOrderRequest) => Promise<ProdigiOrderResponse>;
} | null {
  if (!env.PRODIGI_API_KEY) {
    return null;
  }

  return {
    async createOrder(order: ProdigiOrderRequest): Promise<ProdigiOrderResponse> {
      // MVP stub — replace with Prodigi API integration
      console.info("[Prodigi stub] createOrder", order.merchantReference);
      return {
        outcome: "Created",
        order: { id: `prodigi_${Date.now()}`, status: "pending" },
      };
    },
  };
}
