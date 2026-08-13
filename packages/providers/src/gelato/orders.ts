import { GELATO_ORDER_API_BASE, gelatoRequest } from "./http";
import type { GelatoOrderRequest, GelatoOrderResponse } from "./types";

export function createGelatoOrdersApi(apiKey: string) {
  return {
    createOrder(order: GelatoOrderRequest): Promise<GelatoOrderResponse> {
      return gelatoRequest<GelatoOrderResponse>(
        apiKey,
        GELATO_ORDER_API_BASE,
        "/v4/orders",
        {
          method: "POST",
          body: JSON.stringify({
            orderType: order.orderType ?? "order",
            ...order,
          }),
        },
      );
    },
  };
}

export type GelatoOrdersApi = ReturnType<typeof createGelatoOrdersApi>;
