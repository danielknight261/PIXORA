-- Simple Gelato starter sizes: canvas, mugs, photo prints with explicit size variants

-- Deactivate legacy single "standard" variants (replaced by sized variants)
update public.product_variants pv
set active = false, updated_at = now()
from public.products p
where p.id = pv.product_id
  and p.slug in ('canvas-prints-standard', 'mugs-standard', 'photo-prints-standard')
  and pv.slug = 'standard';

-- ---------------------------------------------------------------------------
-- Canvas — 12×12, 11×14, 16×20 (slim wrap, horizontal)
-- ---------------------------------------------------------------------------

insert into public.print_templates (
  product_id, name, surface_key, width_px, height_px, dpi, bleed_px, safe_zone_inset_px, mockup_print_area, metadata
)
select p.id, '12×12 inch', '12x12', 3600, 3600, 300, 90, 120,
  '{"x": 180, "y": 120, "width": 640, "height": 640}'::jsonb,
  jsonb_build_object('gelatoSize', '12x12', 'productSlug', p.slug)
from public.products p where p.slug = 'canvas-prints-standard'
on conflict (product_id, surface_key) do nothing;

insert into public.print_templates (
  product_id, name, surface_key, width_px, height_px, dpi, bleed_px, safe_zone_inset_px, mockup_print_area, metadata
)
select p.id, '11×14 inch', '11x14', 3300, 4200, 300, 90, 120,
  '{"x": 180, "y": 120, "width": 640, "height": 640}'::jsonb,
  jsonb_build_object('gelatoSize', '11x14', 'productSlug', p.slug)
from public.products p where p.slug = 'canvas-prints-standard'
on conflict (product_id, surface_key) do nothing;

insert into public.print_templates (
  product_id, name, surface_key, width_px, height_px, dpi, bleed_px, safe_zone_inset_px, mockup_print_area, metadata
)
select p.id, '16×20 inch', '16x20', 4800, 6000, 300, 90, 120,
  '{"x": 180, "y": 120, "width": 640, "height": 640}'::jsonb,
  jsonb_build_object('gelatoSize', '16x20', 'productSlug', p.slug)
from public.products p where p.slug = 'canvas-prints-standard'
on conflict (product_id, surface_key) do nothing;

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '12x12', '12×12 inch', 0, 0, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = '12x12'
where p.slug = 'canvas-prints-standard'
on conflict (product_id, slug) do update set active = true, print_template_id = excluded.print_template_id, sort_order = 0;

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '11x14', '11×14 inch', 0, 1, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = '11x14'
where p.slug = 'canvas-prints-standard'
on conflict (product_id, slug) do update set active = true, print_template_id = excluded.print_template_id;

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '16x20', '16×20 inch', 2000, 2, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = '16x20'
where p.slug = 'canvas-prints-standard'
on conflict (product_id, slug) do update set active = true, print_template_id = excluded.print_template_id;

-- ---------------------------------------------------------------------------
-- Mugs — 11 oz white, 15 oz white, 11 oz black (shared wrap template)
-- ---------------------------------------------------------------------------

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '11oz-white', '11 oz White Ceramic', 0, 0, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = 'front'
where p.slug = 'mugs-standard'
on conflict (product_id, slug) do update set active = true, sort_order = 0;

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '15oz-white', '15 oz White Ceramic', 300, 1, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = 'front'
where p.slug = 'mugs-standard'
on conflict (product_id, slug) do update set active = true, sort_order = 1;

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '11oz-black', '11 oz Black Ceramic', 0, 2, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = 'front'
where p.slug = 'mugs-standard'
on conflict (product_id, slug) do update set active = true, sort_order = 2;

-- ---------------------------------------------------------------------------
-- Photo prints — 5×7, 8×10
-- ---------------------------------------------------------------------------

insert into public.print_templates (
  product_id, name, surface_key, width_px, height_px, dpi, bleed_px, safe_zone_inset_px, mockup_print_area, metadata
)
select p.id, '5×7 inch', '5x7', 1500, 2100, 300, 0, 40,
  '{"x": 0, "y": 0, "width": 800, "height": 800}'::jsonb,
  jsonb_build_object('gelatoSize', '5x7', 'productSlug', p.slug)
from public.products p where p.slug = 'photo-prints-standard'
on conflict (product_id, surface_key) do nothing;

insert into public.print_templates (
  product_id, name, surface_key, width_px, height_px, dpi, bleed_px, safe_zone_inset_px, mockup_print_area, metadata
)
select p.id, '8×10 inch', '8x10', 2400, 3000, 300, 0, 40,
  '{"x": 0, "y": 0, "width": 800, "height": 800}'::jsonb,
  jsonb_build_object('gelatoSize', '8x10', 'productSlug', p.slug)
from public.products p where p.slug = 'photo-prints-standard'
on conflict (product_id, surface_key) do nothing;

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '5x7', '5×7 inch', 0, 0, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = '5x7'
where p.slug = 'photo-prints-standard'
on conflict (product_id, slug) do update set active = true, print_template_id = excluded.print_template_id, sort_order = 0;

insert into public.product_variants (product_id, print_template_id, slug, name, price_delta, sort_order, active)
select p.id, pt.id, '8x10', '8×10 inch', 200, 1, true
from public.products p
join public.print_templates pt on pt.product_id = p.id and pt.surface_key = '8x10'
where p.slug = 'photo-prints-standard'
on conflict (product_id, slug) do update set active = true, print_template_id = excluded.print_template_id, sort_order = 1;
