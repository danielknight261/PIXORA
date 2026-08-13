# Domain cutover checklist (Phase 5)

Production storefront: **Shopify + Gelato** ([migration runbook](./shopify-gelato-migration.md)).

## Before cutover

- [ ] Theme published (`apps/shopify-theme` pushed)
- [ ] Gelato Personalizer app embed enabled
- [ ] Canvas + mug personalized products live; mockups verified
- [ ] Test order completed (Shopify test mode → Gelato)
- [ ] `NEXT_PUBLIC_SHOPIFY_STORE_URL` set on any remaining redirect hosting

## DNS

1. Shopify Admin → **Settings → Domains** → Connect existing domain.
2. At your DNS host, add the A/CNAME records Shopify shows.
3. Wait for SSL / primary domain to become active.

## Pause legacy Next.js hosting

1. Vercel (or host) → pause/delete the `@pixora/web` production deployment.
2. Optional: keep a short-lived redirect deploy with `NEXT_PUBLIC_SHOPIFY_STORE_URL=https://your-custom-domain`.
3. Stop advertising `localhost:3000` / old app URLs.

## After cutover

- [ ] Homepage loads on custom domain (Shopify theme)
- [ ] Personalize → Gelato mockup works on mug and canvas
- [ ] Checkout completes; order visible in Gelato
- [ ] Update any marketing links / Google Business / social bios

## Rollback

Revert DNS to previous host only if Shopify is unavailable. Do **not** re-enable the Fabric editor — it has been removed from the repo.
