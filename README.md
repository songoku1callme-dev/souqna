# Souqna · سوقنا

A culturally warm, trustworthy marketplace for Arabic-speaking communities,
built with **React Native + Expo + TypeScript**. Buyers browse and contact
verified sellers, place orders, and track shipments; sellers list products,
manage incoming orders, and enter shipping/tracking info. Full Arabic / English
support with proper RTL, light/dark/system themes, and a clean, scalable
architecture.

> **Mobile-only product.** Souqna is designed phone-first for iPhone/Android
> phones and iPad/Android tablets. The web build exists only for internal
> development/testing and does **not** drive layout decisions. Screens are
> capped to a centered "device canvas" so the app never stretches like a desktop
> site; tablets use a comfortable readable width with adaptive grids. Verified
> at 390 (iPhone), 412 (Android) and 768 (tablet) widths in both EN and AR.

> This is the **MVP foundation**. It runs end-to-end out of the box using local
> mock data, and is wired to drop straight onto a real Supabase backend.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (optional) configure Supabase — the app runs on mocks without this
cp .env.example .env

# 3. Start the Expo dev server
npm start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with
the **Expo Go** app. The app boots in **mock mode** automatically when no
Supabase credentials are present — no backend required to explore every screen.

### Requirements

- Node.js 20+ (tested on Node 22)
- npm
- For native builds: Xcode (iOS) and/or Android Studio. Expo Go is enough to
  preview on a physical device.

### Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm start`         | Start the Expo dev server          |
| `npm run ios`       | Open in the iOS simulator          |
| `npm run android`   | Open on an Android emulator/device |
| `npm run web`       | Run in the browser                 |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | TypeScript (no emit)               |
| `npm run format`    | Prettier write                     |

---

## Project structure

```
souqna/
├── app/                       # Expo Router routes (file-based navigation)
│   ├── _layout.tsx            # Root: providers, theme, i18n, splash gate
│   ├── index.tsx              # Entry redirect (onboarding vs tabs)
│   ├── (auth)/                # Sign in / sign up / forgot password
│   ├── onboarding/            # Welcome → language → location → role
│   ├── (tabs)/                # Home · Search · Sell · Inbox · Profile
│   ├── listing/[id].tsx       # Product detail
│   ├── seller/[id].tsx        # Public seller profile
│   ├── chat/[id].tsx          # Conversation thread
│   ├── category/[slug].tsx    # Category browse + filters
│   ├── create-listing.tsx     # New listing form
│   ├── seller-onboarding.tsx  # Seller verification form
│   ├── orders/                # Buyer: orders list + order detail (tracking)
│   ├── seller-orders/         # Seller: incoming orders + order management
│   ├── saved.tsx              # Saved / favorited items
│   ├── settings/              # Language + theme selectors
│   └── legal/[doc].tsx        # Terms / privacy / content policy / support
├── src/
│   ├── api/                   # Typed API helpers + React Query hooks
│   ├── components/            # Reusable components (+ ui/, orders/)
│   ├── config/                # env.ts (typed runtime config)
│   ├── data/                  # Local mock/seed data (cities, listings, orders)
│   ├── hooks/                 # useResponsive, useLocale, useBootstrap, …
│   ├── i18n/                  # i18next setup, RTL, en/ar locale files
│   ├── store/                 # Zustand stores (auth, settings, favorites, …)
│   ├── theme/                 # Tokens + ThemeProvider (light/dark/system)
│   └── types/                 # Shared domain types (mirror the DB schema)
└── supabase/
    ├── schema.sql             # RLS-aware Postgres schema
    └── seed.sql               # Reference + demo data
```

---

## What is already working

- **Navigation** — full Expo Router tree: onboarding, auth, 5 main tabs, and
  all detail/flow screens.
- **Internationalization** — Arabic + English, system-language detection on
  first launch, in-app language switch (System / العربية / English), and RTL
  layout flipping for Arabic. All strings come from `src/i18n/locales`.
- **Theming** — light, dark, and system themes via a token-based design system.
- **Onboarding** — value prop, language, country/city (preloaded Syrian
  cities), postal code, and buyer/seller/both role selection.
- **Home / Search / Categories** — search bar, category chips, featured verified
  sellers, newest listings, city selector, trust banners, filters (category,
  city, postal code, price range, condition, verified-only) and sorting.
- **Product detail** — image gallery, price, condition/location/delivery badges,
  seller mini-profile, related listings, favorite + report + contact actions.
- **Seller flow** — verification gate, verification form with status states
  (not submitted / pending / verified / rejected), then create-listing access.
- **Create listing** — full form with image grid, category/condition pickers,
  price + currency, delivery/pickup toggles, and inline validation.
- **Inbox** — conversation list + chat thread with message input, block, and
  report actions.
