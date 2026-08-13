export type GelatoCatalog = {
  catalogUid: string;
  title: string;
  productAttributes?: unknown[];
};

export type GelatoCatalogListResponse =
  | GelatoCatalog[]
  | { data: GelatoCatalog[] };

export type GelatoProductAttribute = Record<string, string | number | boolean>;

export type GelatoMeasureUnit = {
  value: number;
  measureUnit: string;
};

export type GelatoProduct = {
  productUid: string;
  attributes: GelatoProductAttribute;
  weight?: GelatoMeasureUnit;
  dimensions?: Record<string, GelatoMeasureUnit | { value: string | number; measureUnit: string }>;
  supportedCountries?: string[];
  isPrintable?: boolean;
};

export type GelatoProductSearchRequest = {
  attributeFilters?: Record<string, string[]>;
  limit?: number;
  offset?: number;
};

export type GelatoProductSearchResponse = {
  products: GelatoProduct[];
  hits?: Record<string, unknown>;
};

export type GelatoOrderFile = {
  type: string;
  url: string;
};

export type GelatoShippingAddress = {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  country: string;
  state?: string;
  email?: string;
  phone?: string;
  companyName?: string;
};

export type GelatoOrderRequest = {
  orderReferenceId: string;
  customerReferenceId: string;
  currency: string;
  items: Array<{
    itemReferenceId: string;
    productUid: string;
    files: GelatoOrderFile[];
    quantity: number;
  }>;
  shipmentMethodUid?: string;
  shippingAddress: GelatoShippingAddress;
  orderType?: "order" | "draft";
};

export type GelatoOrderResponse = {
  id: string;
  orderReferenceId?: string;
  fulfillmentStatus?: string;
  financialStatus?: string;
  status?: string;
};
