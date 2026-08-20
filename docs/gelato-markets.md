# Gelato print countries (Shopify Markets)

Snapp Daddy sells through **Shopify Markets** and fulfils with **Gelato**. This file is the Admin checklist the theme cannot do from git.

The theme shows a country-aware delivery line (`snippets/local-print-promise.liquid`):

- **32 Gelato print countries** → “Printed in [country]. Typical delivery 3–7 days.”
- **Other EU/EEA** → “Printed in the EU. Typical delivery 4–8 days.”
- **Everywhere else** → nearest hub, 5–12 days.

China stays in the print-country list (Gelato produces there) but is **not** a localisation or SEO target.

## 32 print ISOs

US, CA, MX, BR, GB, IE, FR, DE, AT, CH, NL, BE, IT, ES, PT, PL, CZ, DK, SE, NO, TR, AE, ZA, AU, NZ, SG, MY, IN, JP, KR, CN.

Not every SKU prints in every hub. Confirm canvas, framed, mugs, etc. on each Gelato catalogue product page before promising 3–7 days for that SKU.

## Wave order

| Wave | Markets | Languages |
| --- | --- | --- |
| **0** | Rename shop from “My Store”; connect custom domain; UK VAT; test order UK **and** US | Theme EN |
| **1** | GB, IE, US, CA, AU, NZ, DE, AT, FR, NL | EN, DE, FR, NL (theme files exist) |
| **2** | IT, ES, PT, BE, CH, SE, DK, NO, PL | IT, ES, PT, PL (theme files exist for IT/ES/PT/PL) |
| **3** | MX, BR, ZA, SG, MY, IN, AE | ES/PT/EN as appropriate |
| **4** | JP, KR, TR, CZ | JA in theme; KO/TR/CS via Translate and Adapt |
| **Skip first** | CN | No `zh` locale in this repo |

Remaining Admin languages (not hand-maintained in git): **cs, da, sv, nb, tr, ko, ar**. Enable them in Translate and Adapt when those markets go live.

## Shopify Admin

### Brand and URLs

1. Settings → Store details: set the store name (not “My Store”).
2. Settings → Domains: connect the primary domain.
3. Markets: use **subfolders** (`/en-gb`, `/en-us`, `/de`, `/fr`, `/pt`, `/ja`, …), not a domain per country.

### Markets

For each print country (or grouped market):

- Local **currency**
- Default **language**
- **Gelato shipping rates** (not a flat fake rate)
- Tax included/excluded correctly (EU VAT-inclusive; US exclusive)

You can group English print countries (GB, IE, US, CA, AU, NZ, SG, MY, IN, ZA) if currency is handled per country inside one market — or split UK / US / AU when pricing diverges.

### Taxes

Turn on as each wave goes live:

- UK VAT if UK-registered
- EU VAT (OSS if you sell across the EU)
- US sales tax (Shopify Tax)
- AU GST, NZ GST
- JP consumption tax, KR, BR as those waves start

### Translate and Adapt

Theme JSON translates **chrome** (buttons, delivery snippet, hub titles). It does **not** translate Shopify **catalog** copy.

For each live language, translate:

- Product titles, descriptions, SEO title/description
- Collection titles and descriptions
- Policy pages (privacy, refund, shipping)
- Homepage section text in the theme editor (hero, how-it-works) — schema defaults stay English on purpose

Use local search terms (*Leinwand*, *toile photo*, *canvas print*), not a literal of “Personalized Canvas Print”.

### Shipping page

1. Online Store → Pages → Add page, handle `shipping`, title from `delivery.heading`.
2. Theme template: **page.shipping** (this repo: `templates/page.shipping.json`).
3. Footer already links to `/pages/shipping`.
4. Translate the page in Translate and Adapt if you add extra body copy; the template already prints the live local-print promise.

### Gelato

- Store connected for all ship-to countries in a wave
- Personalizer app embed on
- Per-SKU “produced in” list checked for JP, KR, BR, MX before ads in those countries

## Theme locales in this repo

| File | Role |
| --- | --- |
| `en.default.json` | Source (UK English) |
| `en-US.json`, `en-CA.json` | Overlays |
| `de.json`, `fr.json`, `es.json`, `it.json`, `nl.json` | Full chrome + delivery |
| `pt.json`, `pl.json`, `ja.json` | Print-country languages (delivery + core chrome; catalog still Translate and Adapt) |

Do **not** add custom `hreflang` in the theme. Shopify injects it via `content_for_header` when Markets and languages are on.

## What this does not do

- Rank in 32 countries (needs translated catalog, domain, long-tail SEO)
- Set Markets, taxes, or Gelato production maps from git
- Localise China
