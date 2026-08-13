import { env } from "../env";
import { createGelatoCatalogApi } from "./catalog";
import { createGelatoOrdersApi } from "./orders";

export type GelatoClient = {
  catalog: ReturnType<typeof createGelatoCatalogApi>;
  orders: ReturnType<typeof createGelatoOrdersApi>;
};

export function createGelatoClient(): GelatoClient | null {
  if (!env.GELATO_API_KEY) {
    return null;
  }

  const apiKey = env.GELATO_API_KEY;

  return {
    catalog: createGelatoCatalogApi(apiKey),
    orders: createGelatoOrdersApi(apiKey),
  };
}

export { GelatoApiError } from "./http";
export type {
  GelatoCatalog,
  GelatoOrderFile,
  GelatoOrderRequest,
  GelatoOrderResponse,
  GelatoProduct,
  GelatoProductSearchRequest,
  GelatoProductSearchResponse,
  GelatoShippingAddress,
} from "./types";
