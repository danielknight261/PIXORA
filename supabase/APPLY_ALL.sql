-- =============================================================================
-- Pixora: apply full database schema (run once)
-- Open: https://supabase.com/dashboard/project/recmiweyycnvvlglatrb/sql/new
-- Paste this entire file and click Run.
-- =============================================================================

-- Pixora initial schema: profiles + photo storage (Supabase free tier compatible)

-- Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile when a user registers (email or OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Photo storage bucket (private â€” users access only their own folder)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

drop policy if exists "Users can upload own photos" on storage.objects;
drop policy if exists "Users can view own photos" on storage.objects;
drop policy if exists "Users can update own photos" on storage.objects;
drop policy if exists "Users can delete own photos" on storage.objects;

create policy "Users can upload own photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
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
-- Uploads (photo metadata â€” files live in storage bucket)
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
-- Seed MVP product categories (from MASTER_CONTEXT.md)
-- Safe to re-run: uses ON CONFLICT DO NOTHING

insert into public.categories (name, slug, description, sort_order, active)
values
  (
    'Canvas Prints',
    'canvas-prints',
    'Turn your photos into gallery-quality canvas wall art.',
    1,
    true
  ),
  (
    'Photo Prints',
    'photo-prints',
    'Classic photo prints in a range of sizes.',
    2,
    true
  ),
  (
    'Framed Prints',
    'framed-prints',
    'Photos beautifully framed and ready to hang.',
    3,
    true
  ),
  (
    'Mugs',
    'mugs',
    'Personalised mugs for everyday keepsakes.',
    4,
    true
  ),
  (
    'Calendars',
    'calendars',
    'Custom photo calendars for the year ahead.',
    5,
    true
  ),
  (
    'Phone Cases',
    'phone-cases',
    'Protect your phone with a personal design.',
    6,
    true
  ),
  (
    'Photo Books',
    'photo-books',
    'Premium photo books to preserve your memories.',
    7,
    true
  )
on conflict (slug) do nothing;

-- Starter products (one per category)
insert into public.products (category_id, slug, name, description, base_price, active)
select
  c.id,
  c.slug || '-standard',
  c.name || ' â€” Standard',
  'Personalise this ' || lower(c.name) || ' with your own photo.',
  case c.slug
    when 'canvas-prints' then 2999
    when 'photo-prints' then 499
    when 'framed-prints' then 3499
    when 'mugs' then 1299
    when 'calendars' then 1999
    when 'phone-cases' then 1799
    when 'photo-books' then 2499
    else 999
  end,
  true
from public.categories c
where c.active = true
on conflict (slug) do nothing;
