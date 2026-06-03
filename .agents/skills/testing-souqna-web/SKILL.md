---
name: testing-souqna-web
description: Run the Souqna marketplace app via the Expo web build for end-to-end UI testing in mock OR live (real Supabase auth) mode. Use when verifying onboarding, home/search, product detail, create-listing gate, Arabic/RTL behavior, or the live auth sign-in/sign-out path.
---

# Testing Souqna via Expo web

Souqna targets iOS/Android, but the **Expo web build** is the fastest way to test
UI flows end-to-end in a browser. It can run on the in-app mock data layer
(`src/data/*`) with **zero backend**, or against a live Supabase dev project.

## Setup (one-time per fresh checkout)

Web support is NOT in `package.json` by default (the app ships for mobile). Install
the web-only deps before starting — these are temporary test aids, do not commit them:

```
npx expo install react-dom react-native-web @expo/metro-runtime babel-preset-expo
```

## Critical gotcha: leaked Supabase env vars crash boot (mock mode)

The session shell may inject org secrets `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY` (e.g. leaked from another project). Expo inlines
any `EXPO_PUBLIC_*` var at build time, so the app leaves mock mode, tries live
Supabase, and (on older builds) crashed on boot. **Strip them inline** when
starting Expo for mock testing (a one-off `unset` in a prior shell command does
NOT persist — secrets get re-injected into each new shell):

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
  cached bundle keeps the old inlined values.
- Then navigate the browser to `http://localhost:8081` yourself.

Note: as of PR #4, `src/config/env.ts` validates the URL, so a malformed
`EXPO_PUBLIC_SUPABASE_URL` now degrades to mock mode instead of crashing. To
test that hardening, boot with `EXPO_PUBLIC_SUPABASE_URL="not-a-valid-url"` plus
a key set — the app should still reach mock-mode Home ("Demo mode" banner), no
`Invalid supabaseUrl` crash.

## Live mode (real Supabase auth)

To test the live auth path, **set** the real creds instead of stripping them, and
leave `USE_MOCKS` unset (`env.useMocks` in `src/config/env.ts` flips to live when
a valid URL + key are present):

```
cd <repo>
BROWSER=none CI=1 \
  EXPO_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co" \
  EXPO_PUBLIC_SUPABASE_ANON_KEY="<publishable/anon key>" \
  npx expo start --web --port 8081 --clear
```

- In live mode, Home shows empty skeletons (the dev DB has no listings) and **no**
  "Demo mode" banner — a quick way to confirm you're actually live.
- Sign in via Profile tab → "Sign in". A successful login routes through
  `loadProfileForAuthUser` (`src/api/profileApi.ts`), so the Profile screen shows
  the real `full_name` + email **from the DB**, not a hardcoded value.

### Seeding a confirmed test user (gotcha: GoTrue NULL-token 500)

If the dev project has "Confirm email" ON (default, and its SMTP is rate-limited),
UI signup won't return a session. Easiest path is to insert a user directly into
`auth.users` via SQL. **Critical:** set ALL token columns to empty string `''`,
not NULL — otherwise GoTrue can't scan NULL into Go strings and
`POST /auth/v1/token?grant_type=password` returns `500 Database error querying
schema`. Columns to set to `''`: `confirmation_token`, `recovery_token`,
`email_change`, `email_change_token_new`, `email_change_token_current`,
`phone_change`, `phone_change_token`, `reauthentication_token`. Also set
`email_confirmed_at = now()`. The `handle_new_user` trigger then auto-creates the
`profiles` row + default `buyer` role.

Alternatively, ask the user to disable "Confirm email" (Auth → Providers → Email)
and then a normal UI signup returns a session immediately and sets these columns
for you.

### Verifying session persistence / clearing

Supabase stores the session in localStorage under `sb-<project-ref>-auth-token`;
the app also persists the user in `souqna.auth` (Zustand persist). Useful checks
in the browser console:

```
Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('auth-token'))
JSON.parse(localStorage.getItem('souqna.auth')).state.user
```

- After **sign-in**: `sb-...-auth-token` present, `souqna.auth` user = the email.
- After **sign-out**: `sb-...-auth-token` removed, `souqna.auth` user = `null`,
  UI reverts to "You're browsing as a guest" + a logout toast.
- Caveat seen on web: a full page reload (F5) may not always re-hydrate the
  session on localhost; in-app sign-in/out (no reload) is the reliable path to
  test. Page-reload persistence was out of scope for the PR #4 smoke test.

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
  images (picsum), verified badges, and a "Demo mode" banner (mock mode only).
- **Product detail** (`/listing/lst-iphone`): title/price match, 3-image gallery,
  seller mini-profile, related listings, Contact seller / favorite / report.
- **Arabic + RTL**: `/settings/language` → العربية flips the whole app to Arabic
  + RTL instantly (tab bar reorders, text right-aligns, badges read "موثوق",
  cities localize). This is the headline feature — always test it.
- **Sell gate**: `/sell` while signed out shows the login-required state
  ("تسجيل الدخول مطلوب"), not the create-listing form.

## Known pre-existing finding (as of PR #4)

The Profile screen renders **raw i18n keys** for section headers + logout:
`profile.sellingSection`, `profile.activitySection`, `profile.preferencesSection`,
`profile.supportSection`, `profile.logout`, `profile.loggedOut`. Root cause:
`app/(tabs)/profile.tsx` (rewritten in PR #3) references keys missing from
`src/i18n/locales/{en,ar}.json`. Cosmetic; rows still function. Don't flag as a
regression of later PRs unless those locale files change.

## Devin Secrets Needed

- **Mock-mode testing**: none. The app runs entirely on mock data; in fact the
  `EXPO_PUBLIC_SUPABASE_*` vars must be **removed** from the Expo process.
- **Live-mode testing**: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  (client-safe public values for the dev project). Never use the service-role key
  in the app or any `EXPO_PUBLIC_*` var. Seeding a test user directly in
  `auth.users` requires DB access (SQL editor or a Postgres connection string).
