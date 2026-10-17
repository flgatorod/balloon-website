# To The Balloon and Backdrop — online shop

Etsy-style shop: preset designs, customizable colors/sizes/extras, live price with
Virginia sales tax and distance-based delivery, and secure Stripe checkout that pays
out to the business bank account.

## How it fits together

| Piece | What it does |
|---|---|
| `site/pricing.js` | **The one file to edit.** Products, options, prices, tax rate, delivery zones, lead times, blackout dates. |
| `site/app.js`, `art.js`, `styles.css`, `index.html` | The storefront (no build step). |
| `site/zip-miles.js` | Generated table of ZIP → miles from the home base. |
| `netlify/functions/create-checkout.mjs` | Re-prices the cart on the server and opens Stripe Checkout. Customers can't change prices in their browser. |
| `tests/pricing.test.mjs` | `npm test` — checks the math. |

## Common edits

- **Change a price:** edit the number in `site/pricing.js`, commit. Netlify redeploys in about a minute.
- **Add her photo to a product:** drop the image in `site/images/` (JPG, ~1600px wide) and set
  `image: 'images/your-file.jpg'` on that product. Without a photo, the site draws an illustration in the customer's chosen colors.
- **Block a date:** add it to `blackoutDates`, e.g. `['2026-12-24', '2026-12-25']`.
- **Change the pickup/delivery base:** set `baseZip`, then run `npm install && npm run zips` and commit `site/zip-miles.js`.

## Going live (one time, ~20 minutes)

1. **Stripe:** create an account at stripe.com for *To The Balloon and Backdrop, LLC* with the LLC's EIN and business bank account.
   Turn on email receipts (Settings → Customer emails) and payment notifications for her email.
2. **Netlify:** sign in with GitHub at netlify.com → *Add new site* → *Import from GitHub* → pick `balloon-website`. Leave build settings as-is (they come from `netlify.toml`).
3. In Netlify → *Site configuration → Environment variables*, add `STRIPE_SECRET_KEY` = the **test** secret key (`sk_test_…`).
4. Place a test order with card `4242 4242 4242 4242`, any future date, any CVC. Confirm it shows in Stripe with the event date, address and item details.
5. Swap in the **live** key (`sk_live_…`) and redeploy.
6. Optional: connect a custom domain in Netlify (Domain management).

New orders show in the Stripe dashboard/app with event date, time window, address, notes and each item's customizations under *Metadata*.

## Open items before launch

- Confirm with the CPA: sales tax treatment for decor + installation (currently 6% on items, delivery untaxed), and that Northern VA's 6% applies to all deliveries.
- Confirm prices against her material costs and time.
- Replace illustrations with her photos.
