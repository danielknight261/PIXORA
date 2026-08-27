# Go-live checklist

Storefront is already on **[snappdaddy.com](https://snappdaddy.com)** (theme, logo, GitHub `main`). What’s left is commercial launch: money, fulfilment, legal, then traffic.

Tick boxes in this file as you complete them. Code is not the blocker.

Related: [cutover](./shopify-cutover.md) · [Gelato markets](./gelato-markets.md) · [product publish](./shopify-product-publish.md)

---

## Already done

- [x] Theme published (`apps/shopify-theme` on live **Snapp Daddy**)
- [x] Wordmark + favicon on the storefront
- [x] GitHub `main` matches the live theme
- [x] Custom domain loads Shopify (https://snappdaddy.com)

---

## 1. Prove an order fulfils

Do this before advertising. Canvas **and** mug; UK **and** US if both markets are on.

- [ ] Personalize → mockup → add to basket → checkout (canvas, UK)
- [ ] Same path (mug, UK)
- [ ] Same path (canvas, US) — skip if US is not day-one
- [ ] Same path (mug, US) — skip if US is not day-one
- [ ] Order appears in Shopify
- [ ] Order appears in Gelato
- [ ] Shipping rate is Gelato’s, not a dummy flat rate

If this fails, do not advertise.

---

## 2. Shopify Admin

- [x] Store name is **Snapp Daddy**, not “My Store”
- [ ] Payments on (not leftover Bogus Gateway)
- [ ] Taxes: UK VAT if UK-registered
- [ ] Taxes: US exclusive if selling to the US
- [ ] Market: **GB** (currency + language)
- [ ] Market: **US** if it is on day one (`en-US`)
- [ ] Gelato Personalizer app embed still **ON** after the last theme push
- [ ] Password page **off** if the store should be public

---

## 3. Legal and trust

Footer already links to `/pages/shipping` and Shopify policies. Fill them with real copy.

- [ ] Privacy policy
- [ ] Terms of service
- [ ] Refund policy
- [ ] Shipping policy
- [ ] Shipping page exists (`/pages/shipping`, template **page.shipping**)

---

## 4. Cut over leftovers

- [ ] Pause or delete the old Next.js / `apps/web` Vercel deploy
- [ ] Logo + favicon in Shopify Admin brand settings (emails, checkout, Google)
- [ ] Analytics: Shopify pixel or GA4
- [ ] Order confirmation emails look on-brand

---

## 5. Search and SEO (Admin)

Theme handles titles, descriptions, Open Graph, and product JSON-LD. Catalog copy still lives in Admin.

- [x] Online Store → Preferences: homepage title/description match the brand (theme also falls back if these are blank)
- [x] Each collection has a unique description (not leftover Gelato copy)
- [x] Each product has an SEO title + description in Admin (or leave blank to use theme fallbacks)
- [ ] Google Search Console: file is live at `/google1a4c9afa70d61477.html` — click **Verify**, then submit sitemap (`/sitemap.xml`)
- [ ] Bing Webmaster Tools (optional)
- [ ] Google Business Profile (if you have a public address / brand listing)

---

## 6. Then tell people

Do not run ads until section 1 has succeeded twice.

- [ ] Google Business
- [ ] Instagram / social bios
- [ ] Email signature / newsletters
- [ ] Old marketing URLs updated

---

## Not required for day one

Leave these until after UK (and optional US) is selling.

- EU / DE / FR / other Wave 1+ markets — see [gelato-markets.md](./gelato-markets.md)
- Translate and Adapt for catalog copy in extra languages
- Mobile app
- Old Stripe / Fabric stack (retired)
