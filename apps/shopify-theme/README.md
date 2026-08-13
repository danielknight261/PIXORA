# Pixora Shopify Theme

Liquid theme for the Pixora storefront (Shopify + Gelato Personalization Studio).

## Brand

- Primary: `#2563EB`
- Dark: `#0F172A`
- Light: `#F8FAFC`
- Accent: `#60A5FA`
- Tagline: Turn Moments Into Keepsakes

## Gelato hooks

- `snippets/gelato-customization.liquid` — required `data-gelato-customization` marker
- Product form Add to Cart uses class `btn-addtocart` for Gelato Personalizer

## Develop

```bash
# From repo root — set your store
cd apps/shopify-theme
shopify theme dev --store YOUR-STORE.myshopify.com
shopify theme push --store YOUR-STORE.myshopify.com
```

See [docs/shopify-gelato-migration.md](../../docs/shopify-gelato-migration.md).
