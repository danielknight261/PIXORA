export const GELATO_PRODUCT_API_BASE = "https://product.gelatoapis.com";
export const GELATO_ORDER_API_BASE = "https://order.gelatoapis.com";

export class GelatoApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown = null) {
    super(message);
    this.name = "GelatoApiError";
    this.status = status;
    this.body = body;
  }
}

export async function gelatoRequest<T>(
  apiKey: string,
  baseUrl: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("X-API-KEY", apiKey);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
        ? body.message
        : `Gelato API request failed (${response.status})`;

    throw new GelatoApiError(response.status, message, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
