# Souqna · سوقنا

A culturally warm, trustworthy marketplace for Arabic-speaking communities,
built with **React Native + Expo + TypeScript**. Buyers browse and contact
verified sellers; sellers list products after a verification flow. Full Arabic
/ English support with proper RTL, light/dark/system themes, and a clean,
scalable architecture.

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
│   ├── saved.tsx              # Saved / favorited items
│   ├── settings/              # Language + theme selectors
│   └── legal/[doc].tsx        # Terms / privacy / content policy / support
├── src/
│   ├── api/                   # Typed API helpers + React Query hooks
│   ├── components/            # Reusable components (+ ui/ design system)
│   ├── config/                # env.ts (typed runtime config)
│   ├── data/                  # Local mock/seed data (cities, listings, …)
│   ├── hooks/                 # useLocale, useBootstrap, …
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
plus `listing-images` (public) and `verification-docs` (private) storage buckets.
Row Level Security is enabled on every user-facing table with owner/participant
policies and an `is_admin()` helper for moderation.

---

## Tech stack

Expo · React Native · TypeScript · Expo Router · Supabase · TanStack Query ·
Zustand · i18next / react-i18next · expo-localization.
