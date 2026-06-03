---
name: testing-souqna-web
description: Run the Souqna marketplace app via the Expo web build for end-to-end UI testing in mock mode. Use when verifying onboarding, home/search, product detail, create-listing gate, or Arabic/RTL behavior.
---

# Testing Souqna via Expo web (mock mode)

Souqna targets iOS/Android, but the **Expo web build** is the fastest way to test
UI flows end-to-end in a browser. It runs fully on the in-app mock data layer
(`src/data/*`) with **zero backend** required.

## Setup (one-time per fresh checkout)

Web support is NOT in `package.json` by default (the app ships for mobile). Install
the web-only deps before starting — these are temporary test aids, do not commit them:

```
npx expo install react-dom react-native-web @expo/metro-runtime babel-preset-expo
```

## Critical gotcha: leaked Supabase env vars crash boot

The session shell may inject org secrets `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY` (e.g. leaked from another project). Expo inlines
any `EXPO_PUBLIC_*` var at build time, so the app leaves mock mode, tries live
Supabase, and crashes on boot with `Invalid supabaseUrl: Must be a valid HTTP or
HTTPS URL` (`src/lib/supabase.ts`). The fix is to **strip them inline** when
starting Expo (a one-off `unset` in a prior shell command does NOT persist —
secrets get re-injected into each new shell):

```
cd <repo>
BROWSER=none CI=1 \
  env -u EXPO_PUBLIC_SUPABASE_URL -u EXPO_PUBLIC_SUPABASE_ANON_KEY \
  EXPO_PUBLIC_USE_MOCKS=true \
  npx expo start --web --port 8081 --clear
```

- `BROWSER=none` — Expo's auto-open-browser step (`browser.sh`) exits non-zero in
  this environment and crashes the CLI; disabling it keeps Metro alive.
- `CI=1` — non-interactive Metro (no key-press prompts).
- `--clear` — clear the Metro cache. **Required after changing env vars**, since a
  cached bundle keeps the old inlined values and the crash persists otherwise.
- Then navigate the browser to `http://localhost:8081` yourself.

If you confirm a fix works, an optional code hardening is to validate
`EXPO_PUBLIC_SUPABASE_URL` in `src/config/env.ts` (or try/catch `createClient`) so
a malformed value degrades to mock mode instead of a hard crash.

## Entry / routing notes

- First run lands on `/onboarding` (welcome → language → location → role). The
  Location step pre-selects Syria/Damascus, so Continue is already enabled.
  Finishing role calls `completeOnboarding()` and routes to `/(tabs)`.
- The `onboardingComplete` flag is persisted (web: localStorage). To re-test
  onboarding, clear site storage or use a fresh browser profile.
- Direct routes work for jumping around: `/(tabs)`, `/sell`, `/settings/language`,
  `/listing/lst-iphone`, etc.
- devinids shift as lists load; prefer direct `navigate` to a route over clicking
  tab-bar items by id when the page has dynamic content.

## Golden-path checks

- **Home**: featured sellers + newest/popular listings render with titles, prices,
  images (picsum), verified badges, and a "Demo mode" banner.
- **Product detail** (`/listing/lst-iphone`): title/price match, 3-image gallery,
  seller mini-profile, related listings, Contact seller / favorite / report.
- **Arabic + RTL**: `/settings/language` → العربية flips the whole app to Arabic
  + RTL instantly (tab bar reorders, text right-aligns, badges read "موثوق",
  cities localize). This is the headline feature — always test it.
- **Sell gate**: `/sell` while signed out shows the login-required state
  ("تسجيل الدخول مطلوب"), not the create-listing form.

## Devin Secrets Needed

None. The app runs entirely on mock data; no secrets are required for testing.
In fact, the relevant secrets (`EXPO_PUBLIC_SUPABASE_*`) must be **removed** from
the Expo process for mock-mode testing to work.
