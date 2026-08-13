import {
  GELATO_PRODUCT_API_BASE,
  gelatoRequest,
} from "./http";
import type {
  GelatoCatalog,
  GelatoCatalogListResponse,
  GelatoProduct,
  GelatoProductSearchRequest,
  GelatoProductSearchResponse,
} from "./types";

export function createGelatoCatalogApi(apiKey: string) {
  return {
    async listCatalogs(): Promise<GelatoCatalog[]> {
      const response = await gelatoRequest<GelatoCatalogListResponse>(
        apiKey,
        GELATO_PRODUCT_API_BASE,
        "/v3/catalogs",
      );

      return Array.isArray(response) ? response : (response.data ?? []);
    },

    getCatalog(catalogUid: string): Promise<GelatoCatalog> {
      return gelatoRequest<GelatoCatalog>(
        apiKey,
        GELATO_PRODUCT_API_BASE,
        `/v3/catalogs/${encodeURIComponent(catalogUid)}`,
      );
    },

    searchProducts(
      catalogUid: string,
      request: GelatoProductSearchRequest = {},
    ): Promise<GelatoProductSearchResponse> {
      return gelatoRequest<GelatoProductSearchResponse>(
        apiKey,
        GELATO_PRODUCT_API_BASE,
        `/v3/catalogs/${encodeURIComponent(catalogUid)}/products:search`,
        {
          method: "POST",
          body: JSON.stringify({
            limit: request.limit ?? 50,
            offset: request.offset ?? 0,
            ...(request.attributeFilters
              ? { attributeFilters: request.attributeFilters }
              : {}),
          }),
        },
      );
    },

    getProduct(productUid: string): Promise<GelatoProduct> {
      return gelatoRequest<GelatoProduct>(
        apiKey,
        GELATO_PRODUCT_API_BASE,
        `/v3/products/${encodeURIComponent(productUid)}`,
      );
    },
  };
}

export type GelatoCatalogApi = ReturnType<typeof createGelatoCatalogApi>;
