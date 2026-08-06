import type { Order, OrderStatus } from "@pixora/shared";
import { mapOrder } from "../mappers/rows";
import type { PixoraSupabaseClient } from "../types/client";

const orderSelect = `
  id,
  user_id,
  status,
  total_amount,
  currency,
  stripe_payment_intent_id,
  shipping_address_id,
  created_at,
  updated_at,
  addresses (
    id,
    user_id,
    full_name,
    address_line1,
    address_line2,
    city,
    postcode,
    country,
    is_default,
    created_at,
    updated_at
  )
`;

export async function getOrders(
  supabase: PixoraSupabaseClient,
  userId: string,
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapOrder(row));
}

export async function getOrderById(
  supabase: PixoraSupabaseClient,
  orderId: string,
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", orderId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapOrder(data);
}