- **Profile / settings** — account info, language + theme, saved items, my
  listings, seller status, legal pages, sign out.
- **Trust & moderation** — report sheets for listings/users/conversations,
  block action, terms acceptance, content-policy pages, and an admin-/RLS-ready
  data model.
- **Mobile-first responsive layout** — a `useResponsive()` hook + `Screen`
  device-canvas cap content to a centered, phone-width column (≤560px phone /
  ≤760px tablet) so the app never stretches like a website. Listing grids adapt
  2→3 columns on tablets; bottom-tab touch targets and section spacing are tuned
  for phones. Verified at 390 / 412 / 768 in EN and AR (RTL).
- **Order & shipment tracking** — buyers get an **Orders** area (from Profile)
  with an orders list and an order detail screen: status header + ETA, items,
  a tracking card (courier, provider, tracking number, ETA, seller note, and an
  **Open tracking link** CTA), a full RTL-safe status timeline, and a
  **report issue** action. Sellers get an **Incoming orders** area (from Sell)
  to advance status (confirm → preparing → shipped → out for delivery →
  delivered, plus cancel) and attach shipping info. Lifecycle states: `pending`,
  `confirmed`, `preparing`, `shipped`, `out_for_delivery`, `delivered`,
  `cancelled`, `issue_reported`. All labels localized (en + ar).
- **Manual local-courier support** — sellers enter **any** courier/provider name
  by hand; a tracking link alone is a valid signal. No DHL-only or western-only
  carrier logic is hardcoded, so regional/Syrian logistics companies work.
- **UX quality** — skeleton loaders, empty states, toasts, and polished spacing.

## What is mocked

The app ships with a **mock data layer** (`src/data/*` + `src/api/*`) so it runs
with zero configuration:

- **Auth** — sign in/up succeed locally and persist a fake session via
  AsyncStorage. No real email/password verification yet.
- **Listings / sellers / conversations / messages** — served from in-memory
  seed data with simulated network latency, through the same React Query hooks
  that will call Supabase.
- **Image uploads** — picked locally via `expo-image-picker`; not uploaded to
  storage in mock mode.
- **Reports / blocks / verification submission** — acknowledged with toasts and
  local state; not persisted to a server.
- **Orders & shipments** — buyer/seller order flows run on a Zustand store
  (`src/store/ordersStore.ts`) seeded from `src/data/orders.ts` and persisted to
  AsyncStorage. Status updates, shipping info, and issue reports mutate local
  state; the matching `orders` / `order_items` / `order_status_history` /
  `shipments` / `shipment_updates` tables are defined in the schema for live
  wiring. No payments/checkout yet — orders are pre-seeded to demo tracking.

Everything is structured so swapping in Supabase is a matter of implementing the
API helpers in `src/api/` against the client in `src/api/client.ts` — the UI and
hooks do not change.

---

## Connecting Supabase (next steps)

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Apply the schema**: open the SQL editor and run
   [`supabase/schema.sql`](supabase/schema.sql), then optionally
   [`supabase/seed.sql`](supabase/seed.sql) for reference + demo data.
3. **Add credentials** to `.env`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   EXPO_PUBLIC_USE_MOCKS=false
   ```
   When the URL + key are present and `EXPO_PUBLIC_USE_MOCKS` is not `true`, the
   app uses Supabase instead of mocks (see `src/config/env.ts`).
4. **Implement the live API helpers** in `src/api/` (the function signatures and
   return types already match the UI). Auth, listings, conversations, and
   storage uploads are the main integration points.

### Required keys / accounts

| Variable                        | Required | Notes                                                      |
| ------------------------------- | -------- | ---------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | for live | Supabase project URL                                       |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | for live | Supabase anon/public key (safe in the client)              |
| `EXPO_PUBLIC_USE_MOCKS`         | no       | `true` forces mock mode; defaults to mock if creds missing |

No keys are required to run the app in mock mode.

---

## Data model

See [`supabase/schema.sql`](supabase/schema.sql) for the full, RLS-aware schema.
Tables: `profiles`, `user_roles`, `seller_profiles`,
`seller_verification_requests`, `categories`, `listings`, `listing_images`,
`favorites`, `conversations`, `messages`, `reports`, `blocked_users`, `cities`,
`orders`, `order_items`, `order_status_history`, `shipments`,
`shipment_updates`, plus `listing-images` (public) and `verification-docs`
(private) storage buckets. Row Level Security is enabled on every user-facing
table with owner/participant policies and an `is_admin()` helper for moderation.
Orders are visible to their buyer and the fulfilling seller; only the seller (or
an admin) can attach/update shipment + tracking rows.

---

## Tech stack

Expo · React Native · TypeScript · Expo Router · Supabase · TanStack Query ·
Zustand · i18next / react-i18next · expo-localization.
