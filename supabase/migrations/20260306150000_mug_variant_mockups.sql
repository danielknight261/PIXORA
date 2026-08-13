-- Per-variant mug print templates with correct mockup art (white vs black ceramic)

insert into public.print_templates (
  product_id,
  name,
  surface_key,
  width_px,
  height_px,
  dpi,
  bleed_px,
  safe_zone_inset_px,
  mockup_image_url,
  mockup_print_area,
  metadata
)
select
  p.id,
  v.name,
  v.slug,
  2480,
  1150,
  300,
  0,
  40,
  v.mockup_url,
  '{"x": 220, "y": 280, "width": 360, "height": 200}'::jsonb,
  jsonb_build_object(
    'mockupWidth', 800,
    'mockupHeight', 600,
    'variantSlug', v.slug,
    'productSlug', p.slug
  )
from public.products p
cross join (
  values
    ('11oz-white', '11 oz White wrap', '/mockups/mug-white.svg'),
    ('15oz-white', '15 oz White wrap', '/mockups/mug-white.svg'),
    ('11oz-black', '11 oz Black wrap', '/mockups/mug-black.svg')
) as v(slug, name, mockup_url)
where p.slug = 'mugs-standard'
on conflict (product_id, surface_key) do update set
  name = excluded.name,
  mockup_image_url = excluded.mockup_image_url,
  mockup_print_area = excluded.mockup_print_area,
  metadata = excluded.metadata,
  updated_at = now();

update public.product_variants pv
set
  print_template_id = pt.id,
  updated_at = now()
from public.products p,
public.print_templates pt
where p.id = pv.product_id
  and p.slug = 'mugs-standard'
  and pt.product_id = p.id
  and pt.surface_key = pv.slug
  and pv.slug in ('11oz-white', '15oz-white', '11oz-black');
