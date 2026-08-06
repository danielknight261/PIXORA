-- Pixora core commerce schema
-- Depends on: 20260305140000_init_auth_profiles_storage.sql

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_unique unique (slug),
  constraint categories_name_not_empty check (char_length(trim(name)) > 0)
);

create index categories_active_sort_idx on public.categories (active, sort_order);
create index categories_slug_idx on public.categories (slug);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text not null,
  name text not null,
  description text,
  base_price integer not null,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_unique unique (slug),
  constraint products_name_not_empty check (char_length(trim(name)) > 0),
  constraint products_base_price_non_negative check (base_price >= 0)
);

create index products_category_id_idx on public.products (category_id);
create index products_slug_idx on public.products (slug);
create index products_active_idx on public.products (active);
create index products_category_active_idx on public.products (category_id, active);

-- ---------------------------------------------------------------------------
-- Addresses
-- ---------------------------------------------------------------------------

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  postcode text not null,
  country text not null default 'GB',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint addresses_full_name_not_empty check (char_length(trim(full_name)) > 0),
  constraint addresses_line1_not_empty check (char_length(trim(address_line1)) > 0)
);

create index addresses_user_id_idx on public.addresses (user_id);
create index addresses_user_default_idx on public.addresses (user_id, is_default);

-- ---------------------------------------------------------------------------
-- Uploads (photo metadata — files live in storage bucket)
-- ---------------------------------------------------------------------------

create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uploads_storage_path_unique unique (user_id, storage_path),
  constraint uploads_size_non_negative check (size_bytes >= 0)
);

create index uploads_user_id_idx on public.uploads (user_id);
create index uploads_created_at_idx on public.uploads (created_at desc);

-- ---------------------------------------------------------------------------
-- Designs
-- ---------------------------------------------------------------------------

create table public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  name text not null,
  canvas_data jsonb not null default '{}'::jsonb,
  preview_url text,
  upload_id uuid references public.uploads (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint designs_name_not_empty check (char_length(trim(name)) > 0)
);

create index designs_user_id_idx on public.designs (user_id);
create index designs_product_id_idx on public.designs (product_id);
create index designs_user_updated_idx on public.designs (user_id, updated_at desc);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  status public.order_status not null default 'pending',
  total_amount integer not null,
  currency text not null default 'GBP',
  stripe_payment_intent_id text,
  shipping_address_id uuid not null references public.addresses (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_amount_non_negative check (total_amount >= 0),
  constraint orders_currency_not_empty check (char_length(trim(currency)) > 0)
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_stripe_payment_intent_idx on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- ---------------------------------------------------------------------------
-- Order items
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  design_id uuid references public.designs (id) on delete set null,
  quantity integer not null,
  unit_price integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_price_non_negative check (unit_price >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
create index order_items_design_id_idx on public.order_items (design_id)
  where design_id is not null;

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuses public.set_updated_at from init migration)
-- ---------------------------------------------------------------------------

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create trigger uploads_set_updated_at
  before update on public.uploads
  for each row execute function public.set_updated_at();

create trigger designs_set_updated_at
  before update on public.designs
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger order_items_set_updated_at
  before update on public.order_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.uploads enable row level security;
alter table public.designs enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Categories & products: public read for active catalog
create policy "Active categories are publicly readable"
  on public.categories for select
  using (active = true);

create policy "Active products are publicly readable"
  on public.products for select
  using (active = true);

-- Addresses: owner only
create policy "Users can view own addresses"
  on public.addresses for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own addresses"
  on public.addresses for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own addresses"
  on public.addresses for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own addresses"
  on public.addresses for delete to authenticated
  using (auth.uid() = user_id);

-- Uploads: owner only
create policy "Users can view own uploads"
  on public.uploads for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own uploads"
  on public.uploads for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own uploads"
  on public.uploads for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own uploads"
  on public.uploads for delete to authenticated
  using (auth.uid() = user_id);

-- Designs: owner only
create policy "Users can view own designs"
  on public.designs for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own designs"
  on public.designs for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own designs"
  on public.designs for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own designs"
  on public.designs for delete to authenticated
  using (auth.uid() = user_id);

-- Orders: owner only
create policy "Users can view own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Order items: readable/writable via parent order ownership
create policy "Users can view own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Users can update own order items"
  on public.order_items for update to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Users can delete own order items"
  on public.order_items for delete to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
