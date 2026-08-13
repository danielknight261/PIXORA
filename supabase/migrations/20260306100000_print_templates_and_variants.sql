-- Print templates, product variants, and POD fulfillment mappings

-- ---------------------------------------------------------------------------
-- Print templates — defines canvas dimensions and mockup placement per product
-- ---------------------------------------------------------------------------

create table public.print_templates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  surface_key text not null default 'front',
  width_px integer not null,
  height_px integer not null,
  dpi integer not null default 300,
  bleed_px integer not null default 0,
  safe_zone_inset_px integer not null default 0,
  mockup_image_url text,
  mockup_print_area jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint print_templates_name_not_empty check (char_length(trim(name)) > 0),
  constraint print_templates_surface_key_not_empty check (char_length(trim(surface_key)) > 0),
  constraint print_templates_dimensions_positive check (width_px > 0 and height_px > 0),
  constraint print_templates_dpi_positive check (dpi > 0),
  constraint print_templates_bleed_non_negative check (bleed_px >= 0),
  constraint print_templates_safe_zone_non_negative check (safe_zone_inset_px >= 0),
  constraint print_templates_product_surface_unique unique (product_id, surface_key)
);

create index print_templates_product_id_idx on public.print_templates (product_id);

-- ---------------------------------------------------------------------------
-- Product variants — size/finish options linked to a print template
-- ---------------------------------------------------------------------------

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  print_template_id uuid not null references public.print_templates (id) on delete restrict,
  slug text not null,
  name text not null,
  price_delta integer not null default 0,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint product_variants_name_not_empty check (char_length(trim(name)) > 0),
  constraint product_variants_product_slug_unique unique (product_id, slug)
);

create index product_variants_product_id_idx on public.product_variants (product_id);
create index product_variants_print_template_id_idx on public.product_variants (print_template_id);

-- ---------------------------------------------------------------------------
-- Fulfillment mappings — POD provider SKU linkage (populated during sync)
-- ---------------------------------------------------------------------------

create table public.fulfillment_mappings (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  provider text not null,
  provider_product_id text not null,
  provider_variant_id text not null,
  print_area_key text not null default 'default',
  raw_payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fulfillment_mappings_provider_check
    check (provider in ('gelato', 'prodigi', 'printful')),
  constraint fulfillment_mappings_variant_provider_unique
    unique (variant_id, provider, print_area_key)
);

create index fulfillment_mappings_variant_id_idx on public.fulfillment_mappings (variant_id);
create index fulfillment_mappings_provider_idx on public.fulfillment_mappings (provider);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger print_templates_set_updated_at
  before update on public.print_templates
  for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger fulfillment_mappings_set_updated_at
  before update on public.fulfillment_mappings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.print_templates enable row level security;
alter table public.product_variants enable row level security;
alter table public.fulfillment_mappings enable row level security;

-- Print templates & variants: readable when parent product is active
create policy "Print templates for active products are publicly readable"
  on public.print_templates for select
  using (
    exists (
      select 1 from public.products p
      where p.id = print_templates.product_id and p.active = true
    )
  );

create policy "Active product variants are publicly readable"
  on public.product_variants for select
  using (
    active = true
    and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id and p.active = true
    )
  );

-- Fulfillment mappings: service role only (no public/authenticated policies)

-- ---------------------------------------------------------------------------
-- Seed manual print templates for MVP editor products
-- ---------------------------------------------------------------------------

insert into public.print_templates (
  product_id,
  name,
  surface_key,
  width_px,
  height_px,
  dpi,
  bleed_px,
  safe_zone_inset_px,
  mockup_print_area,
  metadata
)
select
  p.id,
  'Standard print area',
  'front',
  case p.slug
    when 'canvas-prints-standard' then 3600
    when 'mugs-standard' then 2480
    else 2400
  end,
  case p.slug
    when 'canvas-prints-standard' then 3600
    when 'mugs-standard' then 1150
    else 2400
  end,
  300,
  case p.slug when 'canvas-prints-standard' then 90 else 0 end,
  case p.slug when 'canvas-prints-standard' then 120 else 40 end,
  case p.slug
    when 'canvas-prints-standard' then '{"x": 180, "y": 120, "width": 640, "height": 640}'::jsonb
    when 'mugs-standard' then '{"x": 220, "y": 280, "width": 360, "height": 200}'::jsonb
    else '{"x": 0, "y": 0, "width": 800, "height": 800}'::jsonb
  end,
  jsonb_build_object('seed', true, 'productSlug', p.slug)
from public.products p
where p.slug in ('canvas-prints-standard', 'mugs-standard', 'photo-prints-standard')
on conflict (product_id, surface_key) do nothing;

-- Default variant per seeded product (links to its print template)
insert into public.product_variants (
  product_id,
  print_template_id,
  slug,
  name,
  price_delta,
  sort_order,
  active
)
select
  pt.product_id,
  pt.id,
  'standard',
  'Standard',
  0,
  0,
  true
from public.print_templates pt
join public.products p on p.id = pt.product_id
where p.slug in ('canvas-prints-standard', 'mugs-standard', 'photo-prints-standard')
on conflict (product_id, slug) do nothing;
