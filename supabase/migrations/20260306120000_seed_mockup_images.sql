-- Seed mockup image URLs and reference dimensions for MVP products

update public.print_templates pt
set
  mockup_image_url = case p.slug
    when 'canvas-prints-standard' then '/mockups/canvas-wrap.svg'
    when 'mugs-standard' then '/mockups/mug-white.svg'
    when 'photo-prints-standard' then '/mockups/photo-print.svg'
    else '/mockups/photo-print.svg'
  end,
  metadata = coalesce(pt.metadata, '{}'::jsonb) || case p.slug
    when 'canvas-prints-standard' then '{"mockupWidth": 1000, "mockupHeight": 1000}'::jsonb
    when 'mugs-standard' then '{"mockupWidth": 800, "mockupHeight": 600}'::jsonb
    else '{"mockupWidth": 800, "mockupHeight": 800}'::jsonb
  end
from public.products p
where p.id = pt.product_id
  and p.slug in ('canvas-prints-standard', 'mugs-standard', 'photo-prints-standard');
