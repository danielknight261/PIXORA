# Pixora Supabase Setup (Free Tier)

Pixora uses [Supabase Free Tier](https://supabase.com/pricing) — sufficient for MVP auth, database, and photo storage.

## What's included

| Migration | Contents |
|-----------|----------|
| `20260305140000_init_auth_profiles_storage.sql` | `profiles`, auth trigger, `photos` storage bucket + RLS |
| `20260305150000_core_commerce_schema.sql` | `categories`, `products`, `addresses`, `uploads`, `designs`, `orders`, `order_items` |
| `20260305150100_seed_categories_products.sql` | MVP categories + starter products |

## Database schema

```
profiles ──┬── addresses ──┐
           ├── uploads     │
           ├── designs ────┼── order_items
           └── orders ─────┘
categories ── products ── designs
                └── order_items
uploads ── designs (optional source photo)
```

All tables include `id` (UUID PK), `created_at`, and `updated_at` (auto-maintained via trigger).

## Apply migrations

Migrations are **applied** to project `recmiweyycnvvlglatrb` (March 2026).

To re-apply on a fresh project:

```bash
npx supabase db push --db-url "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

Or paste `supabase/APPLY_ALL.sql` in the [SQL Editor](https://supabase.com/dashboard/project/recmiweyycnvvlglatrb/sql/new).

## Environment variables

Copy to `apps/web/.env.local` (already configured for project `recmiweyycnvvlglatrb`):

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://recmiweyycnvvlglatrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Auth setup (from previous task)

1. **Authentication → Providers**: Enable Email + Google
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. Google OAuth: add redirect URI `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## What to set up next

1. **Auth providers** — enable Email (+ Google) in Supabase Dashboard; set Site URL to `http://localhost:3000` and redirect to `http://localhost:3000/auth/callback`
2. **Verify auth** — register and login at http://localhost:3000
3. **Photo upload flow** — upload to storage bucket + insert `uploads` row via `createUploadRecord()`
4. **Editor MVP** — save/load `designs.canvas_data` (Fabric.js)
5. **Checkout** — create `addresses`, `orders`, `order_items` + Stripe integration
6. **Admin app** — product/order management using service role client

Catalog pages (`/`, `/products`, `/products/[slug]`) load categories and products from the database.

## Storage

Photos are stored in the private `photos` bucket under `{user_id}/{filename}`.
The `uploads` table stores metadata linked to each file.

## RLS summary

| Table | Access |
|-------|--------|
| `categories`, `products` | Public read (active only) |
| `profiles`, `addresses`, `uploads`, `designs`, `orders`, `order_items` | Owner only (authenticated) |

Admin write access for catalog management will use the service role key server-side.
