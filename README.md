# Cadre — Backend Scaffold (Phase 8.1)

This adds a lightweight Vercel serverless backend structure alongside the
existing static frontend (`index.html`, `configurator.html`,
`customer-details.html`, `checkout.html`, and their CSS/JS). **The
frontend has not been touched** — no HTML, CSS, or JS behaviour changed.

Nothing here talks to Supabase, Cloudinary, or Cashfree yet. This phase
only lays out where that code will live and how it will be configured.

## Folder structure

```
/api                        Vercel serverless functions (one file = one route)
  health.js                 GET  /api/health    → reports which env vars are missing
  orders.js                 POST /api/orders     → 501 placeholder (Supabase, later)
  upload.js                 POST /api/upload     → 501 placeholder (Cloudinary, later)
  payment.js                POST /api/payment    → 501 placeholder (Cashfree, later)
  webhooks/
    cashfree.js              POST /api/webhooks/cashfree → 501 placeholder (later)

/services                   One module per third-party provider.
  supabaseService.js         createOrder / getOrderById / updateOrderStatus (stubs)
  cloudinaryService.js       uploadImage / deleteImage (stubs)
  cashfreeService.js         createPaymentSession / verifyWebhookSignature (stubs)

/config                     Environment-driven settings only — no client init, no secrets.
  supabase.js
  cloudinary.js
  cashfree.js
  index.js                   re-exports everything above

/utils                      Small, provider-agnostic helpers.
  response.js                sendSuccess / sendError — consistent JSON shape
  validate.js                shared validation rules (mirrors customer-details.js)
  env.js                      getEnv / getMissingEnv

.env.example                 Every variable the routes above will need — no real values.
vercel.json                   Marks /api/**/*.js as Node 18 serverless functions.
package.json                  Backend manifest. Dependencies are empty on purpose.
```

## Why nothing is implemented yet

Per this phase's scope, `services/*` methods intentionally `throw new
Error('... is not implemented yet.')`, and the `/api` routes intentionally
return `501 Not Implemented`. This keeps the frontend fully functional
(it doesn't call any of these routes yet) while giving the next phase a
clear, already-wired place to add real logic.

## What a future phase will do here

1. Add `@supabase/supabase-js` and `cloudinary` as real dependencies.
2. Fill in `services/supabaseService.js` to persist orders, and
   `services/cloudinaryService.js` to upload customer photos.
3. Fill in `services/cashfreeService.js` to create payment sessions and
   verify webhook signatures.
4. Wire `configurator.js` / `checkout.js` to call these `/api` routes
   instead of (or in addition to) `sessionStorage`.
5. Set the real values from `.env.example` in Vercel's environment
   variables — never in source control.

## Local development

```bash
cp .env.example .env.local   # fill in real values only in your local file
vercel dev                   # runs both static frontend and /api functions
```

`GET /api/health` will respond with which provider variables are still
missing, without ever revealing their values — safe to call anytime.
