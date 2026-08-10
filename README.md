# AXIONIK — Shoppers Stop WiFi Retail Platform

A simple, all-JavaScript rewrite of the AXIONIK captive-portal + retail dashboard system.
Backend is Node.js/Express + Supabase (no Firebase, no Python). Both frontends are the
React/Vite apps you already had — untouched except for a fixed, configurable API URL.

## Structure

```
axionik/
├── server/              ← Node.js/Express + Supabase API (deploy to Render)
├── captive-portal-app/  ← Customer WiFi sign-in portal (React/Vite, deploy to Vercel)
├── dashboard-app/       ← Store manager dashboard (React/Vite, deploy to Vercel — or served by the API)
├── mobile-app/           ← Flutter mobile app (unrelated to the JS rewrite — build/run separately)
├── firmware/             ← ESP32 captive-portal firmware (Arduino/C++ — flash separately)
├── docs/                 ← Supabase schema references (Shoppers Stop + Marketplace)
├── render.yaml           ← Render blueprint for the backend
└── package.json           ← npm workspaces root (server + captive-portal-app + dashboard-app only)
```

`mobile-app/` and `firmware/` are standalone projects copied in as-is for convenience —
they're not part of the npm workspace and don't affect `npm install`/`npm run build` at
the root. See `mobile-app/README.md` and `firmware/README.md` for their own setup steps.

## 1. Local setup

```bash
npm install                       # installs all 3 workspaces at once
cp server/.env.example server/.env
# then edit server/.env with your Supabase URL + key
```

Without a `.env`, the server still runs — it just falls back to in-memory storage,
which resets whenever the server restarts. Good enough for quick local testing.

Run each piece in its own terminal:

```bash
npm run dev:server      # API on http://localhost:8000
npm run dev:portal      # captive portal on http://localhost:3000
npm run dev:dashboard   # dashboard on a Vite dev port (check terminal output)
```

Both frontends read `VITE_API_URL` to know where the backend lives. Locally they default
to `http://localhost:8000`, so you don't need to set anything to develop. To point a
frontend at a different backend, create a `.env` in that app's folder:

```
VITE_API_URL=http://localhost:8000
```

## 2. Database setup (Supabase)

Run `docs/supabase_schema.sql` (from the original project) in your Supabase project's
SQL editor to create the `customers`, `coupons`, `redemptions`, `orders`, and `feedbacks`
tables. The server also works without this — it just won't persist across restarts.

## 3. Deploy the backend to Render

`render.yaml` is already set up:

1. Push this repo to GitHub.
2. On Render: **New → Blueprint** → point at the repo. It reads `render.yaml` automatically.
3. In the Render dashboard, set the two env vars it asks for: `SUPABASE_URL` and `SUPABASE_KEY`.
4. Render builds with `npm install && npm run build:dashboard`, then starts the server.
   By default the backend also serves the built dashboard at `/`, so this one service
   covers both API + dashboard if you want the simplest setup.

Your live API will be something like `https://axionik-api.onrender.com`.

## 4. Deploy the frontends to Vercel

Each app deploys as its own Vercel project (a `vercel.json` is already in each folder):

- **Captive portal:** New Project → Root Directory: `captive-portal-app` → set env var
  `VITE_API_URL` to your Render URL → Deploy.
- **Dashboard** (optional, if you don't want to rely on the bundled copy from Render):
  New Project → Root Directory: `dashboard-app` → same `VITE_API_URL` → Deploy.

## API reference

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/menu/:storeId` | Store info + offers |
| POST | `/api/customers` | WiFi captive-portal check-in (creates/updates customer, redeems coupon) |
| GET | `/api/customers` | List customers |
| GET | `/api/activity` | Recent visit log |
| GET / POST | `/api/coupons` | List / create coupons |
| GET / POST | `/api/redemptions` | List / create coupon redemptions |
| POST | `/api/order` | Place an order (updates spend, VIP tier, redeems coupon if applicable) |
| GET | `/api/orders` | List orders |
| POST | `/api/feedback` | Submit customer feedback |
| GET | `/api/feedbacks` | List feedback |
| GET | `/api/marketplace/:email` | A customer's Axionik Marketplace activity (movie bookings, restaurant reservations, retail orders) |

## Marketplace activity integration

The dashboard's customer detail modal shows that customer's activity from
Axionik-MarketplacePro (movies, restaurants, retail) — matched by **email**,
since that's what MarketplacePro's booking tools key on.

Set these on the server (`server/.env`, or as Render env vars) to enable it:

```
MARKETPLACE_SUPABASE_URL=...
MARKETPLACE_SUPABASE_KEY=...
```

**Important — verify the table names.** `server/src/routes/marketplace.js` guesses
the Supabase table names (`bookings`, `reservations`, `orders`) based on the MCP
tool schema, since I didn't have direct access to your Marketplace project's actual
schema. If the panel shows a "couldn't read this table" error for any section, open
that file, check the real table names in your Marketplace Supabase project, and
update the `SOURCES` array at the top — everything else adapts automatically.

Also worth double-checking: the key you're using
(`sb_publishable_...`) is a **publishable** key, not the legacy `service_role` JWT.
Publishable keys are subject to Row Level Security — if MarketplacePro's tables
don't have a public-read RLS policy, these queries will return empty rather than
erroring. If the panel stays empty even for a customer you know has bookings, that's
the first thing to check in Supabase (Authentication → Policies on those tables).

## What changed from the original

- Backend rewritten from Python/FastAPI (two overlapping Firebase + Supabase
  implementations) into one clean Express + Supabase service — no service-account
  JSON secrets to manage, matches your existing Supabase-first stack.
- Fixed hardcoded `http://localhost:63265` API calls baked into both frontends —
  these would have silently broken in production regardless of the backend rewrite.
- Removed a leftover hardcoded Windows path and duplicate/dead route definitions
  from the old `main.py`.
