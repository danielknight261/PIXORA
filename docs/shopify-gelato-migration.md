# Shopify + Gelato Migration Runbook (Option A)

Snapp Daddy’s production storefront is **Shopify + Gelato**. The Next.js shop, Fabric editor, and custom mockup engine are retired.

## Phase 1 — Store + Gelato (do this first)

### 1. Create or open a Shopify store

1. Go to [shopify.com](https://www.shopify.com) → Start free trial / log in.
2. Store name: **Snapp Daddy**.
3. Note your store URL: `https://YOUR-STORE.myshopify.com`.

### 2. Install Gelato

1. In Shopify Admin → **Apps** → search **Gelato: Print on Demand**.
2. Install and connect your existing Gelato account (same API key account you used in Pixora admin).
3. Guide: [Getting started with Shopify](https://support.gelato.com/en/articles/8996022-getting-started-with-shopify).

### 3. Personalization Studio / Gelato+

1. In Gelato dashboard, confirm **Personalization Studio** / **Gelato+** is available (advanced personalization is typically on Gelato+).
2. In Shopify: **Online Store → Themes → Customize → App embeds**.
3. Enable **Gelato Personalizer** and Save.
4. Guide: [Set up Personalization Studio](https://support.gelato.com/en/articles/8996330-how-to-set-up-gelato-s-personalization-studio-on-shopify).

### 4. Staging URL

Use `YOUR-STORE.myshopify.com` until DNS cutover. Set this URL in:

- `apps/web/.env.local` → `NEXT_PUBLIC_SHOPIFY_STORE_URL=https://snappdaddy.com`
- Root `.env` / hosting env if the redirect app is deployed

Store in use: **https://snappdaddy.com**

Personalizer steps: [gelato-personalizer-enable.md](./gelato-personalizer-enable.md)

---

## Phase 2 — Theme

Theme source: [`apps/shopify-theme/`](../apps/shopify-theme/).

```bash
# Install Shopify CLI (once)
npm install -g @shopify/cli @shopify/theme

cd apps/shopify-theme
shopify theme push --store YOUR-STORE.myshopify.com
# or development preview:
shopify theme dev --store YOUR-STORE.myshopify.com
```

After push:

1. Set the theme as **Published** (or Preview first).
2. Confirm App embed **Gelato Personalizer** is still on.
3. Product pages include the Gelato customization hook (see theme `snippets/gelato-customization.liquid`).

---

## Phase 3 — Publish products (Gelato → Shopify)

Do **not** use Pixora’s old Gelato catalog import. Publish from Gelato into Shopify.

### First SKUs (smoke test)

1. Open Gelato app inside Shopify (or Gelato dashboard → Stores).
2. Create **1 canvas** (slim wrap) with a personalized **image** layer.
3. Create **1 mug** with a personalized **image** layer.
4. Choose **Shopify in-page personalization** or **Editor personalization** so customers get live Gelato mockups.
5. Publish to Shopify.
6. Guide: [Create Shopify personalization products](https://support.gelato.com/en/articles/8996332-how-to-create-shopify-personalization-products).

### Smoke test checklist

- [ ] Product page shows Personalize / Gelato UI
- [ ] Upload a photo → **live mockup on canvas**
- [ ] Upload a photo → **live mockup on mug**
- [ ] Add to cart → checkout (use Shopify Bogus Gateway / test mode)
- [ ] Order appears in Gelato for fulfilment

### Expand catalog

After smoke test, publish remaining slim-wrap canvas sizes/orientations and all mug colours/sizes from Gelato (same catalog you previously synced into Pixora).

Create Shopify collections: **Canvas prints**, **Mugs**.

---

## Phase 4 — Engine removed (already done in repo)

Retired from production use:

- Fabric editor + mockup compositor
- Shop/editor routes in `apps/web`
- Pixora Gelato catalog import/sync for custom storefront

`apps/web` now redirects to `NEXT_PUBLIC_SHOPIFY_STORE_URL`.

---

## Phase 5 — Domain cutover

Full checklist: [shopify-cutover.md](./shopify-cutover.md).

1. Shopify Admin → **Settings → Domains** → connect `pixora` apex/www.
2. Update DNS at your registrar (Shopify shows required A/CNAME records).
3. Pause or delete the Vercel (or other) project for `@pixora/web`.
4. Update `NEXT_PUBLIC_SHOPIFY_STORE_URL` to the custom domain (optional if redirect app is retired).
5. Place a real Gelato test order on production.

### Troubleshooting Personalizer button

If “Personalize design” is missing:

- Theme must include `<div data-gelato-customization="1"></div>` (theme snippet handles this).
- Add to Cart should include class `btn-addtocart` (theme product form does this).
- Re-save the product in Shopify Admin after enabling Personalizer.
- See [Gelato theme troubleshooting](https://support.gelato.com/en/articles/8996439-what-should-i-do-if-the-personalize-design-button-doesn-t-show-in-your-shopify-store).

---

## Success criteria

- Customers personalize on Shopify with **Gelato’s native product mockups** (especially mugs).
- Orders flow Shopify → Gelato without Pixora Order API.
- No production dependency on Fabric / `mockup-compositor.ts` / Pixora catalog sync.
