# Pixora

Turn Moments Into Keepsakes — photo personalization, powered by **Shopify + Gelato**.

## Production storefront

| Piece | Location |
|-------|----------|
| Storefront theme | [`apps/shopify-theme`](apps/shopify-theme) (Liquid) |
| Personalization + mockups | Gelato Personalization Studio on Shopify |
| Fulfilment | Gelato Shopify app |
| Migration runbook | [`docs/shopify-gelato-migration.md`](docs/shopify-gelato-migration.md) |
| Product publish guide | [`docs/shopify-product-publish.md`](docs/shopify-product-publish.md) |

```bash
# Push theme (requires Shopify CLI + store access)
cd apps/shopify-theme
shopify theme push --store YOUR-STORE.myshopify.com
```

## Legacy monorepo apps

| Workspace | Status |
|-----------|--------|
| `apps/web` | Redirect-only → `NEXT_PUBLIC_SHOPIFY_STORE_URL` |
| `apps/admin` | Internal notes; Gelato catalog sync **retired** |
| `apps/mobile` | Unchanged / not production storefront |
| `packages/*` | Shared libs (archived relative to commerce) |

## Getting started (theme)

1. Create/connect Shopify store + install Gelato ([runbook](docs/shopify-gelato-migration.md)).
2. Enable **Gelato Personalizer** app embed in the theme editor.
3. `shopify theme push` from `apps/shopify-theme`.
4. Publish canvas + mug products from Gelato → Shopify.
5. Cut over DNS when ready.

## Scripts

- `pnpm dev` — Starts remaining Next apps (web redirects; admin optional)
- `pnpm build` / `pnpm lint` / `pnpm typecheck`

The Fabric editor and Pixora mockup compositor have been **removed**.
