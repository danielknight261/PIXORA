export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type TimestampFields = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
        } & TimestampFields;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          active: boolean;
        } & TimestampFields;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          name: string;
          description: string | null;
          base_price: number;
          image_url: string | null;
          active: boolean;
        } & TimestampFields;
        Insert: {
          id?: string;
          category_id: string;
          slug: string;
          name: string;
          description?: string | null;
          base_price: number;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          postcode: string;
          country: string;
          is_default: boolean;
        } & TimestampFields;
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          postcode: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      uploads: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          width: number | null;
          height: number | null;
        } & TimestampFields;
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          width?: number | null;
          height?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["uploads"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "uploads_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      designs: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          name: string;
          canvas_data: Json;
          preview_url: string | null;
          upload_id: string | null;
        } & TimestampFields;
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          name: string;
          canvas_data?: Json;
          preview_url?: string | null;
          upload_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["designs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "designs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "designs_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "designs_upload_id_fkey";
            columns: ["upload_id"];
            referencedRelation: "uploads";
            referencedColumns: ["id"];
          },
        ];
      };
      print_templates: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          surface_key: string;
          width_px: number;
          height_px: number;
          dpi: number;
          bleed_px: number;
          safe_zone_inset_px: number;
          mockup_image_url: string | null;
          mockup_print_area: Json | null;
          metadata: Json;
        } & TimestampFields;
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          surface_key?: string;
          width_px: number;
          height_px: number;
          dpi?: number;
          bleed_px?: number;
          safe_zone_inset_px?: number;
          mockup_image_url?: string | null;
          mockup_print_area?: Json | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["print_templates"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "print_templates_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          print_template_id: string;
          slug: string;
          name: string;
          price_delta: number;
          sort_order: number;
          active: boolean;
        } & TimestampFields;
        Insert: {
          id?: string;
          product_id: string;
          print_template_id: string;
          slug: string;
          name: string;
          price_delta?: number;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_print_template_id_fkey";
            columns: ["print_template_id"];
            referencedRelation: "print_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      fulfillment_mappings: {
        Row: {
          id: string;
          variant_id: string;
          provider: string;
          provider_product_id: string;
          provider_variant_id: string;
          print_area_key: string;
          raw_payload: Json;
          synced_at: string;
        } & TimestampFields;
        Insert: {
          id?: string;
          variant_id: string;
          provider: string;
          provider_product_id: string;
          provider_variant_id: string;
          print_area_key?: string;
          raw_payload?: Json;
          synced_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["fulfillment_mappings"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "fulfillment_mappings_variant_id_fkey";
            columns: ["variant_id"];
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          total_amount: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          shipping_address_id: string;
        } & TimestampFields;
        Insert: {
          id?: string;
          user_id: string;
          status?: OrderStatus;
          total_amount: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          shipping_address_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey";
            columns: ["shipping_address_id"];
            referencedRelation: "addresses";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          design_id: string | null;
          quantity: number;
          unit_price: number;
        } & TimestampFields;
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          design_id?: string | null;
          quantity: number;
          unit_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_design_id_fkey";
            columns: ["design_id"];
            referencedRelation: "designs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Upload = Database["public"]["Tables"]["uploads"]["Row"];
export type Design = Database["public"]["Tables"]["designs"]["Row"];
export type PrintTemplate = Database["public"]["Tables"]["print_templates"]["Row"];
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
export type FulfillmentMapping =
  Database["public"]["Tables"]["fulfillment_mappings"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
