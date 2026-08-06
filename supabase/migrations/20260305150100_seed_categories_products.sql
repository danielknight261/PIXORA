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
  c.name || ' — Standard',
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
