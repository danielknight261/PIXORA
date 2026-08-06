export type Address = {
  id: string;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
