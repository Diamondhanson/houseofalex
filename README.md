# House of Alex — B2B Wholesale Liquidation Portal

A modern, corporate B2B storefront for selling **bulk merchandise by the pallet** —
perfumes, cosmetics and footwear. Buyers browse ready-to-ship pallets, add them to a
cart, and submit an order that returns a **manual proforma invoice** (no online
payment). A separate admin console manages pallets and reviews orders.

Built with a clean, light corporate aesthetic — white surfaces, sharp 1px borders, and
a red accent.

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **lucide-react** icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Routes

| Route             | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `/`               | Homepage — hero, categories, featured pallets, process, CTA        |
| `/shop`           | Pallet catalogue — filterable product grid                         |
| `/shop/[id]`      | Pallet detail page (statically generated per pallet)               |
| `/checkout`       | Cart + business/delivery form + "Request Invoice" (no payment)     |
| `/about`          | Company / operations overview                                      |
| `/contact`        | Corporate contact form + support details                           |
| `/admin`          | Management console — orders table + pallet upload/CRUD             |

Storefront routes share a layout (navbar + footer) via the `app/(site)` route group.
`/admin` renders its own management shell.

## Project structure

```
app/
  (site)/            # storefront route group (navbar + footer)
    page.tsx         # homepage
    shop/            # catalogue grid + [id] detail pages
    checkout/        # cart & invoice request
    about/ contact/
  admin/             # admin console (separate layout)
  layout.tsx         # root layout + cart provider
  globals.css        # Tailwind theme (light, red accent)
components/
  layout/            # Navbar, Footer
  shop/              # PalletCard, ShopGrid, PalletPurchasePanel
  admin/             # OrdersTable, PalletsManager, SideSheet
  ui/                # Button, StatusBadge
lib/
  context/           # PalletContext — reactive cart (useReducer)
  data/              # catalog.ts, pallets.ts, orders.ts (dummy data)
  types.ts           # shared domain types
  format.ts, cn.ts   # helpers
```

## State management

The cart is a self-contained React context (`lib/context/PalletContext.tsx`) backed by
`useReducer` — add / remove / set quantity / clear, with derived totals (pallets, units,
cost). No external state library; everything reacts instantly.

## Wiring in a backend later

The app ships with **dummy data and stub handlers** designed to be replaced with real
services without touching the UI:

- **Supabase** — `lib/data/*.ts` exports (`PALLETS`, `CATEGORIES`, `DUMMY_ORDERS`) map
  1:1 onto a `pallets` / `categories` / `orders` schema. Admin create/edit/delete
  handlers (`PalletsManager`) currently update local state and `console.log` the payload
  — swap these for Supabase upserts (and image upload to Storage).
- **Resend** — `handlePlaceOrder()` in `app/(site)/checkout/page.tsx` builds a complete
  `OrderPayload` and logs it to the console. Point it at a server action / route handler
  that emails the trade desk (and a buyer acknowledgement) via Resend.

Both seams are marked in-code with `TODO(supabase)` / `TODO(resend)`.

## Notes

- Product imagery is loaded from Unsplash via plain `<img>` tags (needs internet in dev).
- Admin edits are in-session mock state only — uploaded pallets won't persist to the
  storefront until the Supabase layer is connected.
- This is a **trade-only B2B** flow: no consumer checkout, no payment gateway.
